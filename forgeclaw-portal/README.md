# ForgeClaw Portal

Next.js application for advisor signup, onboarding, and dashboard.

## Features

- Advisor registration and payment processing
- Skills marketplace selection
- Northflank API integration for instance provisioning
- Custom domain management (advisor.forgeclaw.com)
- Dashboard for advisor management

## Development

```bash
npm install
npm run dev
```

## Environment Variables

- `NORTHFLANK_API_KEY`: API key for Northflank integration
- `STRIPE_SECRET_KEY`: For payment processing
- `DATABASE_URL`: PostgreSQL connection string
