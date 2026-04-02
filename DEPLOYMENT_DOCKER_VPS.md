# 🐳 Docker VPS Deployment Guide - Worksy ERP Frontend

Panduan lengkap deployment aplikasi Worksy ERP Frontend ke Docker VPS.

---

## 📋 Prerequisites

Sebelum deployment, pastikan Anda memiliki:

- ✅ VPS dengan Docker & Docker Compose terinstall
- ✅ Domain/subdomain yang pointing ke IP VPS (opsional)
- ✅ SSH access ke VPS
- ✅ Backend API sudah running di VPS
- ✅ Git installed (untuk pull dari repository)

---

## 🚀 Step-by-Step Deployment

### **Step 1: Persiapan VPS**

#### 1.1. SSH ke VPS
```bash
ssh user@your-vps-ip
```

#### 1.2. Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.3. Install Docker (jika belum terinstall)
```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y

# Add user to docker group (optional, to run docker without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

#### 1.4. Verify Docker Installation
```bash
docker --version
docker compose version
```

---

### **Step 2: Setup Network & Backend**

#### 2.1. Create Docker Network
```bash
docker network create worksy-network
```

#### 2.2. Verify Backend is Running
```bash
# Check if backend container is running
docker ps | grep worksy-backend

# Backend harus accessible di: http://worksy-backend:8080/api
```

---

### **Step 3: Clone/Upload Project**

#### Option A: Clone dari Git Repository
```bash
# Create directory
mkdir -p /opt/worksy-frontend
cd /opt/worksy-frontend

# Clone repository
git clone <your-repository-url> .
```

#### Option B: Upload Manual via SCP
```bash
# Dari local machine
scp -r ./* user@your-vps-ip:/opt/worksy-frontend/
```

---

### **Step 4: Konfigurasi Environment**

#### 4.1. Copy Environment File
```bash
cd /opt/worksy-frontend
cp .env.example .env
```

#### 4.2. Edit Environment Variables
```bash
nano .env
```

**Isi file `.env`:**
```env
# API Configuration
VITE_API_URL=http://worksy-backend:8080/api

# Geoapify API Key (optional)
VITE_GEOAPIFY_API_KEY=your_geoapify_api_key

# Docker Configuration
HOST_PORT=80
```

**Penjelasan:**
- `VITE_API_URL`: URL backend API (gunakan Docker service name `worksy-backend`)
- `VITE_GEOAPIFY_API_KEY`: API key untuk geocoding (optional)
- `HOST_PORT`: Port yang akan di-expose (default: 80)

---

### **Step 5: Build & Run Docker Container**

#### 5.1. Build Docker Image
```bash
docker compose build
```

**Output yang diharapkan:**
```
[+] Building 45.2s (15/15) FINISHED
 => [internal] load build definition from Dockerfile
 => ...
 => exporting to image
 => => naming to docker.io/library/worksy-frontend:latest
```

#### 5.2. Start Container
```bash
docker compose up -d
```

**Output yang diharapkan:**
```
[+] Running 2/2
 ✔ Network worksy-network  Created
 ✔ Container worksy-frontend-prod  Started
```

#### 5.3. Verify Container is Running
```bash
docker compose ps
```

**Output:**
```
NAME                  STATUS         PORTS
worksy-frontend-prod  Up (healthy)   0.0.0.0:80->80/tcp
```

---

### **Step 6: Test Deployment**

#### 6.1. Test Local Access
```bash
curl http://localhost
```

#### 6.2. Test from Browser
```
http://your-vps-ip
```

#### 6.3. Check Container Logs
```bash
docker compose logs -f worksy-frontend
```

---

### **Step 7: Setup SSL/HTTPS (Optional tapi Recommended)**

#### Option A: Menggunakan Nginx Proxy Manager (Recommended untuk Beginner)

**7.A.1. Install Nginx Proxy Manager:**
```bash
# Create directory
mkdir -p /opt/nginx-proxy-manager
cd /opt/nginx-proxy-manager

# Create docker-compose.yml
cat > docker-compose.yml << EOF
version: '3'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'
      - '81:81'
      - '443:443'
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
EOF

# Start Nginx Proxy Manager
docker compose up -d
```

**7.A.2. Configure di Nginx Proxy Manager:**
1. Buka `http://your-vps-ip:81`
2. Login (default: admin@example.com / changeme)
3. Add Proxy Host:
   - **Domain Name:** `erp.yourdomain.com`
   - **Scheme:** `http`
   - **Forward Hostname/IP:** `worksy-frontend-prod` atau IP VPS
   - **Forward Port:** `80`
   - **SSL Tab:** Request new SSL certificate (Let's Encrypt)

#### Option B: Menggunakan Certbot (Manual)

**7.B.1. Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

**7.B.2. Generate SSL Certificate:**
```bash
sudo certbot --nginx -d erp.yourdomain.com
```

**7.B.3. Auto-renewal:**
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot akan auto-renew via cron
```

---

### **Step 8: Setup Auto-Deploy dengan GitHub Actions (Optional)**

#### 8.1. Create GitHub Actions Workflow

**File: `.github/workflows/deploy.yml`**
```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/worksy-frontend
            git pull origin main
            docker compose build
            docker compose up -d
```

#### 8.2. Setup GitHub Secrets
```
VPS_HOST: your-vps-ip
VPS_USERNAME: your-username
VPS_SSH_KEY: (paste your private SSH key)
```

---

## 🔧 Maintenance & Troubleshooting

### Restart Container
```bash
docker compose restart
```

### Stop Container
```bash
docker compose down
```

### Rebuild Container
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### View Logs
```bash
# Real-time logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100
```

### Check Container Health
```bash
docker inspect --format='{{.State.Health.Status}}' worksy-frontend-prod
```

### Update Application
```bash
cd /opt/worksy-frontend
git pull origin main
docker compose build
docker compose up -d
```

### Cleanup Unused Images
```bash
docker image prune -a
```

---

## 📊 Monitoring

### Install Docker Stats
```bash
# View real-time resource usage
docker stats worksy-frontend-prod
```

### Install Portainer (Optional - GUI untuk Docker)
```bash
docker volume create portainer_data
docker run -d -p 8000:8000 -p 9443:9443 --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Akses: `https://your-vps-ip:9443`

---

## 🔐 Security Best Practices

### 1. Setup Firewall (UFW)
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 2. Setup Fail2Ban
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Regular Updates
```bash
# Setup auto-updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Backup Data
```bash
# Backup script
cat > /opt/backup-worksy.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker compose -f /opt/worksy-frontend/docker-compose.yml down
tar -czf /opt/backups/worksy-frontend_$DATE.tar.gz /opt/worksy-frontend
docker compose -f /opt/worksy-frontend/docker-compose.yml up -d
EOF

chmod +x /opt/backup-worksy.sh

# Add to crontab (backup setiap hari jam 2 pagi)
crontab -e
# Add: 0 2 * * * /opt/backup-worksy.sh
```

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ Yes | - | Backend API URL |
| `VITE_GEOAPIFY_API_KEY` | ❌ No | - | Geoapify API key |
| `HOST_PORT` | ❌ No | `80` | Port to expose |

---

## 🆘 Troubleshooting

### Issue: Container tidak start
```bash
# Check logs
docker compose logs worksy-frontend

# Check if port is already in use
sudo netstat -tulpn | grep :80

# Check network
docker network ls
docker network inspect worksy-network
```

### Issue: Cannot connect to backend
```bash
# Test backend connectivity
docker exec worksy-frontend-prod wget -qO- http://worksy-backend:8080/api/health

# Check backend is running
docker ps | grep worksy-backend
```

### Issue: Build failed
```bash
# Clean build cache
docker compose build --no-cache

# Check Node version
docker run --rm -v $(pwd):/app node:20-alpine node --version
```

### Issue: SSL certificate error
```bash
# Renew certificate
sudo certbot renew

# Check Nginx configuration
sudo nginx -t
```

---

## 📞 Support

Jika mengalami masalah:

1. Check logs: `docker compose logs -f`
2. Verify network: `docker network inspect worksy-network`
3. Test backend connectivity
4. Check firewall rules: `sudo ufw status`

---

**Last Updated:** April 2, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
