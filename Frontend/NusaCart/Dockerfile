# Simple Dockerfile for frontend without built-in web server
# Akan di-serve oleh Caddy lokal sistem

FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL
ARG VITE_API_URL=http://localhost:6060
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN npm run build

# Production stage dengan simple HTTP server
FROM node:18-alpine

# Install simple HTTP server and curl for health check
RUN npm install -g serve && apk add --no-cache curl

# Create app directory
WORKDIR /app

# Copy built application
COPY --from=build /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start simple server
CMD ["serve", "-s", "dist", "-l", "3000"] 
 