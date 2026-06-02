# PM2 Deployment Guide - Worksy ERP Frontend

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- PM2 installed globally (`npm install -g pm2`)
- Backend already deployed and running on port 15320

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` file:
```env
# API Configuration - Production (PM2 Backend)
VITE_API_URL=http://localhost:15320/api
VITE_API_PUBLIC_URL=http://localhost:15320

# Geoapify Geocoding API
VITE_GEOAPIFY_API_KEY=your_api_key_here
```

### 3. Build for Production
```bash
npm run build
```

### 4. Deploy to PM2
```bash
# Start frontend on port 3000
pm2 start --name worksy-frontend "node_modules/.bin/serve" -- dist -s -p 3000

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run serve` | Serve dist folder on port 3000 |
| `npm run deploy` | Build and start with PM2 |

## 🔧 PM2 Commands

### Manage Frontend
```bash
# Start
pm2 start --name worksy-frontend "node_modules/.bin/serve" -- dist -s -p 3000

# Stop
pm2 stop worksy-frontend

# Restart
pm2 restart worksy-frontend

# Delete
pm2 delete worksy-frontend

# View logs
pm2 logs worksy-frontend

# Monitor
pm2 monit
```

### Manage Backend
```bash
# Start (from /root/worksy directory)
cd /root/worksy && pm2 start npm --name worksy-backend -- start

# Stop
pm2 stop worksy-backend

# Restart
pm2 restart worksy-backend
```

### System Startup
```bash
# Save current process list
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Follow the command output to complete setup
```

## 🌐 Access Points

### Local Access (from VPS)
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:15320/api
- **Backend Direct**: http://localhost:15320

### Public Access (from internet)
- **Frontend**: http://157.66.34.174:3000
- **Backend API**: http://157.66.34.174:15320/api
- **Backend Direct**: http://157.66.34.174:15320

### API Documentation
- **Swagger UI**: http://157.66.34.174:15320/api-docs

## 🔍 Verify Deployment

### Check PM2 Status
```bash
pm2 list
```

Expected output:
```
┌────┬────────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name               │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼────────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ worksy-backend     │ fork     │ 0    │ online    │ 0%       │ ~60mb    │
│ 1  │ worksy-frontend    │ fork     │ 0    │ online    │ 0%       │ ~70mb    │
└────┴────────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘
```

### Test Frontend
```bash
curl http://localhost:3000
```

### Test Backend Connection
```bash
curl http://localhost:15320/api/health
```

## 🛠️ Troubleshooting

### Frontend Not Starting
```bash
# Check if dist folder exists
ls -la dist/

# Rebuild if necessary
npm run build

# Check PM2 logs
pm2 logs worksy-frontend
```

### Backend Connection Failed
1. Verify backend is running: `pm2 list`
2. Check backend logs: `pm2 logs worksy-backend`
3. Verify port: `netstat -tlnp | grep 15320`
4. Check `.env` configuration

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
pm2 start --name worksy-frontend "node_modules/.bin/serve" -- dist -s -p 3001
```

### Memory Issues
```bash
# Monitor memory usage
pm2 monit

# Restart if needed
pm2 restart worksy-frontend
```

## 📦 Update Deployment

### Update Frontend
```bash
# Pull latest changes
git pull

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart worksy-frontend
```

### Update Backend
```bash
cd /root/worksy
git pull
npm install
pm2 restart worksy-backend
```

## 🔐 Security Notes

1. **Never commit `.env` file** - It contains sensitive API keys
2. **Use HTTPS in production** - Configure reverse proxy (nginx/Apache)
3. **Keep PM2 updated** - `npm update -g pm2`
4. **Regular security audits** - `npm audit`

## 📊 Monitoring

### Real-time Monitoring
```bash
pm2 monit
```

### View Logs
```bash
# All logs
pm2 logs

# Frontend logs only
pm2 logs worksy-frontend

# Backend logs only
pm2 logs worksy-backend
```

### Generate Logs
```bash
pm2 logs --timestamp --lines 100
```

## 🔄 Backup & Restore

### Backup PM2 Configuration
```bash
pm2 dump
```

### Restore PM2 Processes
```bash
pm2 resurrext
```

## 📝 Notes

- Frontend runs on port **3000**
- Backend runs on port **15320**
- Both services auto-restart on failure
- PM2 saves process list for system reboot
- Frontend connects to backend via `http://localhost:15320/api`

---

**Last Updated:** 2026-04-02
**Version:** 1.0.0
**Status:** ✅ Production Ready
