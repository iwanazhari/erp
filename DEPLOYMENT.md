# Deployment Guide - Worksy ERP Frontend

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Build for Production](#build-for-production)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment Checklist](#post-deployment-checklist)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **Git**: For version control

### Check Versions
```bash
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

---

## ⚙️ Environment Configuration

### 1. Create `.env` File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

**Production (.env):**
```env
# Production API URL
VITE_API_URL=https://worksy-production.up.railway.app/api
```

**Development (.env.development):**
```env
# Local backend URL
VITE_API_URL=http://localhost:15320/api
```

### 3. Available Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | Railway production URL | ✅ Yes |

---

## 🏗️ Build for Production

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Type Check

```bash
npm run build
# This runs TypeScript compiler and Vite build
```

### 3. Build Output

After successful build, you'll see:
```
✓ built in 2.41s
dist/
├── index.html
└── assets/
    ├── index-*.css
    └── index-*.js
```

### 4. Preview Production Build (Optional)

```bash
npm run preview
# Opens http://localhost:4173
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Deploy
```bash
vercel --prod
```

#### 3. Configuration (vercel.json)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "routes": [
    {
      "src": "/[^.]+",
      "dest": "/",
      "status": 200
    }
  ]
}
```

---

### Option 2: Netlify

#### 1. Install Netlify CLI
```bash
npm i -g netlify-cli
```

#### 2. Deploy
```bash
netlify deploy --prod
```

#### 3. Configuration (netlify.toml)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: Manual Deployment (FTP/SFTP)

#### 1. Build
```bash
npm run build
```

#### 2. Upload `dist` folder
Upload all contents of `dist/` to your web server.

#### 3. Configure Server
Make sure your server redirects all routes to `index.html` for SPA routing.

**Nginx Example:**
```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/worksy-frontend/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy (optional)
  location /api {
    proxy_pass https://worksy-production.up.railway.app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

**Apache Example:**
```apache
<VirtualHost *:80>
  ServerName your-domain.com
  DocumentRoot /var/www/worksy-frontend/dist

  <Directory /var/www/worksy-frontend/dist>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted

    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
  </Directory>
</VirtualHost>
```

---

### Option 4: Docker

#### 1. Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Create nginx.conf
```nginx
server {
  listen 80;
  server_name localhost;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # API proxy
  location /api {
    proxy_pass https://worksy-production.up.railway.app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_cache_bypass $http_upgrade;
  }
}
```

#### 3. Build and Run
```bash
docker build -t worksy-frontend .
docker run -p 80:80 worksy-frontend
```

#### 4. Deploy to Container Registry
```bash
# Tag image
docker tag worksy-frontend:latest your-registry/worksy-frontend:latest

# Push to registry
docker push your-registry/worksyfrontend:latest
```

---

## ✅ Post-Deployment Checklist

### 1. Environment Variables
- [ ] Verify `VITE_API_URL` is set correctly
- [ ] Check all environment variables in hosting platform

### 2. Build Verification
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No console warnings

### 3. Functionality Testing
- [ ] Login/Authentication works
- [ ] Schedule CRUD operations work
- [ ] Location CRUD operations work
- [ ] Map picker loads correctly
- [ ] Export CSV downloads properly
- [ ] All API calls reach backend successfully

### 4. Performance
- [ ] Page loads in < 3 seconds
- [ ] No 404 errors in browser console
- [ ] Assets are cached properly
- [ ] Gzip/Brotli compression enabled

### 5. Security
- [ ] HTTPS is enabled
- [ ] No sensitive data in client-side code
- [ ] CORS is properly configured
- [ ] Authentication tokens are secure

### 6. Monitoring
- [ ] Error tracking is set up (e.g., Sentry)
- [ ] Analytics is configured (e.g., Google Analytics)
- [ ] Logging is enabled
- [ ] Uptime monitoring is active

---

## 🐛 Troubleshooting

### Issue: Build Fails with TypeScript Errors

**Solution:**
```bash
# Check TypeScript errors
npm run build

# Fix errors in reported files
# Common issues:
# - Unused variables
# - Missing types
# - Import errors
```

---

### Issue: API Calls Fail (CORS Error)

**Solution:**
1. Check backend CORS configuration
2. Verify `VITE_API_URL` is correct
3. Ensure backend allows your frontend domain

**Backend CORS Example (Express):**
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

---

### Issue: 404 on Page Refresh

**Solution:**
Configure server to redirect all routes to `index.html` (see deployment options above).

---

### Issue: Environment Variables Not Working

**Solution:**
1. Ensure variables are prefixed with `VITE_`
2. Restart dev server after changing `.env`
3. Rebuild for production after changing `.env`
4. Check environment variables in hosting platform dashboard

---

### Issue: Large Bundle Size

**Solution:**
```bash
# Analyze bundle
npm install -g source-map-explorer
npm run build
source-map-explorer dist/assets/*.js

# Common fixes:
# - Lazy load routes
# - Remove unused dependencies
# - Use dynamic imports
```

---

## 📊 Performance Optimization

### 1. Code Splitting
Already configured with Vite - routes are code-split automatically.

### 2. Image Optimization
```bash
npm install -D vite-plugin-imagemin
```

### 3. Lazy Loading
```tsx
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 4. Tree Shaking
Already enabled in production build.

---

## 🔐 Security Best Practices

### 1. Never Commit `.env`
```bash
# .gitignore
.env
.env.local
.env.production
```

### 2. Use HTTPS
Always deploy with HTTPS enabled.

### 3. Secure API Keys
Never store API keys in frontend code. Use environment variables.

### 4. Content Security Policy
Add CSP headers in your server configuration.

---

## 📈 Monitoring & Analytics

### Recommended Tools

1. **Error Tracking**: Sentry, LogRocket
2. **Analytics**: Google Analytics, Plausible
3. **Performance**: WebPageTest, Lighthouse
4. **Uptime**: UptimeRobot, Pingdom

### Sentry Integration
```bash
npm install @sentry/react @sentry/tracing
```

```tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
});
```

---

## 🎯 CI/CD Pipeline Example (GitHub Actions)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📞 Support

For deployment issues:
1. Check this documentation
2. Review error logs
3. Check hosting platform status
4. Contact DevOps team

---

**Last Updated:** 2026-02-27  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
