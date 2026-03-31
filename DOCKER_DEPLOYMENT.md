# 🐳 Docker Deployment Guide - Worksy ERP Frontend

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Build & Run](#build--run)
5. [Deployment to Server](#deployment-to-server)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 🔧 Prerequisites

### Required Software
- **Docker**: Version 20.x or higher
- **Docker Compose**: Version 2.x or higher (usually included with Docker Desktop)

### Check Versions
```bash
docker --version      # Should be v20.x or higher
docker compose version # Should be v2.x or higher
```

### Install Docker (if needed)

**Ubuntu/Debian:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**Windows:**
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

**macOS:**
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

---

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
cd C:\Users\iwana\Desktop\erp
```

### 2. Configure Environment
```bash
# Copy the Docker environment template
cp .env.docker .env.docker.local

# Edit .env.docker.local with your settings
# (See Configuration section below)
```

### 3. Build and Run
```bash
# Build and start the container
docker compose --env-file .env.docker.local up -d --build

# View logs
docker compose logs -f

# Stop the container
docker compose down
```

### 4. Verify Deployment
Open your browser and navigate to: `http://localhost`

---

## ⚙️ Configuration

### 1. Environment File Setup

Create or edit `.env.docker.local` (this file is gitignored):

```bash
# Host port (default: 80)
HOST_PORT=8080

# API URL
VITE_API_URL=https://your-api-server.com/api

# Geoapify API Key (optional)
VITE_GEOAPIFY_API_KEY=your_geoapify_key
```

### 2. Custom Port

If port 80 is already in use, change it in `.env.docker.local`:

```bash
HOST_PORT=8080
```

Then access the app at: `http://localhost:8080`

### 3. Production API URL

**Important:** Update `VITE_API_URL` to point to your production backend:

```bash
VITE_API_URL=https://your-production-api.com/api
```

---

## 🏗️ Build & Run

### Build Commands

```bash
# Build only (without starting)
docker compose build

# Build with no cache (fresh build)
docker compose build --no-cache

# Build and start
docker compose up -d --build
```

### Run Commands

```bash
# Start container
docker compose up -d

# Start with logs
docker compose up -d && docker compose logs -f

# Stop container
docker compose down

# Stop and remove volumes (use with caution)
docker compose down -v
```

### View Logs

```bash
# Follow logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# View build logs
docker compose logs builder
```

### Access Container

```bash
# Execute shell in running container
docker compose exec worksy-frontend sh

# View container info
docker compose ps

# View resource usage
docker stats worksy-frontend-prod
```

---

## 🌐 Deployment to Server

### Option 1: Direct Docker Compose Deployment

#### 1. Prepare Your Server

```bash
# SSH into your server
ssh user@your-server.com

# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
exit
# Reconnect to apply group changes
ssh user@your-server.com
```

#### 2. Transfer Files

```bash
# From your local machine, transfer the project
scp -r C:\Users\iwana\Desktop\erp user@your-server.com:/path/to/worksy-frontend

# Or use rsync for incremental updates
rsync -avz --exclude 'node_modules' --exclude 'dist' \
  C:\Users\iwana\Desktop\erp\ user@your-server.com:/path/to/worksy-frontend
```

#### 3. Configure and Deploy

```bash
# SSH into server
ssh user@your-server.com

# Navigate to project
cd /path/to/worksy-frontend

# Create environment file
cp .env.docker .env.docker.local
# Edit .env.docker.local with production values

# Build and deploy
docker compose --env-file .env.docker.local up -d --build

# Verify it's running
docker compose ps

# View logs
docker compose logs -f
```

#### 4. Setup Auto-Start

```bash
# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Docker Compose with restart policy (already configured)
# The docker-compose.yml has: restart: unless-stopped
```

---

### Option 2: Deploy Pre-built Image

#### 1. Build and Tag Locally

```bash
# Build the image
docker build -t worksy-frontend:latest \
  --build-arg VITE_API_URL=https://your-api.com/api \
  .

# Tag for registry
docker tag worksy-frontend:latest your-registry/worksy-frontend:latest
```

#### 2. Push to Registry

```bash
# Login to registry
docker login your-registry.com

# Push image
docker push your-registry/worksy-frontend:latest
```

#### 3. Deploy on Server

```bash
# SSH into server
ssh user@your-server.com

# Pull and run
docker run -d \
  --name worksy-frontend \
  --restart unless-stopped \
  -p 80:80 \
  your-registry/worksy-frontend:latest
```

---

### Option 3: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/docker-deploy.yml`:

```yaml
name: Docker Deploy

on:
  push:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          build-args: |
            VITE_API_URL=${{ secrets.VITE_API_URL }}
```

---

## 🔐 Environment Variables

### Build-time Variables (ARG)

These are baked into the image during build:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | Railway URL | ✅ |
| `VITE_GEOAPIFY_API_KEY` | Geoapify API key | (empty) | ❌ |

### Runtime Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `HOST_PORT` | Host machine port | 80 | ❌ |
| `TZ` | Container timezone | UTC | ❌ |

### Setting Build Arguments

```bash
# Via command line
docker compose build --build-arg VITE_API_URL=https://api.example.com

# Via .env.docker.local (recommended)
VITE_API_URL=https://api.example.com
```

---

## 🐛 Troubleshooting

### Issue: Port Already in Use

**Error:** `Bind for 0.0.0.0:80 failed: port is already allocated`

**Solution:**
```bash
# Change HOST_PORT in .env.docker.local
HOST_PORT=8080

# Restart
docker compose down
docker compose --env-file .env.docker.local up -d
```

---

### Issue: Build Fails

**Solution:**
```bash
# Clean build
docker compose build --no-cache

# Check build logs
docker compose logs builder

# Verify Node version in Dockerfile matches package.json requirements
```

---

### Issue: Container Exits Immediately

**Solution:**
```bash
# Check logs
docker compose logs worksy-frontend

# Verify nginx configuration
docker compose exec worksy-frontend nginx -t

# Check if port is available
docker compose ps
```

---

### Issue: API Calls Fail (CORS)

**Solution:**
1. Verify `VITE_API_URL` is correct
2. Check backend CORS configuration
3. Enable API proxy in `nginx.conf` (uncomment the location block)

---

### Issue: Old Version Showing After Update

**Solution:**
```bash
# Force rebuild with no cache
docker compose --env-file .env.docker.local up -d --build --force-recreate

# Clear browser cache or use incognito mode
# The index.html has no-cache headers, but browser might still cache
```

---

### Issue: Health Check Fails

**Solution:**
```bash
# Check health endpoint
curl http://localhost/health

# Should return: healthy

# If fails, check nginx logs
docker compose logs worksy-frontend
```

---

## ✅ Best Practices

### 1. Security

- ✅ Never commit `.env.docker.local` to git
- ✅ Use non-root user (already configured)
- ✅ Enable security headers (already in nginx.conf)
- ✅ Use HTTPS in production (configure reverse proxy)
- ✅ Keep base images updated

### 2. Performance

- ✅ Multi-stage build (smaller production image)
- ✅ Gzip compression enabled
- ✅ Browser caching for static assets
- ✅ Use `.dockerignore` to reduce image size

### 3. Monitoring

```bash
# Container health
docker compose ps

# Resource usage
docker stats worksy-frontend-prod

# Logs
docker compose logs -f

# Restart policy
docker update --restart=unless-stopped worksy-frontend-prod
```

### 4. Updates

```bash
# Update deployment script
#!/bin/bash
cd /path/to/worksy-frontend
git pull
docker compose --env-file .env.docker.local up -d --build
docker image prune -f
```

### 5. Backup

```bash
# Export container configuration
docker compose config > docker-compose.backup.yml

# Save image
docker save worksy-frontend:latest > worksy-frontend-backup.tar
```

---

## 📊 Image Size Optimization

### Check Image Size

```bash
docker images worksy-frontend
```

**Expected size:** ~25-30 MB (nginx:alpine + static files)

### Further Optimization (Optional)

If you need smaller images:

```dockerfile
# Use multi-arch builds
docker buildx build --platform linux/amd64,linux/arm64 \
  -t your-registry/worksy-frontend:latest \
  --push .
```

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Update `VITE_API_URL` to production endpoint
- [ ] Set `HOST_PORT` if not using default 80
- [ ] Configure HTTPS (reverse proxy or load balancer)
- [ ] Enable Docker auto-restart
- [ ] Set up monitoring and alerting
- [ ] Configure log rotation
- [ ] Test health check endpoint
- [ ] Verify CORS configuration
- [ ] Test in incognito mode (cache clearing)
- [ ] Document deployment process

---

## 📈 Scaling

### Multiple Instances

```bash
# Run multiple instances behind a load balancer
docker compose -p worksy-frontend-1 up -d
docker compose -p worksy-frontend-2 up -d

# Configure load balancer to distribute traffic
```

### Kubernetes (Advanced)

For Kubernetes deployment, create:
- `Deployment` manifest
- `Service` manifest
- `Ingress` configuration
- `ConfigMap` for environment variables

---

## 🆘 Support

For Docker-specific issues:
1. Check container logs: `docker compose logs`
2. Verify Docker daemon: `systemctl status docker`
3. Check resource usage: `docker stats`
4. Review Docker documentation: https://docs.docker.com/

---

**Last Updated:** 2026-03-28
**Version:** 1.0.0
**Status:** ✅ Production Ready
