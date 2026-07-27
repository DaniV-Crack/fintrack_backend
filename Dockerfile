# ── ETAPA 1: BUILDER (compilar TypeScript) ──────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Generar Prisma Client (necesita el schema.prisma)
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
COPY prisma.config.ts ./

# Compilar TypeScript → JavaScript
RUN npm run build

# ── ETAPA 2: RUNNER (imagen final más pequeña) ──────────
FROM node:20-alpine AS runner

WORKDIR /app

# dumb-init: manejo correcto de señales para cerrar la app limpiamente
RUN apk add --no-cache dumb-init

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/prisma.config.ts ./

USER nodejs

EXPOSE 3000
ENV NODE_ENV=production

# Al iniciar: ejecutar migraciones y luego arrancar el servidor
CMD ["dumb-init", "sh", "-c", "npx prisma migrate deploy && node dist/index.js"]