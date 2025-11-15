# Multi-stage build for Node.js API
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy config folder (needed for sequelize-cli)
COPY --from=builder /app/config ./config

# Copy .sequelizerc (needed for sequelize-cli)
COPY --from=builder /app/.sequelizerc ./.sequelizerc

# Copy src folder (needed for migrations and seeders)
COPY --from=builder /app/src ./src

# Copy necessary files
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]

