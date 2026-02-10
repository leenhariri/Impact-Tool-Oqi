
FROM node:20-alpine AS builder

WORKDIR /app


COPY api/package*.json ./
COPY api/tsconfig.json ./
COPY api/src ./src


COPY prisma ./prisma


RUN npm install
RUN npx prisma generate --schema=./prisma/schema.prisma



RUN npm run build


FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080



COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json
EXPOSE 8080

CMD ["node", "dist/index.js"]
