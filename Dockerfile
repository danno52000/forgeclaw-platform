# ForgeClaw - OpenClaw for Financial Advisors
# Option B: Official OpenClaw build process + FA Customization Layer

FROM node:22-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Bun (required for OpenClaw build scripts)
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Enable corepack for pnpm
RUN corepack enable

# Set working directory
WORKDIR /app

# Clone OpenClaw from official repository
RUN git clone https://github.com/openclaw/openclaw.git .

# Install dependencies (cached unless package files change)
RUN pnpm install --frozen-lockfile

# Build OpenClaw (ui:build auto-installs UI deps on first run)
RUN pnpm ui:build
RUN pnpm build

# Copy FA customization files
COPY fa-skills-packages/ ./workspace/skills/fa/
COPY advisor-configs/ ./workspace/configs/advisors/
COPY forgeclaw-theme/ ./workspace/themes/forgeclaw/

# Install additional FA dependencies
RUN npm install --no-save \
    @supabase/supabase-js \
    neo4j-driver \
    stripe

# Environment variables for FA mode
ENV FA_MODE=enabled
ENV SKILLS_MARKETPLACE=enabled
ENV THEME=forgeclaw
ENV BRAND=ForgeClaw
ENV NODE_ENV=production

# Create non-root user
RUN groupadd -g 1000 openclaw && useradd -u 1000 -g openclaw -m openclaw
RUN chown -R openclaw:openclaw /app
USER openclaw

# Expose OpenClaw port (correct port is 18789)
EXPOSE 18789

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:18789/health || exit 1

# Start OpenClaw Gateway
CMD ["node", "dist/index.js", "gateway", "--allow-unconfigured", "--port", "18789"]
