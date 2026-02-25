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
  private readonly demoMode: boolean;
  private demoInstances: Map<string, AdvisorInstance> = new Map();
  
  private readonly config = {
    apiToken: process.env.NORTHFLANK_API_TOKEN!,
    baseUrl: 'https://api.northflank.com/v1',
    projectId: 'advisorclaw',
    buildServiceId: 'advisorclaw'
  };

  constructor() {
    this.demoMode = process.env.DEMO_MODE === 'true';

    if (this.demoMode) {
      this.logger.info('NorthflankService running in DEMO MODE - no real API calls will be made');
    } else if (!this.config.apiToken) {
      this.logger.error('NORTHFLANK_API_TOKEN is not set. Northflank API calls will fail.');
    }

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
        const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        this.logger.error(`Northflank API Error: ${error.response?.status} - ${detail}`);
        return Promise.reject(error);
      }
    );
  }

  private extractErrorMessage(error: any): string {
    if (error.response?.data) {
      const data = error.response.data;
      return data.error?.message || data.message || JSON.stringify(data);
    }
    return error.message || String(error);
  }

  async getBuildStatus(): Promise<{ status: string; builds: NorthflankBuild[] }> {
    if (this.demoMode) {
      return {
        status: 'SUCCESS',
        builds: [{
          id: 'demo-build-001',
          status: 'SUCCESS',
          branch: 'master',
          sha: 'demo000000000000000000000000000000000000',
          createdAt: new Date().toISOString(),
          concludedAt: new Date().toISOString()
        }]
      };
    }

    try {
      const serviceResponse = await this.client.get(
        `/projects/${this.config.projectId}/services/${this.config.buildServiceId}`
      );
      
      const buildStatus = serviceResponse.data.data.status?.build?.status || 'UNKNOWN';
      
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
        builds: builds.slice(0, 5)
      };
    } catch (error) {
      this.logger.error('Error fetching build status:', error);
      throw new Error(`Failed to fetch build status: ${this.extractErrorMessage(error)}`);
    }
  }

  async createAdvisorInstance(config: AdvisorInstanceConfig): Promise<AdvisorInstance> {
    if (this.demoMode) {
      const instance: AdvisorInstance = {
        id: `demo-${config.advisorId}`,
        name: config.name,
        subdomain: config.subdomain,
        status: 'running',
        createdAt: new Date().toISOString(),
        lastActivity: 'Just created (demo)',
        skillsEnabled: config.skills,
        storageUsed: 0,
        monthlyUsage: { tokens: 0, cost: 0 }
      };
      this.demoInstances.set(instance.id, instance);
      this.logger.info(`[DEMO] Created advisor instance: ${instance.id}`);
      return instance;
    }

    try {
      const buildStatus = await this.getBuildStatus();
      if (buildStatus.status !== 'SUCCESS') {
        throw new Error('No successful build available. Please wait for the current build to complete.');
      }

      const resourceConfig = this.getTierResourceConfig(config.tier);

      const servicePayload = {
        name: `advisor-${config.advisorId}`,
        billing: {
          deploymentPlan: resourceConfig.plan
        },
        deployment: {
          instances: 1,
          docker: {
            configType: 'default'
          },
          storage: {
            ephemeralStorage: {
              storageSize: resourceConfig.ephemeralStorage
            }
          },
          internal: {
            id: this.config.buildServiceId,
            branch: 'main',
            buildSHA: 'latest'
          },
          resources: {
            cpu: resourceConfig.cpu,
            memory: resourceConfig.memory
          }
        },
        runtimeEnvironment: {
          ANTHROPIC_API_KEY: config.anthropicApiKey,
          ADVISOR_ID: config.advisorId,
          ADVISOR_NAME: config.name,
          ADVISOR_EMAIL: config.email,
          ADVISOR_COMPANY: config.company,
          SKILLS_ENABLED: config.skills.join(','),
          FA_MODE: 'enabled',
          BRAND: 'ForgeClaw',
          TIER: config.tier,
          CUSTOM_DOMAIN: `${config.subdomain}.forgeclaw.com`,
          ...this.getSkillEnvironmentVars(config.skills, config.tier)
        }
      };

      this.logger.info(`Creating advisor deployment with SMALL resources:`, {
        plan: resourceConfig.plan,
        ephemeralStorage: resourceConfig.ephemeralStorage,
        cpu: resourceConfig.cpu,
        memory: resourceConfig.memory
      });

      const response = await this.client.post(
        `/projects/${this.config.projectId}/services/deployment`,
        servicePayload
      );

      const service = response.data.data;
      this.logger.info(`Created advisor instance: ${service.id}`);

      return {
        id: service.id,
        name: config.name,
        subdomain: config.subdomain,
        status: 'updating',
        createdAt: new Date().toISOString(),
        lastActivity: 'Just created',
        skillsEnabled: config.skills,
        storageUsed: 0,
        monthlyUsage: { tokens: 0, cost: 0 }
      };
    } catch (error) {
      this.logger.error('Error creating advisor instance:', error);
      throw new Error(`Failed to create advisor instance: ${this.extractErrorMessage(error)}`);
    }
  }

  private getTierResourceConfig(tier: string): {
    plan: string;
    cpu: string;
    memory: number;
    ephemeralStorage: number;
  } {
    switch (tier) {
      case 'enterprise':
        return {
          plan: 'nf-compute-50',
          cpu: '0.5',
          memory: 2048,
          ephemeralStorage: 1536 // 1.5GB - REDUCED from previous version
        };
      case 'professional':
        return {
          plan: 'nf-compute-20',
          cpu: '0.25',
          memory: 1536,
          ephemeralStorage: 1024 // 1GB - REDUCED
        };
      default: // core
        return {
          plan: 'nf-compute-10',
          cpu: '0.1',
          memory: 1024,
          ephemeralStorage: 512 // 512MB - MUCH SMALLER for core tier
        };
    }
  }

  private getSkillEnvironmentVars(skills: string[], tier: string): Record<string, string> {
    const skillVars: Record<string, string> = {};
    
    if (skills.includes('weather')) skillVars.WEATHER_API_ENABLED = 'true';
    if (skills.includes('web-search')) skillVars.WEB_SEARCH_ENABLED = 'true';
    if (skills.includes('email')) skillVars.EMAIL_ENABLED = 'true';
    if (skills.includes('calendar')) skillVars.CALENDAR_ENABLED = 'true';
    
    if (tier === 'enterprise') {
      skillVars.ADVANCED_REASONING = 'true';
      skillVars.CUSTOM_INTEGRATIONS = 'true';
    }
    if (tier === 'professional' || tier === 'enterprise') {
      skillVars.MEMORY_PERSISTENCE = 'true';
    }
    
    return skillVars;
  }

  // Placeholder methods for other functions
  async listAdvisorInstances(): Promise<AdvisorInstance[]> { return []; }
  async getAdvisorInstance(id: string): Promise<AdvisorInstance | null> { return null; }
  async deleteAdvisorInstance(id: string): Promise<void> {}
  async updateAdvisorSkills(id: string, skills: string[]): Promise<void> {}
  async triggerBuild(): Promise<{ buildId: string; status: string }> { return { buildId: 'test', status: 'SUCCESS' }; }
  private mapServiceStatus(status: any): 'running' | 'stopped' | 'updating' | 'failed' { return 'running'; }
}
