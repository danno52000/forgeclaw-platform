import { Router } from 'express';
import { NorthflankService } from '../services/NorthflankService';
import Joi from 'joi';
import { createLogger } from 'winston';

const router = Router();
const northflank = new NorthflankService();
const logger = createLogger({ level: 'info' });

// Validation schemas
const createAdvisorSchema = Joi.object({
  // Basic Info
  firstName: Joi.string().required().min(1).max(50),
  lastName: Joi.string().required().min(1).max(50),
  email: Joi.string().email().required(),
  company: Joi.string().required().min(1).max(100),
  phone: Joi.string().allow('').optional(),
  
  // Practice Info  
  practiceType: Joi.string().allow('').optional(),
  aum: Joi.string().allow('').optional(),
  clientCount: Joi.string().allow('').optional(),
  primaryCustodian: Joi.string().allow('').optional(),
  
  // Configuration
  subdomain: Joi.string().required().min(3).max(30).pattern(/^[a-z0-9-]+$/),
  anthropicApiKey: Joi.string().required().min(10),
  selectedPackage: Joi.string().valid("core", "professional", "enterprise").required(),
  additionalSkills: Joi.array().items(Joi.string()).default([]),
  dataRetention: Joi.string().allow('').optional()
});

const updateSkillsSchema = Joi.object({
  skills: Joi.array().items(Joi.string()).required()
});

/**
 * POST /api/advisors
 * Create a new advisor instance
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createAdvisorSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const {
      firstName,
      lastName,
      email,
      company,
      phone,
      practiceType,
      aum,
      clientCount,
      primaryCustodian,
      subdomain,
      anthropicApiKey,
      selectedPackage,
      additionalSkills,
      dataRetention
    } = value;

    // Check if subdomain is already taken
    const existingInstance = await northflank.getAdvisorInstance(`advisor-${subdomain}`);
    if (existingInstance) {
      return res.status(409).json({
        error: 'Subdomain already taken',
        message: `${subdomain}.forgeclaw.com is not available`
      });
    }

    // Generate advisor ID
    const advisorId = `${subdomain}-${Date.now()}`;
    
    // Determine skills based on package + additional
    const packageSkills = getPackageSkills(selectedPackage);
    const allSkills = [...packageSkills, ...additionalSkills];

    // Create advisor instance configuration
    const instanceConfig = {
      advisorId,
      name: `${firstName} ${lastName}`,
      subdomain,
      email,
      company,
      anthropicApiKey,
      skills: allSkills,
      tier: selectedPackage as 'core' | 'professional' | 'enterprise'
    };

    logger.info('Creating advisor instance:', { advisorId, subdomain, package: selectedPackage });

    // Create the instance via Northflank
    const instance = await northflank.createAdvisorInstance(instanceConfig);

    // Store advisor data in database (Supabase integration would go here)
    // await supabase.from('advisors').insert({ ... })

    logger.info('Successfully created advisor instance:', instance.id);

    res.status(201).json({
      success: true,
      advisor: instance,
      message: 'Advisor instance created successfully',
      nextSteps: [
        'Instance is being deployed (2-5 minutes)',
        'You will receive an email when ready',
        `Access your AI at https://${subdomain}.forgeclaw.com`
      ]
    });
  } catch (error) {
    logger.error('Error creating advisor instance:', error);
    res.status(500).json({
      error: 'Failed to create advisor instance',
      message: error.message
    });
  }
});

/**
 * GET /api/advisors
 * List all advisor instances (admin only for now)
 */
router.get('/', async (req, res) => {
  try {
    const instances = await northflank.listAdvisorInstances();
    res.json({
      success: true,
      advisors: instances,
      count: instances.length
    });
  } catch (error) {
    logger.error('Error listing advisor instances:', error);
    res.status(500).json({
      error: 'Failed to list advisor instances',
      message: error.message
    });
  }
});

/**
 * GET /api/advisors/:advisorId
 * Get specific advisor instance details
 */
router.get('/:advisorId', async (req, res) => {
  try {
    const { advisorId } = req.params;
    const instance = await northflank.getAdvisorInstance(advisorId);
    
    if (!instance) {
      return res.status(404).json({
        error: 'Advisor not found',
        advisorId
      });
    }

    res.json({
      success: true,
      advisor: instance
    });
  } catch (error) {
    logger.error('Error fetching advisor instance:', error);
    res.status(500).json({
      error: 'Failed to fetch advisor instance',
      message: error.message
    });
  }
});

/**
 * PUT /api/advisors/:advisorId/skills
 * Update advisor skills
 */
router.put('/:advisorId/skills', async (req, res) => {
  try {
    const { advisorId } = req.params;
    
    // Validate request body
    const { error, value } = updateSkillsSchema.validate(req.body, { stripUnknown: true });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { skills } = value;

    // Update skills via Northflank
    await northflank.updateAdvisorSkills(advisorId, skills);
    
    // Update database record (Supabase integration would go here)
    // await supabase.from('advisors').update({ skills }).eq('id', advisorId)

    logger.info('Updated advisor skills:', { advisorId, skills });

    res.json({
      success: true,
      message: 'Skills updated successfully',
      skills
    });
  } catch (error) {
    logger.error('Error updating advisor skills:', error);
    res.status(500).json({
      error: 'Failed to update advisor skills',
      message: error.message
    });
  }
});

/**
 * DELETE /api/advisors/:advisorId
 * Delete advisor instance
 */
router.delete('/:advisorId', async (req, res) => {
  try {
    const { advisorId } = req.params;
    
    // Delete from Northflank
    await northflank.deleteAdvisorInstance(advisorId);
    
    // Delete from database (Supabase integration would go here)
    // await supabase.from('advisors').delete().eq('id', advisorId)

    logger.info('Deleted advisor instance:', advisorId);

    res.json({
      success: true,
      message: 'Advisor instance deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting advisor instance:', error);
    res.status(500).json({
      error: 'Failed to delete advisor instance',
      message: error.message
    });
  }
});

/**
 * GET /api/advisors/:advisorId/files
 * Get file structure from advisor's VPS (file manager)
 */
router.get('/:advisorId/files', async (req, res) => {
  try {
    const { advisorId } = req.params;
    const { path = '/' } = req.query;
    
    // This would integrate with the OpenClaw file system API
    // For now, return mock structure
    const mockFiles = [
      { name: 'AGENTS.md', type: 'file', size: 1024, modified: '2026-02-21T10:00:00Z' },
      { name: 'SOUL.md', type: 'file', size: 2048, modified: '2026-02-21T09:30:00Z' },
      { name: 'USER.md', type: 'file', size: 512, modified: '2026-02-21T09:00:00Z' },
      { name: 'memory/', type: 'directory', size: null, modified: '2026-02-21T12:00:00Z' },
      { name: 'projects/', type: 'directory', size: null, modified: '2026-02-21T11:00:00Z' },
      { name: 'reports/', type: 'directory', size: null, modified: '2026-02-20T16:00:00Z' }
    ];

    res.json({
      success: true,
      path: path as string,
      files: mockFiles,
      advisorId
    });
  } catch (error) {
    logger.error('Error fetching file structure:', error);
    res.status(500).json({
      error: 'Failed to fetch file structure',
      message: error.message
    });
  }
});

/**
 * Helper function to get skills based on package tier
 */
function getPackageSkills(packageType: string): string[] {
  const skillSets = {
    core: [
      'portfolio-analysis',
      'risk-assessment',
      'market-data',
      'basic-reporting',
      'compliance-templates'
    ],
    professional: [
      'portfolio-analysis',
      'risk-assessment', 
      'market-data',
      'advanced-reporting',
      'compliance-templates',
      'tax-planning',
      'performance-attribution',
      'crm-integration'
    ],
    enterprise: [
      'portfolio-analysis',
      'risk-assessment',
      'market-data', 
      'advanced-reporting',
      'compliance-templates',
      'tax-planning',
      'performance-attribution',
      'crm-integration',
      'esg-screening',
      'alternative-investments',
      'multi-custodian',
      'api-access',
      'white-label-reports'
    ]
  };

  return skillSets[packageType] || skillSets.core;
}

export default router;
