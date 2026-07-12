# ---------- deps ----------
FROM node:22-alpine AS deps
# Prisma / OpenSSL 런타임 호환
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY scripts ./scripts
# postinstall(prisma generate) 은 provider 설정 후 실행되도록 스킵
ENV DATABASE_PROVIDER=postgresql
RUN npm ci --ignore-scripts

# ---------- builder ----------
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV DATABASE_PROVIDER=postgresql
# 빌드 중 DB 미접속이어도 통과하도록 더미 URL (generateStaticParams 는 방어 코드로 [] 반환)
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN node scripts/set-db-provider.mjs \
  && npx prisma generate \
  && npm run build

# ---------- runner ----------
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_PROVIDER=postgresql
ENV PORT=3000
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# standalone 산출물 + 정적 자산 + prisma(마이그레이션/시드용)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY docker-entrypoint.sh ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["sh", "./docker-entrypoint.sh"]
