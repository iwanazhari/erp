# Environment Configuration Guide

## 📋 Overview

This guide explains how to configure environment variables for different environments (development, staging, production).

---

## 📁 Environment Files

The project uses the following environment files:

```
.env                # Default environment variables (loaded in all modes)
.env.local          # Local overrides (gitignored)
.env.development    # Development-specific variables
.env.production     # Production-specific variables
```

**Priority Order:**
```
.env.local > .env.development/.env.production > .env
```

---

## ⚙️ Available Environment Variables

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `https://worksy-production.up.railway.app/api` | ✅ Yes |

### Optional Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `VITE_APP_NAME` | Application name | `Worksy ERP` | `Worksy` |
| `VITE_APP_VERSION` | App version display | `1.0.0` | Package version |

---

## 🔧 Configuration by Environment

### 1. Development Environment

**File:** `.env.development`

```env
# Local backend
VITE_API_URL=http://localhost:15320/api

# Optional
VITE_APP_NAME=Worksy ERP (Dev)
VITE_ENABLE_DEV_TOOLS=true
```

**Usage:**
```bash
npm run dev
```

---

### 2. Staging Environment

**File:** `.env.staging` (create manually)

```env
# Staging backend
VITE_API_URL=https://worksy-staging.up.railway.app/api

# Optional
VITE_APP_NAME=Worksy ERP (Staging)
VITE_ENABLE_DEV_TOOLS=true
```

**Usage:**
```bash
npm run build -- --mode staging
```

---

### 3. Production Environment

**File:** `.env.production`

```env
# Production backend
VITE_API_URL=https://worksy-production.up.railway.app/api

# Optional
VITE_APP_NAME=Worksy ERP
VITE_ENABLE_DEV_TOOLS=false
```

**Usage:**
```bash
npm run build
```

---

## 🚀 Setting Up Different Environments

### Step 1: Create Environment Files

**Development:**
```bash
cp .env.example .env.development
# Edit .env.development with local settings
```

**Production:**
```bash
cp .env.example .env.production
# Edit .env.production with production settings
```

### Step 2: Update `package.json` Scripts

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "dev:staging": "vite --mode staging",
    "build": "vite build --mode production",
    "build:staging": "vite build --mode staging",
    "preview": "vite preview"
  }
}
```

---

## 🔐 Security Best Practices

### 1. Never Commit Sensitive Data

**❌ DON'T:**
```env
# .env - NEVER commit this
API_SECRET=super-secret-key
DATABASE_PASSWORD=password123
```

**✅ DO:**
```env
# .env.local - Add to .gitignore
API_SECRET=super-secret-key
```

### 2. Use `.gitignore`

```bash
# .gitignore
.env
.env.local
.env.development.local
.env.production.local
```

### 3. Use `.env.example` as Template

```env
# .env.example - Safe to commit
VITE_API_URL=https://your-api-url.com/api
VITE_APP_NAME=Your App Name
```

---

## 🌍 CI/CD Environment Variables

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    steps:
      - name: Build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
        run: npm run build
```

### Vercel

1. Go to Project Settings → Environment Variables
2. Add variables:
   - `VITE_API_URL` = `https://worksy-production.up.railway.app/api`
3. Deploy will automatically use these

### Netlify

1. Go to Site Settings → Build & Deploy → Environment
2. Add variables:
   - Key: `VITE_API_URL`
   - Value: `https://worksy-production.up.railway.app/api`

---

## 🧪 Testing Environment Configuration

### Check Loaded Variables

Add to your code temporarily:
```typescript
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Mode:', import.meta.env.MODE);
```

### Verify in Browser

1. Open DevTools Console
2. Check logged environment variables
3. Verify correct API URL is used

---

## 🐛 Troubleshooting

### Issue: Environment Variables Not Loading

**Solutions:**

1. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Clear Cache**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Check Variable Prefix**
   - Must start with `VITE_`
   - `VITE_API_URL` ✅
   - `API_URL` ❌ (won't work)

4. **Verify File Location**
   - `.env` files must be in project root
   - Not in `src/` or other folders

---

### Issue: Wrong API URL in Production

**Solutions:**

1. **Rebuild Application**
   ```bash
   npm run build
   ```

2. **Check Environment Variable**
   ```bash
   # In hosting platform dashboard
   # Verify VITE_API_URL is set correctly
   ```

3. **Clear CDN Cache**
   - If using CDN, purge cache after deploy

---

## 📊 Environment Comparison

| Feature | Development | Staging | Production |
|---------|-------------|---------|------------|
| **API URL** | `localhost:15320` | Staging Railway | Production Railway |
| **Dev Tools** | Enabled | Enabled | Disabled |
| **Source Maps** | Enabled | Enabled | Disabled |
| **Minification** | Disabled | Enabled | Enabled |
| **Error Messages** | Detailed | Detailed | Generic |

---

## 🎯 Quick Reference

### Local Development
```bash
# Use .env.development
npm run dev
```

### Build for Production
```bash
# Use .env.production
npm run build
```

### Check Current Environment
```typescript
console.log(import.meta.env.MODE);
// "development" | "production" | "staging"
```

### Access Variables
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

---

## 📝 Example Complete Setup

### 1. Development Setup

```bash
# Clone repository
git clone <repository-url>
cd erp

# Install dependencies
npm install

# Copy example env
cp .env.example .env.development

# Edit .env.development
# Set VITE_API_URL=http://localhost:15320/api

# Start dev server
npm run dev
```

### 2. Production Setup

```bash
# Build for production
npm run build

# Preview build
npm run preview

# Deploy (example: Vercel)
vercel --prod
```

---

## 🔗 Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [README](./README.md)
- [Schedule Feature](./src/features/schedule/README.md)

---

**Last Updated:** 2026-02-27  
**Version:** 1.0.0  
**Status:** ✅ Complete
