# Automation Scripts

Scripts for integrating with Northflank API and automating advisor instance deployment.

## Scripts

- `northflank-api.js`: Northflank API client and wrapper functions
- `deploy-advisor.js`: Deploy new advisor OpenClaw instance
- `manage-domains.js`: Custom domain setup and SSL configuration
- `skills-manager.js`: Enable/disable skills for advisor instances
- `monitoring.js`: Health checks and monitoring setup

## API Integration

### Deploy New Advisor Instance
```javascript
const { deployAdvisorInstance } = require('./deploy-advisor');

const result = await deployAdvisorInstance({
  advisorId: 'advisor-123',
  name: 'John Smith Financial',
  subdomain: 'johnsmith',
  skills: ['portfolio-analysis', 'risk-assessment'],
  apiKey: advisor.anthropicApiKey
});
```

### Enable Skills
```javascript
const { enableSkills } = require('./skills-manager');

await enableSkills('advisor-123', ['tax-planning', 'esg-screening']);
```
