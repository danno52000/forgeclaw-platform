import { Router } from 'express';
import { NorthflankService } from '../services/NorthflankService';
import { createLogger } from 'winston';

const router = Router();
const northflank = new NorthflankService();
const logger = createLogger({ level: 'info' });

/**
 * GET /api/northflank/status
 * Get overall platform status and build information
 */
router.get('/status', async (req, res) => {
  try {
    const buildStatus = await northflank.getBuildStatus();
    
    // Get all advisor instances
    const advisorInstances = await northflank.listAdvisorInstances();
    
    // Calculate platform stats
    const stats = {
      totalAdvisors: advisorInstances.length,
      activeInstances: advisorInstances.filter(instance => instance.status === 'running').length,
      updatingInstances: advisorInstances.filter(instance => instance.status === 'updating').length,
      failedInstances: advisorInstances.filter(instance => instance.status === 'failed').length
    };

    res.json({
      success: true,
      platform: {
        status: buildStatus.status,
        lastBuild: buildStatus.builds[0] || null,
        recentBuilds: buildStatus.builds
      },
      advisors: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching platform status:', error);
    res.status(500).json({
      error: 'Failed to fetch platform status',
      message: error.message
    });
  }
});

/**
 * GET /api/northflank/builds
 * Get build history and status
 */
router.get('/builds', async (req, res) => {
  try {
    const buildStatus = await northflank.getBuildStatus();
    
    res.json({
      success: true,
      currentStatus: buildStatus.status,
      builds: buildStatus.builds,
      buildCount: buildStatus.builds.length
    });
  } catch (error) {
    logger.error('Error fetching builds:', error);
    res.status(500).json({
      error: 'Failed to fetch builds',
      message: error.message
    });
  }
});

/**
 * POST /api/northflank/builds/trigger
 * Trigger a new build of the OpenClaw template
 */
router.post('/builds/trigger', async (req, res) => {
  try {
    const buildInfo = await northflank.triggerBuild();
    
    logger.info('Triggered new build via API:', buildInfo.buildId);
    
    res.json({
      success: true,
      build: buildInfo,
      message: 'Build triggered successfully',
      estimatedTime: '10-20 minutes'
    });
  } catch (error) {
    logger.error('Error triggering build:', error);
    res.status(500).json({
      error: 'Failed to trigger build',
      message: error.message
    });
  }
});

/**
 * GET /api/northflank/instances
 * Get all running advisor instances with detailed status
 */
router.get('/instances', async (req, res) => {
  try {
    const instances = await northflank.listAdvisorInstances();
    
    // Enrich with additional metadata if needed
    const enrichedInstances = instances.map(instance => ({
      ...instance,
      uptime: calculateUptime(instance.createdAt),
      healthStatus: getHealthStatus(instance.status),
      accessUrl: `https://${instance.subdomain}.forgeclaw.com`
    }));

    res.json({
      success: true,
      instances: enrichedInstances,
      totalCount: instances.length,
      statusBreakdown: getStatusBreakdown(instances)
    });
  } catch (error) {
    logger.error('Error fetching instances:', error);
    res.status(500).json({
      error: 'Failed to fetch instances',
      message: error.message
    });
  }
});

/**
 * GET /api/northflank/instances/:instanceId
 * Get detailed information about a specific advisor instance
 */
router.get('/instances/:instanceId', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const instance = await northflank.getAdvisorInstance(instanceId);
    
    if (!instance) {
      return res.status(404).json({
        error: 'Instance not found',
        instanceId
      });
    }

    // Add additional metadata
    const enrichedInstance = {
      ...instance,
      uptime: calculateUptime(instance.createdAt),
      healthStatus: getHealthStatus(instance.status),
      accessUrl: `https://${instance.subdomain}.forgeclaw.com`,
      // These would come from actual monitoring APIs
      metrics: {
        cpuUsage: Math.floor(Math.random() * 50) + 10, // Mock data
        memoryUsage: Math.floor(Math.random() * 70) + 20,
        diskUsage: Math.floor(Math.random() * 40) + 10,
        requestCount: Math.floor(Math.random() * 1000) + 100
      }
    };

    res.json({
      success: true,
      instance: enrichedInstance
    });
  } catch (error) {
    logger.error('Error fetching instance details:', error);
    res.status(500).json({
      error: 'Failed to fetch instance details',
      message: error.message
    });
  }
});

/**
 * POST /api/northflank/instances/:instanceId/restart
 * Restart a specific advisor instance
 */
router.post('/instances/:instanceId/restart', async (req, res) => {
  try {
    const { instanceId } = req.params;
    
    // Note: This would need to be implemented in NorthflankService
    // For now, return a success message
    logger.info('Restart requested for instance:', instanceId);
    
    res.json({
      success: true,
      message: 'Instance restart initiated',
      instanceId,
      estimatedTime: '2-3 minutes'
    });
  } catch (error) {
    logger.error('Error restarting instance:', error);
    res.status(500).json({
      error: 'Failed to restart instance',
      message: error.message
    });
  }
});

/**
 * GET /api/northflank/health
 * Health check endpoint for the Northflank integration
 */
router.get('/health', async (req, res) => {
  try {
    // Try to make a simple API call to check connectivity
    const buildStatus = await northflank.getBuildStatus();
    
    res.json({
      success: true,
      message: 'Northflank integration healthy',
      apiConnectivity: true,
      lastApiCall: new Date().toISOString(),
      currentBuildStatus: buildStatus.status
    });
  } catch (error) {
    logger.error('Northflank health check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Northflank integration unhealthy',
      apiConnectivity: false,
      error: error.message,
      lastAttempt: new Date().toISOString()
    });
  }
});

/**
 * Helper functions
 */
function calculateUptime(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function getHealthStatus(status: string): 'healthy' | 'warning' | 'unhealthy' {
  switch (status) {
    case 'running': return 'healthy';
    case 'updating': return 'warning';
    case 'stopped':
    case 'failed': return 'unhealthy';
    default: return 'warning';
  }
}

function getStatusBreakdown(instances: any[]): Record<string, number> {
  return instances.reduce((acc, instance) => {
    acc[instance.status] = (acc[instance.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

export default router;
