# 🔧 Database Authentication Fix Guide

## 📋 Problem

```
Error: P1000: Authentication failed against database server, 
the provided database credentials for `postgres` are not valid.
```

## 🔍 Diagnosis Steps

### 1. Check Backend Environment Variables

```bash
# Access backend container
docker exec -it worksy-api sh

# Check environment variables
printenv | grep -i database
printenv | grep -i postgres
```

### 2. Expected Environment Variables

Backend Anda harus memiliki environment variables ini:

```bash
# Database Connection
DATABASE_URL="postgresql://postgres:password@postgres:5432/worksy?schema=public"

# Or separate variables:
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=worksy
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

## ✅ Solutions

### Option 1: Fix via Docker Compose (Recommended)

Edit your backend's `docker-compose.yml` or deployment config:

```yaml
services:
  worksy-backend:
    # ... other config
    environment:
      - DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@postgres:5432/worksy?schema=public
      # Or
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=YOUR_PASSWORD
      - POSTGRES_DB=worksy
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
```

Then restart:
```bash
docker compose down
docker compose up -d
```

### Option 2: Fix via Docker Env File

If using `.env` file for backend:

```bash
# Check current .env in backend container
docker exec worksy-api cat /app/.env

# Or check your server's backend .env file
cat /path/to/backend/.env
```

Create/Update `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@postgres:5432/worksy?schema=public

# Or separate
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_PASSWORD
POSTGRES_DB=worksy
```

Restart container:
```bash
docker restart worksy-api
```

### Option 3: Fix via Docker Exec (Temporary)

```bash
# Set environment variable directly in container
docker exec -it worksy-api sh

# Export the correct DATABASE_URL
export DATABASE_URL="postgresql://postgres:password@postgres:5432/worksy?schema=public"

# Run migration
npx prisma migrate deploy
```

Note: This is temporary and will be lost on container restart.

### Option 4: Check PostgreSQL Container

```bash
# Check if postgres container is running
docker ps | grep postgres

# Check postgres logs
docker logs postgres

# Access postgres container
docker exec -it postgres psql -U postgres -c "\du"
```

Verify user exists:
```sql
-- Check users
\du

-- Check databases
\l

-- Reset password if needed
ALTER USER postgres WITH PASSWORD 'new_password';
```

## 🔍 Find Current Credentials

### Check Docker Compose File

```bash
# On your server
docker compose config | grep -A 10 -i database
```

### Check Container Environment

```bash
docker exec worksy-api env | grep -i database
```

### Check Prisma Schema

```bash
docker exec worksy-api cat prisma/schema.prisma | grep -A 5 datasource
```

## 📋 Complete Fix Script

```bash
#!/bin/bash

# 1. Stop backend
docker stop worksy-api

# 2. Check current DATABASE_URL
echo "Current DATABASE_URL:"
docker exec worksy-api printenv DATABASE_URL

# 3. Update DATABASE_URL (example)
# Edit your .env file or docker-compose.yml

# 4. Restart backend
docker start worksy-api

# 5. Wait for container to be ready
sleep 5

# 6. Run migration
docker exec -it worksy-api npx prisma migrate deploy

# 7. Generate Prisma Client
docker exec -it worksy-api npx prisma generate

# 8. Check logs
docker logs worksy-api
```

## 🎯 Common Issues

### Issue 1: Wrong Password

```bash
# Check postgres container for correct password
docker logs postgres 2>&1 | grep -i password
```

### Issue 2: Wrong Host

If postgres is not in the same network:
```bash
# Check network
docker network inspect worksy_worksy-network

# Use correct host (container name or service name)
DATABASE_URL="postgresql://user:pass@postgres:5432/worksy"
#                                    ^^^^^^^^
#                            This must match container name
```

### Issue 3: Database Doesn't Exist

```bash
# Create database
docker exec -it postgres psql -U postgres -c "CREATE DATABASE worksy;"
```

### Issue 4: User Doesn't Exist

```bash
# Create user
docker exec -it postgres psql -U postgres -c "CREATE USER worksy WITH PASSWORD 'password';"
docker exec -it postgres psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE worksy TO worksy;"
```

## ✅ Verification

After fixing:

```bash
# 1. Check environment
docker exec worksy-api printenv DATABASE_URL

# 2. Test connection
docker exec worksy-api npx prisma db pull

# 3. Generate client
docker exec worksy-api npx prisma generate

# 4. Run migration
docker exec worksy-api npx prisma migrate deploy

# 5. Check backend logs
docker logs worksy-api
```

## 📞 Need Help?

Provide this information:
1. Current DATABASE_URL (hide password)
2. PostgreSQL container name
3. Backend docker-compose.yml
4. PostgreSQL logs: `docker logs postgres`
