# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY api/package*.json ./
COPY api/tsconfig.json ./
COPY prisma ./prisma
COPY api/src ./src
COPY .env .env

RUN npm install

# Generate Prisma client (make sure schema is present)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Compile TypeScript
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

# Copy compiled output and Prisma schema + client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/.env .env

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "dist/index.js"]
