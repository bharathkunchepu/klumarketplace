# Multi-stage build for optimized production image

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set API URL environment variable for Vite build
# Render should pass this via envVars in render.yaml, but we set a default as fallback
# Default matches the value in render.yaml
ARG VITE_API_BASE_URL=https://umarketing-system-backend.onrender.com/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Verify the environment variable is set (for debugging)
RUN echo "🔍 VITE_API_BASE_URL = $VITE_API_BASE_URL"

# Build the application
# Vite will use the VITE_API_BASE_URL environment variable at build time
RUN npm run build

# Stage 2: Production image with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

