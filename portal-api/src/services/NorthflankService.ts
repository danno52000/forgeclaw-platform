import axios, { AxiosInstance } from 'axios';
import { createLogger } from 'winston';

interface AdvisorInstanceConfig {
  advisorId: string;
  name: string;
  subdomain: string;
  email: string;
  company: string;
  anthropicApiKey: string;
  skills: string[];
  tier: 'core' | 'professional' | 'enterprise';
}

interface NorthflankBuild {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILURE';
  branch: string;
  sha: string;
  createdAt: string;
  concludedAt?: string;
}

interface AdvisorInstance {
  id: string;
  name: string;
  subdomain: string;
  status: 'running' | 'stopped' | 'updating' | 'failed';
  createdAt: string;
  lastActivity: string;
  skillsEnabled: string[];
  storageUsed: number;
  monthlyUsage: {
    tokens: number;
    cost: number;
  };
}

export class NorthflankService {
  private client: AxiosInstance;
  private logger = createLogger({ level: 'info' });
  
  private readonly config = {
    apiToken: process.env.NORTHFLANK_API_TOKEN!,
    baseUrl: 'https://api.northflank.com/v1',
    projectId: 'advisorclaw',
    buildServiceId: 'advisorclaw'
  };

  constructor() {
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        this.logger.info(`Northflank API: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error) => {
        this.logger.error(`Northflank API Error: ${error.response?.status} - ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get current build status of the OpenClaw template
   */
  async getBuildStatus(): Promise<{ status: string; builds: NorthflankBuild[] }> {
    try {
      // Get service status
      const serviceResponse = await this.client.get(
        `/projects/${this.config.projectId}/services/${this.config.buildServiceId}`
      );
      
      const buildStatus = serviceResponse.data.data.status?.build?.status || 'UNKNOWN';
      
      // Try to get recent builds (this endpoint may not exist)
      let builds: NorthflankBuild[] = [];
      try {
        const buildsResponse = await this.client.get(
          `/projects/${this.config.projectId}/services/${this.config.buildServiceId}/builds`
        );
        builds = buildsResponse.data.data || [];
      } catch (error) {
        this.logger.warn('Could not fetch builds list:', error);
      }

      return {
        status: buildStatus,
        builds: builds.slice(0, 5) // Latest 5 builds
      };
    } catch (error) {
      this.logger.error('Error fetching build status:', error);
      throw new Error('Failed to fetch build status');
    }
  }

  /**
   * Trigger a new build of the OpenClaw template
   */
  async triggerBuild(): Promise<{ buildId: string; status: string }> {
    try {
      const response = await this.client.post(
        `/projects/${this.config.projectId}/services/${this.config.buildServiceId}/build`,
        { branch: 'master' }
      );

      const build = response.data.data;
      this.logger.info(`Triggered new build: ${build.id}`);
      
      return {
        buildId: build.id,
        status: build.status
      };
    } catch (error) {
      this.logger.error('Error triggering build:', error);
      throw new Error('Failed to trigger build');
    }
  }

  /**
   * Create a new advisor instance
   */
  async createAdvisorInstance(config: AdvisorInstanceConfig): Promise<AdvisorInstance> {
    try {
      // Get the latest successful build
      const buildStatus = await this.getBuildStatus();
      if (buildStatus.status !== 'SUCCESS') {
        throw new Error('No successful build available. Please wait for the current build to complete.');
      }

      // Create deployment service for the advisor
      const servicePayload = {
        name: `advisor-${config.advisorId}`,
        billing: {
          deploymentPlan: this.getTierResourcePlan(config.tier)
        },
        deployment: {
          instances: 1,
          docker: {
            configType: 'default'
          },
          storage: {
            ephemeralStorage: {
              storageSize: this.getTierStorageSize(config.tier)
            }
          }
        },
        runtimeEnvironment: [
          { name: 'ANTHROPIC_API_KEY', value: config.anthropicApiKey },
          { name: 'ADVISOR_ID', value: config.advisorId },
          { name: 'ADVISOR_NAME', value: config.name },
          { name: 'ADVISOR_EMAIL', value: config.email },
          { name: 'ADVISOR_COMPANY', value: config.company },
          { name: 'SKILLS_ENABLED', value: config.skills.join(',') },
          { name: 'FA_MODE', value: 'enabled' },
          { name: 'BRAND', value: 'ForgeClaw' },
          { name: 'TIER', value: config.tier },
          { name: 'CUSTOM_DOMAIN', value: `${config.subdomain}.forgeclaw.com` }
        ],
        internal: {
          id: this.config.buildServiceId,
          branch: 'master',
          buildSHA: 'latest'
        }
      };

      const response = await this.client.post(
        `/projects/${this.config.projectId}/services/deployment`,
        servicePayload
      );

      const service = response.data.data;
      this.logger.info(`Created advisor instance: ${service.id}`);

      // Set up custom domain
      await this.createCustomDomain(config.subdomain, service.id);

      return {
        id: service.id,
        name: config.name,
        subdomain: config.subdomain,
        status: 'updating',
        createdAt: new Date().toISOString(),
        lastActivity: 'Just created',
        skillsEnabled: config.skills,
        storageUsed: 0,
        monthlyUsage: {
          tokens: 0,
          cost: 0
        }
      };
    } catch (error) {
      this.logger.error('Error creating advisor instance:', error);
      throw new Error(`Failed to create advisor instance: ${error}`);
    }
  }

  /**
   * Create custom domain for advisor
   */
  private async createCustomDomain(subdomain: string, serviceId: string): Promise<void> {
    try {
      const domainPayload = {
        name: `${subdomain}.forgeclaw.com`,
        type: 'subdomain',
        parentDomain: 'forgeclaw.com',
        serviceId: serviceId,
        port: 18789
      };

      await this.client.post(
        `/projects/${this.config.projectId}/domains`,
        domainPayload
      );

      this.logger.info(`Created custom domain: ${subdomain}.forgeclaw.com`);
    } catch (error) {
      this.logger.warn(`Failed to create custom domain: ${error}`);
      // Don't throw - instance can still work without custom domain
    }
  }

  /**
   * Update advisor skills
   */
  async updateAdvisorSkills(advisorServiceId: string, skills: string[]): Promise<void> {
    try {
      const updatePayload = {
        runtimeEnvironment: [
          { name: 'SKILLS_ENABLED', value: skills.join(',') }
        ]
      };

      await this.client.post(
        `/projects/${this.config.projectId}/services/${advisorServiceId}/deployment`,
        updatePayload
      );

      this.logger.info(`Updated skills for advisor ${advisorServiceId}:`, skills);
    } catch (error) {
      this.logger.error('Error updating advisor skills:', error);
      throw new Error('Failed to update advisor skills');
    }
  }

  /**
   * Get advisor instance details
   */
  async getAdvisorInstance(serviceId: string): Promise<AdvisorInstance | null> {
    try {
      const response = await this.client.get(
        `/projects/${this.config.projectId}/services/${serviceId}`
      );

      const service = response.data.data;
      const envVars = service.runtimeEnvironment || [];
      
      const getEnvValue = (name: string) => {
        const envVar = envVars.find((env: any) => env.name === name);
        return envVar?.value || '';
      };

      const skillsEnabled = getEnvValue('SKILLS_ENABLED').split(',').filter(Boolean);

      return {
        id: service.id,
        name: getEnvValue('ADVISOR_NAME'),
        subdomain: getEnvValue('CUSTOM_DOMAIN').replace('.forgeclaw.com', ''),
        status: this.mapServiceStatus(service.status),
        createdAt: service.createdAt,
        lastActivity: 'Unknown', // Would need additional API call to get this
        skillsEnabled,
        storageUsed: 0, // Would need metrics API
        monthlyUsage: {
          tokens: 0, // Would need usage API
          cost: 0
        }
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      this.logger.error('Error fetching advisor instance:', error);
      throw new Error('Failed to fetch advisor instance');
    }
  }

  /**
   * List all advisor instances
   */
  async listAdvisorInstances(): Promise<AdvisorInstance[]> {
    try {
      const response = await this.client.get(
        `/projects/${this.config.projectId}/services`
      );

      const services = response.data.data.services || [];
      const advisorServices = services.filter((service: any) => 
        service.name.startsWith('advisor-')
      );

      const instances: AdvisorInstance[] = [];
      for (const service of advisorServices) {
        const instance = await this.getAdvisorInstance(service.id);
        if (instance) {
          instances.push(instance);
        }
      }

      return instances;
    } catch (error) {
      this.logger.error('Error listing advisor instances:', error);
      throw new Error('Failed to list advisor instances');
    }
  }

  /**
   * Delete advisor instance
   */
  async deleteAdvisorInstance(serviceId: string): Promise<void> {
    try {
      await this.client.delete(
        `/projects/${this.config.projectId}/services/${serviceId}`
      );

      this.logger.info(`Deleted advisor instance: ${serviceId}`);
    } catch (error) {
      this.logger.error('Error deleting advisor instance:', error);
      throw new Error('Failed to delete advisor instance');
    }
  }

  // Helper methods
  private getTierResourcePlan(tier: string): string {
    switch (tier) {
      case 'enterprise': return 'nf-compute-50';
      case 'professional': return 'nf-compute-20';
      default: return 'nf-compute-10';
    }
  }

  private getTierStorageSize(tier: string): number {
    switch (tier) {
      case 'enterprise': return 5120; // 5GB
      case 'professional': return 3072; // 3GB
      default: return 2048; // 2GB
    }
  }

  private mapServiceStatus(status: any): 'running' | 'stopped' | 'updating' | 'failed' {
    const deploymentStatus = status?.deployment?.status;
    const buildStatus = status?.build?.status;
    
    if (buildStatus === 'FAILURE') return 'failed';
    if (deploymentStatus === 'IN_PROGRESS') return 'updating';
    if (deploymentStatus === 'COMPLETED') return 'running';
    if (deploymentStatus === 'FAILED') return 'failed';
    
    return 'stopped';
  }
}
