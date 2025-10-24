# Multi-stage build for API
FROM node:18-alpine AS api-build
WORKDIR /app/api
COPY apps/api/package*.json ./
RUN npm ci --only=production

COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy API build
COPY --from=api-build /app/api/dist ./dist
COPY --from=api-build /app/api/node_modules ./node_modules
COPY apps/api/package*.json ./

EXPOSE 3001
CMD ["node", "dist/simpleIndex.js"]