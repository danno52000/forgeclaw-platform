# OpenClaw for Financial Advisors - ForgeClaw Platform
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy OpenClaw core
COPY openclaw-core/ ./openclaw-core/

# Copy FA skills packages
COPY fa-skills-packages/ ./fa-skills-packages/

# Install dependencies
WORKDIR /app/openclaw-core
RUN npm install

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start OpenClaw
CMD ["npm", "start"]
