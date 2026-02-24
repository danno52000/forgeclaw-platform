# ForgeClaw - OpenClaw for Financial Advisors
# Option B: Official OpenClaw Docker Image + FA Customization Layer

# Use official OpenClaw image
FROM ghcr.io/openclaw/openclaw:latest

# Switch to root temporarily for setup
USER root

# Install additional FA dependencies
RUN npm install --global \
    @supabase/supabase-js \
    neo4j-driver \
    stripe

# Create FA workspace directories
RUN mkdir -p /home/node/.openclaw/workspace/skills/fa \
             /home/node/.openclaw/workspace/configs/advisors \
             /home/node/.openclaw/workspace/themes/forgeclaw

# Copy FA customization files
COPY fa-skills-packages/ /home/node/.openclaw/workspace/skills/fa/
COPY advisor-configs/ /home/node/.openclaw/workspace/configs/advisors/
COPY forgeclaw-theme/ /home/node/.openclaw/workspace/themes/forgeclaw/

# Fix ownership
RUN chown -R node:node /home/node/.openclaw/workspace

# Switch back to node user
USER node

# Environment variables for FA mode
ENV FA_MODE=enabled
ENV SKILLS_MARKETPLACE=enabled
ENV THEME=forgeclaw
ENV BRAND=ForgeClaw
ENV NODE_ENV=production

# OpenClaw port is already exposed by base image
# Health check is already configured by base image

# Use base image startup (already configured for port 18789)
