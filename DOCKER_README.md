# 🐳 Docker Quick Reference - Worksy ERP Frontend

## Quick Commands

### First Time Setup
```bash
# 1. Copy environment file
cp .env.docker .env.docker.local

# 2. Edit .env.docker.local with your settings

# 3. Build and run
docker compose --env-file .env.docker.local up -d --build
```

### Daily Operations
```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart
docker compose restart

# View logs
docker compose logs -f

# Rebuild
docker compose up -d --build
```

### Using Deploy Script (Windows)
```bash
# Build and deploy
scripts\deploy.bat build
scripts\deploy.bat up

# Or restart (build + up)
scripts\deploy.bat restart

# View logs
scripts\deploy.bat logs

# Stop
scripts\deploy.bat down
```

### Using Deploy Script (Linux/Mac)
```bash
# Make script executable
chmod +x scripts/verify-docker-deploy.sh

# Run verification
./scripts/verify-docker-deploy.sh
```

## Environment Variables

Edit `.env.docker.local`:

```bash
# Host port (default: 80)
HOST_PORT=8080

# API URL
VITE_API_URL=https://your-api.com/api

# Geoapify API Key (optional)
VITE_GEOAPIFY_API_KEY=your_key
```

## Access Points

| Service | URL |
|---------|-----|
| Application | http://localhost |
| Health Check | http://localhost/health |

If using custom port (e.g., 8080):
- Application: http://localhost:8080
- Health Check: http://localhost:8080/health

## Troubleshooting

### Port Already in Use
```bash
# Change HOST_PORT in .env.docker.local to 8080
# Then restart
docker compose down
docker compose --env-file .env.docker.local up -d
```

### View Build Logs
```bash
docker compose logs builder
```

### Access Container Shell
```bash
docker compose exec worksy-frontend sh
```

### Check Resource Usage
```bash
docker stats worksy-frontend-prod
```

### Force Rebuild
```bash
docker compose up -d --build --force-recreate
```

### Clean Up
```bash
# Remove stopped containers
docker compose down

# Remove unused images
docker image prune

# Remove everything (use with caution)
docker compose down -v
docker image prune -a
```

## Deployment Checklist

- [ ] Docker installed and running
- [ ] `.env.docker.local` created and configured
- [ ] `VITE_API_URL` set to production endpoint
- [ ] Port 80 available (or custom port configured)
- [ ] Build successful: `docker compose build`
- [ ] Container running: `docker compose ps`
- [ ] Health check passing: `curl http://localhost/health`
- [ ] Application accessible in browser
- [ ] API calls working correctly

## File Structure

```
erp/
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Container orchestration
├── nginx.conf              # Web server configuration
├── .dockerignore           # Files to exclude from image
├── .env.docker             # Environment template
├── .env.docker.local       # Your environment (gitignored)
├── DOCKER_DEPLOYMENT.md    # Detailed deployment guide
└── scripts/
    ├── deploy.bat          # Windows deployment script
    └── verify-docker-deploy.sh  # Linux/Mac verification script
```

## Image Information

- **Base Image**: nginx:alpine (~25MB)
- **Build Image**: node:20-alpine
- **Final Size**: ~30MB
- **Exposed Port**: 80
- **Health Check**: /health endpoint

## Security Features

✅ Non-root user  
✅ Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)  
✅ Gzip compression  
✅ Content Security Policy  
✅ Health check endpoint  
✅ Auto-restart policy  

## Next Steps

1. Configure HTTPS (reverse proxy or load balancer)
2. Set up monitoring and alerting
3. Configure log rotation
4. Set up CI/CD pipeline
5. Enable container resource limits

For detailed documentation, see [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
