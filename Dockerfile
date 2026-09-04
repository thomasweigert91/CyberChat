# 1. Stage: Anwendung bauen
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build


FROM node:22-slim AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund


FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --chown=node:node --from=prod-deps /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package*.json ./

USER node

EXPOSE 3000

CMD ["npm", "run", "start:prod"]