# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies and build the app
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY . ./

ENV NODE_ENV=production
RUN npm install && npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only the required files for running the app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./

# ✅ Only include what's actually in your repo:
COPY --from=builder /app/pages ./pages
COPY --from=builder /app/components ./components
COPY --from=builder /app/styles ./styles

EXPOSE 3000

CMD ["npm", "start"]
