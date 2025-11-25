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

# Build argument for API URL
# For Render: Environment variables from render.yaml are automatically available
# For local development: Pass as --build-arg or set as env var
# NOTE: VITE_API_BASE_URL MUST be provided via environment variable
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Verify the environment variable is set (for debugging)
RUN if [ -z "$VITE_API_BASE_URL" ]; then \
      echo "⚠️ WARNING: VITE_API_BASE_URL is not set!"; \
    else \
      echo "✅ VITE_API_BASE_URL is set to: $VITE_API_BASE_URL"; \
    fi

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

