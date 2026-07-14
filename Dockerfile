# ── ReA3 Assets — Dockerfile ──────────────────────────────────────────────
# Multi-stage build for Next.js standalone output.
#
# Build:
#   docker build -t rea3assets .
#
# Run:
#   docker run -p 3003:3000 --env-file .env rea3assets

# ── Stage 1: Dependencies ──────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && \
    cp -R node_modules /prod_modules

# ── Stage 2: Build ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npx prisma generate && \
    npm run build

# ── Stage 3: Production runtime ────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps /prod_modules ./node_modules

# Prisma client is bundled in standalone output but we need the generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create upload directory
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
