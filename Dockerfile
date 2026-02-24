# ForgeClaw - Minimal OpenClaw for Financial Advisors
# Start with working base, add customizations later

# Use official OpenClaw image
FROM ghcr.io/openclaw/openclaw:latest

# Environment variables for FA mode
ENV FA_MODE=enabled
ENV SKILLS_MARKETPLACE=enabled
ENV THEME=forgeclaw
ENV BRAND=ForgeClaw
ENV NODE_ENV=production

# Keep everything else from base image
