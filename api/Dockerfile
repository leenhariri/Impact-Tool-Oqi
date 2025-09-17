# ----------- STAGE 1: Build -------------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY api/package*.json ./api/
WORKDIR /app/api
RUN npm install

# Copy all source code (everything under src)
COPY prisma /app/prisma
COPY api/tsconfig.json ./
COPY api/src ./src

# Generate Prisma client
RUN npx prisma generate --schema=../prisma/schema.prisma

# Build TypeScript
RUN npm run build


# ----------- STAGE 2: Runtime -------------
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy built output from builder
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/node_modules ./node_modules
COPY --from=builder /app/api/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the app
CMD ["node", "dist/index.js"]
