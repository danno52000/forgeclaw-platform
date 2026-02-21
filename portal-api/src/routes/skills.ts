import { Router } from 'express';
import { createLogger } from 'winston';

const router = Router();
const logger = createLogger({ level: 'info' });

// Skills catalog - this would eventually come from a database
const skillsCatalog = [
  // Core FA Skills (Free)
  {
    id: 'portfolio-analysis',
    name: 'Portfolio Analysis',
    description: 'Comprehensive portfolio analysis with asset allocation, performance metrics, and rebalancing recommendations',
    category: 'Core',
    tier: 'core',
    price: 0,
    features: [
      'Asset allocation analysis',
      'Performance attribution',
      'Risk metrics (Sharpe, Sortino, VaR)',
      'Rebalancing recommendations',
      'Benchmark comparison'
    ],
    tags: ['portfolio', 'analysis', 'performance'],
    provider: 'ForgeClaw',
    version: '1.0.0',
    enabled: true
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Client risk tolerance analysis and portfolio risk scoring',
    category: 'Core',
    tier: 'core',
    price: 0,
    features: [
      'Risk tolerance questionnaires',
      'Portfolio risk scoring',
      'Stress testing scenarios',
      'Correlation analysis',
      'Value at Risk calculations'
    ],
    tags: ['risk', 'assessment', 'tolerance'],
    provider: 'ForgeClaw',
    version: '1.0.0',
    enabled: true
  },
  {
    id: 'market-data',
    name: 'Market Data Pro',
    description: 'Real-time market data, quotes, and technical analysis',
    category: 'Core', 
    tier: 'core',
    price: 0,
    features: [
      'Real-time stock quotes',
      'Technical indicators (RSI, MACD, Bollinger)',
      'Chart generation',
      'News integration',
      'Earnings data'
    ],
    tags: ['market', 'data', 'quotes', 'technical'],
    provider: 'Finnhub',
    version: '2.1.0',
    enabled: true
  },
  {
    id: 'basic-reporting',
    name: 'Basic Reporting',
    description: 'Generate standard client reports and presentations',
    category: 'Core',
    tier: 'core',
    price: 0,
    features: [
      'Performance reports',
      'Asset allocation summaries',
      'Basic client presentations',
      'PDF generation'
    ],
    tags: ['reporting', 'client', 'presentations'],
    provider: 'ForgeClaw',
    version: '1.0.0',
    enabled: true
  },
  {
    id: 'compliance-templates',
    name: 'Compliance Templates',
    description: 'SEC/FINRA compliance documentation and templates',
    category: 'Core',
    tier: 'core', 
    price: 0,
    features: [
      'Form ADV templates',
      'Disclosure templates',
      'Trade documentation',
      'Audit trail maintenance'
    ],
    tags: ['compliance', 'SEC', 'FINRA', 'documentation'],
    provider: 'ForgeClaw',
    version: '1.0.0',
    enabled: true
  },

  // Professional Skills ($49/month tier)
  {
    id: 'tax-planning',
    name: 'Advanced Tax Planning',
    description: 'Tax optimization strategies and planning tools',
    category: 'Professional',
    tier: 'professional',
    price: 0, // Included in professional tier
    features: [
      'Tax-loss harvesting optimization',
      'Roth conversion analysis', 
      'Capital gains planning',
      'Tax-efficient withdrawal strategies',
      'Estate tax planning'
    ],
    tags: ['tax', 'planning', 'optimization', 'harvesting'],
    provider: 'ForgeClaw',
    version: '1.2.0',
    enabled: false
  },
  {
    id: 'performance-attribution',
    name: 'Performance Attribution',
    description: 'Advanced performance analysis and attribution',
    category: 'Professional',
    tier: 'professional', 
    price: 0, // Included in professional tier
    features: [
      'Security-level attribution',
      'Sector/style attribution',
      'Alpha/beta decomposition',
      'Risk-adjusted returns',
      'Custom benchmark analysis'
    ],
    tags: ['performance', 'attribution', 'analysis', 'alpha'],
    provider: 'ForgeClaw',
    version: '1.1.0',
    enabled: false
  },
  {
    id: 'crm-integration',
    name: 'CRM Integration',
    description: 'Integrate with popular CRM platforms',
    category: 'Professional',
    tier: 'professional',
    price: 0, // Included in professional tier
    features: [
      'Client data synchronization',
      'Meeting notes integration',
      'Follow-up reminders',
      'Workflow automation',
      'Salesforce/HubSpot support'
    ],
    tags: ['CRM', 'integration', 'workflow', 'automation'],
    provider: 'ForgeClaw',
    version: '1.0.0',
    enabled: false
  },

  // Enterprise Skills ($149/month tier)
  {
    id: 'esg-screening',
    name: 'ESG Screening & Analysis',
    description: 'Environmental, Social, Governance analysis and screening',
    category: 'Enterprise',
    tier: 'enterprise',
    price: 0, // Included in enterprise tier
    features: [
      'ESG score analysis',
      'Impact investing research',
      'Sustainable portfolio construction',
      'ESG reporting',
      'Carbon footprint analysis'
    ],
    tags: ['ESG', 'sustainability', 'impact', 'screening'],
    provider: 'ForgeClaw', 
    version: '1.0.0',
    enabled: false
  },
  {
    id: 'alternative-investments',
    name: 'Alternative Investment Tools',
    description: 'Analysis tools for alternative investments',
    category: 'Enterprise',
    tier: 'enterprise',
    price: 0, // Included in enterprise tier
    features: [
      'Private equity analysis',
      'Real estate investment evaluation',
      'Commodities research',
      'Hedge fund due diligence',
      'Crypto asset analysis'
    ],
    tags: ['alternatives', 'private-equity', 'real-estate', 'crypto'],
    provider: 'ForgeClaw',
    version: '1.0.0',
    enabled: false
  },

  // Add-on Skills (separate pricing)
  {
    id: 'crypto-analysis',
    name: 'Crypto Analysis Suite',
    description: 'Comprehensive cryptocurrency analysis and portfolio tools',
    category: 'Add-on',
    tier: 'addon',
    price: 29,
    features: [
      'Crypto portfolio analysis',
      'DeFi yield farming analysis', 
      'NFT valuation tools',
      'Blockchain transaction analysis',
      'Regulatory compliance tracking'
    ],
    tags: ['crypto', 'defi', 'nft', 'blockchain'],
    provider: 'BankrBot',
    version: '2.0.0',
    enabled: false
  },
  {
    id: 'advanced-charting',
    name: 'Advanced Charting Pro',
    description: 'Professional-grade charting and visualization tools',
    category: 'Add-on',
    tier: 'addon',
    price: 19,
    features: [
      'Custom chart creation',
      'Interactive dashboards',
      'Advanced technical indicators',
      '3D visualizations',
      'Export to PowerPoint/PDF'
    ],
    tags: ['charting', 'visualization', 'dashboard', 'technical'],
    provider: 'TradingView',
    version: '3.2.0',
    enabled: false
  }
];

/**
 * GET /api/skills
 * Get all available skills with optional filtering
 */
router.get('/', (req, res) => {
  try {
    const { category, tier, tag, search, enabled } = req.query;
    
    let filteredSkills = [...skillsCatalog];

    // Apply filters
    if (category) {
      filteredSkills = filteredSkills.filter(skill => 
        skill.category.toLowerCase() === (category as string).toLowerCase()
      );
    }

    if (tier) {
      filteredSkills = filteredSkills.filter(skill => skill.tier === tier);
    }

    if (tag) {
      filteredSkills = filteredSkills.filter(skill => 
        skill.tags.some(t => t.toLowerCase().includes((tag as string).toLowerCase()))
      );
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredSkills = filteredSkills.filter(skill => 
        skill.name.toLowerCase().includes(searchTerm) ||
        skill.description.toLowerCase().includes(searchTerm) ||
        skill.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (enabled !== undefined) {
      const isEnabled = enabled === 'true';
      filteredSkills = filteredSkills.filter(skill => skill.enabled === isEnabled);
    }

    // Group by category for easier display
    const skillsByCategory = filteredSkills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, typeof skillsCatalog>);

    res.json({
      success: true,
      skills: filteredSkills,
      skillsByCategory,
      totalCount: filteredSkills.length,
      filters: { category, tier, tag, search, enabled }
    });
  } catch (error) {
    logger.error('Error fetching skills:', error);
    res.status(500).json({
      error: 'Failed to fetch skills',
      message: error.message
    });
  }
});

/**
 * GET /api/skills/:skillId
 * Get detailed information about a specific skill
 */
router.get('/:skillId', (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = skillsCatalog.find(s => s.id === skillId);
    
    if (!skill) {
      return res.status(404).json({
        error: 'Skill not found',
        skillId
      });
    }

    res.json({
      success: true,
      skill
    });
  } catch (error) {
    logger.error('Error fetching skill details:', error);
    res.status(500).json({
      error: 'Failed to fetch skill details',
      message: error.message
    });
  }
});

/**
 * GET /api/skills/packages/:tier
 * Get skills included in a specific tier package
 */
router.get('/packages/:tier', (req, res) => {
  try {
    const { tier } = req.params;
    
    const tierSkills = skillsCatalog.filter(skill => {
      // Core skills are included in all tiers
      if (skill.tier === 'core') return true;
      
      // Professional skills included in professional and enterprise
      if (skill.tier === 'professional' && (tier === 'professional' || tier === 'enterprise')) {
        return true;
      }
      
      // Enterprise skills only in enterprise
      if (skill.tier === 'enterprise' && tier === 'enterprise') {
        return true;
      }
      
      return false;
    });

    // Calculate total value
    const totalValue = tierSkills.reduce((sum, skill) => {
      return sum + (skill.price || 0);
    }, 0);

    // Package pricing
    const packagePricing = {
      core: 0,
      professional: 49,
      enterprise: 149
    };

    res.json({
      success: true,
      tier,
      skills: tierSkills,
      skillCount: tierSkills.length,
      monthlyPrice: packagePricing[tier] || 0,
      totalValue,
      savings: Math.max(0, totalValue - (packagePricing[tier] || 0))
    });
  } catch (error) {
    logger.error('Error fetching package skills:', error);
    res.status(500).json({
      error: 'Failed to fetch package skills',
      message: error.message
    });
  }
});

/**
 * GET /api/skills/categories
 * Get all skill categories with counts
 */
router.get('/meta/categories', (req, res) => {
  try {
    const categories = skillsCatalog.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = {
          name: skill.category,
          count: 0,
          skills: []
        };
      }
      acc[skill.category].count++;
      acc[skill.category].skills.push(skill.id);
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      categories: Object.values(categories)
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

/**
 * GET /api/skills/providers
 * Get all skill providers
 */
router.get('/meta/providers', (req, res) => {
  try {
    const providers = [...new Set(skillsCatalog.map(skill => skill.provider))];
    const providersWithCounts = providers.map(provider => ({
      name: provider,
      skillCount: skillsCatalog.filter(skill => skill.provider === provider).length
    }));

    res.json({
      success: true,
      providers: providersWithCounts
    });
  } catch (error) {
    logger.error('Error fetching providers:', error);
    res.status(500).json({
      error: 'Failed to fetch providers', 
      message: error.message
    });
  }
});

export default router;
