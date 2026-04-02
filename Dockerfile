# =============================================================================
# Build Stage - Compile and bundle the React application
# =============================================================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
# This layer is cached separately for faster rebuilds
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for build)
# Using npm ci for reproducible builds
RUN npm ci && \
    npm cache clean --force

# Copy source code and config
COPY . .

# Build arguments for environment-specific configuration
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

ARG VITE_GEOAPIFY_API_KEY
ENV VITE_GEOAPIFY_API_KEY=${VITE_GEOAPIFY_API_KEY}

# Run type check and build
RUN npm run build

# Verify build output exists
RUN ls -la dist/

# =============================================================================
# Production Stage - Serve with Nginx
# =============================================================================
FROM nginx:alpine AS production

# Labels for image metadata
LABEL maintainer="Worksyp ERP Team"
LABEL version="1.0.0"
LABEL description="Worksyp ERP Frontend - Production Ready"

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for security (nginx already runs as non-root in alpine)
# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Health check endpoint (nginx status)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Nginx runs in foreground by default in alpine image
CMD ["nginx", "-g", "daemon off;"]

# =============================================================================
# Development Stage (optional - for local development with hot reload)
# =============================================================================
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev)
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
