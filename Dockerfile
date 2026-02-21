# ForgeClaw - OpenClaw for Financial Advisors
# Option B: Official OpenClaw + FA Customization Layer

# Use official OpenClaw as base (easy updates!)
FROM ghcr.io/openclaw/openclaw:latest

# Switch to root for installations
USER root

# Add FA-specific skills packages
COPY fa-skills-packages/ /app/skills/fa/

# Add advisor configuration templates
COPY advisor-configs/ /app/configs/advisors/

# Add ForgeClaw branding and customizations
COPY forgeclaw-theme/ /app/themes/forgeclaw/

# Install additional dependencies for FA features
RUN npm install --no-save \
    @supabase/supabase-js \
    neo4j-driver \
    stripe

# Environment variables for FA mode
ENV FA_MODE=enabled
ENV SKILLS_MARKETPLACE=enabled
ENV THEME=forgeclaw
ENV BRAND=ForgeClaw

# Health check (inherit from base OpenClaw)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Switch back to app user
USER app

# Use OpenClaw's existing start command
# Base image handles: CMD ["npm", "start"]
