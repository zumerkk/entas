# ─── Build Stage ───
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/ packages/
COPY apps/admin/ apps/admin/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @entec/shared build
RUN pnpm --filter @entec/ui build
RUN pnpm --filter @entec/admin build

# ─── Production Stage ───
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static apps/admin/.next/static
COPY --from=builder /app/apps/admin/public apps/admin/public

EXPOSE 3002
CMD ["node", "apps/admin/server.js"]
