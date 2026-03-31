# 🚀 Deployment Guide - Worksy ERP Frontend (Docker Server)

## 📋 Prerequisites

- Docker server dengan network `worksy_worksy-network`
- Backend container bernama `worksy-backend` sudah berjalan
- Port 80 tersedia (atau custom port)

---

## 🔧 Langkah Deployment

### 1. Persiapan File Environment

```bash
# Di server Docker Anda
cd /path/to/erp

# Copy environment file
cp .env.docker .env.docker.local
```

Edit `.env.docker.local`:

```bash
# Port yang akan digunakan (default: 80)
HOST_PORT=80

# API URL internal (Docker network)
VITE_API_URL=http://worksy-backend:8080/api

# Geoapify API Key (optional)
VITE_GEOAPIFY_API_KEY=your_key_here
```

### 2. Build dan Deploy

```bash
# Build dan start container
docker compose --env-file .env.docker.local up -d --build

# Lihat logs
docker compose logs -f

# Cek status
docker compose ps
```

### 3. Verifikasi

```bash
# Test health endpoint
curl http://localhost/health

# Test main page
curl http://localhost/

# Test API proxy
curl http://localhost/api/health
```

Buka browser: `http://<server-ip-anda>`

---

## 📊 Arsitektur Deployment

```
┌─────────────────────────────────────────────────────────┐
│                  Docker Server                          │
│                                                         │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │  worksy-frontend │      │  worksy-backend  │       │
│  │       :80        │─────▶│      :8080       │       │
│  │   (nginx)        │ /api │   (your API)     │       │
│  └────────┬─────────┘      └──────────────────┘       │
│           │                                             │
│           ▼                                             │
│      Port 80                                            │
│         │                                               │
│         ▼                                               │
│    User Browser                                         │
│                                                         │
│  Network: worksy_worksy-network                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Network Configuration

Frontend akan terhubung ke network yang sama dengan backend:

```yaml
networks:
  worksy-network:
    external: true
    name: worksy_worksy-network
```

### Verifikasi Network

```bash
# Cek network
docker network ls | grep worksy

# Inspect network
docker network inspect worksy_worksy-network

# Cek container di network
docker network inspect worksy_worksy-network --format='{{range .Containers}}{{.Name}} {{end}}'
```

---

## 🔄 Update Deployment

### Update dari Git

```bash
cd /path/to/erp

# Pull perubahan
git pull

# Rebuild dan restart
docker compose --env-file .env.docker.local up -d --build

# Cleanup image lama
docker image prune -f
```

### Force Rebuild

```bash
# Rebuild tanpa cache
docker compose --env-file .env.docker.local up -d --build --no-cache --force-recreate
```

---

## 🛠️ Troubleshooting

### Container Tidak Bisa Connect ke Backend

```bash
# Cek apakah backend running
docker ps | grep worksy-backend

# Cek network connectivity
docker exec worksy-frontend-prod ping worksy-backend

# Cek backend logs
docker logs worksy-backend
```

**Solusi:**
- Pastikan `worksy-backend` container running
- Pastikan kedua container di network yang sama
- Cek port backend (default: 8080)

### API Calls Gagal (502 Bad Gateway)

```bash
# Test API dari host
curl http://<server-ip>:8080/api/health

# Test dari dalam frontend container
docker exec worksy-frontend-prod wget -qO- http://worksy-backend:8080/api/health
```

**Solusi:**
- Update `proxy_pass` di `nginx.conf` jika port backend berbeda
- Restart backend container

### Port 80 Sudah Digunakan

Edit `.env.docker.local`:
```bash
HOST_PORT=8080
```

Restart:
```bash
docker compose down
docker compose --env-file .env.docker.local up -d
```

Akses: `http://<server-ip>:8080`

### CORS Errors

Jika masih ada CORS error, pastikan:
1. API proxy di `nginx.conf` sudah enabled
2. Frontend memanggil `/api/...` (bukan URL langsung)
3. Backend CORS configuration benar

---

## 📈 Monitoring

### Container Status

```bash
# Status semua container
docker compose ps

# Resource usage
docker stats worksy-frontend-prod

# Logs
docker logs -f worksy-frontend-prod
```

### Health Check

```bash
# Manual health check
curl http://localhost/health

# Expected response: healthy
```

### Logs

```bash
# Follow logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Build logs
docker compose logs builder
```

---

## 🔐 Security Checklist

- [ ] HTTPS configured (reverse proxy / load balancer)
- [ ] Environment file tidak di-commit ke git
- [ ] Backend container tidak expose port ke public
- [ ] Security headers enabled (di nginx.conf)
- [ ] Container running sebagai non-root user

---

## 📝 Quick Commands Reference

| Command | Description |
|---------|-------------|
| `docker compose up -d --build` | Build dan deploy |
| `docker compose down` | Stop container |
| `docker compose restart` | Restart container |
| `docker compose logs -f` | Lihat logs |
| `docker compose ps` | Cek status |
| `docker stats worksy-frontend-prod` | Resource usage |
| `docker exec -it worksy-frontend-prod sh` | Access container |

---

## 🎯 Post-Deployment Checklist

- [ ] Container running: `docker compose ps`
- [ ] Health check passing: `curl http://localhost/health`
- [ ] Main page accessible: `curl http://localhost/`
- [ ] API proxy working: `curl http://localhost/api/...`
- [ ] No CORS errors di browser console
- [ ] Login/authentication berfungsi
- [ ] Data CRUD berfungsi
- [ ] Logs tidak ada error

---

## 🆘 Support Commands

### Inspect Container

```bash
docker inspect worksy-frontend-prod
```

### Access Container Shell

```bash
docker exec -it worksy-frontend-prod sh
```

### Test Nginx Configuration

```bash
docker exec worksy-frontend-prod nginx -t
```

### Restart Specific Service

```bash
docker compose restart worksy-frontend
```

### Full Redeploy

```bash
docker compose down
docker compose --env-file .env.docker.local up -d --build --force-recreate
```

---

**Last Updated:** 2026-03-28  
**Network:** worksy_worksy-network  
**Backend:** worksy-backend:8080  
**Status:** ✅ Ready to Deploy
