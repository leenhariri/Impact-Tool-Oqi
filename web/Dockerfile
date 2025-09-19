# web/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

# ✅ Accept build-time environment variable
ARG NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE

COPY web/package*.json ./  
COPY web/tsconfig.json ./  
COPY web/next.config.js ./  
COPY web/public ./public
COPY web/pages ./pages
COPY web/components ./components
COPY web/styles ./styles

RUN npm install && npm run build

# ------------------------

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]
