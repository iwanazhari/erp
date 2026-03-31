# 🔧 Quick Fix - Database Authentication

## Masalah
`DATABASE_URL` sudah benar, tapi authentication gagal. Kemungkinan password di PostgreSQL container berbeda.

## ✅ Langkah Fix

### 1. Cek PostgreSQL Container

```bash
# Cek apakah postgres container running
docker ps | grep postgres

# Cek logs postgres untuk info password
docker logs postgres 2>&1 | head -20
```

### 2. Reset Password PostgreSQL

```bash
# Masuk ke postgres container
docker exec -it postgres psql -U postgres

# Di dalam postgres CLI, reset password:
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

### 3. Atau Cek Environment PostgreSQL

```bash
# Cek environment postgres container
docker exec postgres env | grep -i postgres
```

Harusnya ada:
```
POSTGRES_PASSWORD=postgres
POSTGRES_USER=postgres
POSTGRES_DB=worksy
```

### 4. Restart Backend

```bash
# Restart backend container
docker restart worksy-api

# Tunggu siap
sleep 5

# Cek logs
docker logs worksy-api
```

### 5. Run Migration Lagi

```bash
docker exec -it worksy-api npx prisma migrate deploy
docker exec -it worksy-api npx prisma generate
```

## 🔍 Jika Masih Error

### Cek Koneksi dari Backend Container

```bash
# Install postgres client di backend (jika belum ada)
docker exec worksy-api apk add --no-cache postgresql-client

# Test koneksi
docker exec worksy-api psql postgresql://postgres:postgres@postgres:5432/worksy -c "SELECT 1;"
```

### Cek Network

```bash
# Pastikan kedua container di network yang sama
docker network inspect worksy_worksy-network --format='{{range .Containers}}{{.Name}} {{end}}'
```

### Cek Database Exists

```bash
docker exec -it postgres psql -U postgres -c "\l" | grep worksy
```

Jika tidak ada:
```bash
docker exec -it postgres psql -U postgres -c "CREATE DATABASE worksy;"
```

## 📋 Complete Fix Script

```bash
#!/bin/bash

echo "=== Database Fix Script ==="

# 1. Reset postgres password
echo "Resetting postgres password..."
docker exec -it postgres psql -U postgres -c "ALTER USER postgres WITH PASSWORD 'postgres';"

# 2. Ensure database exists
echo "Checking database..."
docker exec -it postgres psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='worksy';" || \
docker exec -it postgres psql -U postgres -c "CREATE DATABASE worksy;"

# 3. Restart backend
echo "Restarting backend..."
docker restart worksy-api
sleep 5

# 4. Run migration
echo "Running migration..."
docker exec -it worksy-api npx prisma migrate deploy

# 5. Generate client
echo "Generating Prisma Client..."
docker exec -it worksy-api npx prisma generate

echo "=== Done ==="
```

## ✅ Verification

```bash
# Test connection
docker exec worksy-api npx prisma db pull

# Should show schema without error
```
