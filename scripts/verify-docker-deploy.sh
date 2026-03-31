#!/bin/bash
# =============================================================================
# Worksy ERP Frontend - Docker Deployment Verification Script
# =============================================================================
# This script verifies that the Docker deployment is working correctly
# Usage: ./scripts/verify-docker-deploy.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONTAINER_NAME="worksy-frontend-prod"
HEALTH_ENDPOINT="/health"
TIMEOUT=5

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is not installed"
        exit 1
    fi
    print_success "$1 is installed ($(command -v "$1"))"
}

# =============================================================================
# Pre-flight Checks
# =============================================================================

print_header "🔍 Pre-flight Checks"

echo "Checking required commands..."
check_command docker
check_command docker-compose

echo ""
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker compose version)"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi
print_success "Docker daemon is running"

# =============================================================================
# Configuration Checks
# =============================================================================

print_header "⚙️ Configuration Checks"

# Check if .env.docker.local exists
if [ -f ".env.docker.local" ]; then
    print_success ".env.docker.local exists"
    echo "  Using configuration: .env.docker.local"
elif [ -f ".env.docker" ]; then
    print_warning ".env.docker.local not found, using .env.docker"
    echo "  Using configuration: .env.docker"
else
    print_error "No environment file found (.env.docker.local or .env.docker)"
    echo "  Please create .env.docker.local from .env.docker template"
    exit 1
fi

# Check if Dockerfile exists
if [ -f "Dockerfile" ]; then
    print_success "Dockerfile exists"
else
    print_error "Dockerfile not found"
    exit 1
fi

# Check if docker-compose.yml exists
if [ -f "docker-compose.yml" ]; then
    print_success "docker-compose.yml exists"
else
    print_error "docker-compose.yml not found"
    exit 1
fi

# Check if nginx.conf exists
if [ -f "nginx.conf" ]; then
    print_success "nginx.conf exists"
else
    print_error "nginx.conf not found"
    exit 1
fi

# =============================================================================
# Build Test
# =============================================================================

print_header "🏗️ Build Test"

echo "Testing Docker build (dry run)..."
if docker compose config &> /dev/null; then
    print_success "Docker Compose configuration is valid"
else
    print_error "Docker Compose configuration is invalid"
    docker compose config
    exit 1
fi

# =============================================================================
# Container Status Check
# =============================================================================

print_header "📦 Container Status Check"

if docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
    print_success "Container $CONTAINER_NAME is running"
    
    # Get container info
    echo ""
    echo "Container Details:"
    docker inspect --format='{{.State.Status}}' $CONTAINER_NAME | xargs -I {} echo "  Status: {}"
    docker inspect --format='{{.NetworkSettings.IPAddress}}' $CONTAINER_NAME | xargs -I {} echo "  IP Address: {}"
    
    # Check port mapping
    echo ""
    echo "Port Mappings:"
    docker port $CONTAINER_NAME | sed 's/^/  /'
else
    print_warning "Container $CONTAINER_NAME is not running"
    echo "  To start: docker compose --env-file .env.docker.local up -d --build"
fi

# =============================================================================
# Health Check
# =============================================================================

print_header "🏥 Health Check"

# Get container port
CONTAINER_PORT=$(docker port $CONTAINER_NAME 2>/dev/null | grep ':80' | cut -d':' -f2 | head -1)

if [ -z "$CONTAINER_PORT" ]; then
    # Try default port
    CONTAINER_PORT="80"
fi

echo "Testing health endpoint..."
if curl -s --max-time $TIMEOUT "http://localhost:$CONTAINER_PORT$HEALTH_ENDPOINT" | grep -q "healthy"; then
    print_success "Health check passed"
else
    print_warning "Health check endpoint not responding (container may not be running)"
fi

# =============================================================================
# Web Server Check
# =============================================================================

print_header "🌐 Web Server Check"

echo "Testing main page..."
if curl -s --max-time $TIMEOUT "http://localhost:$CONTAINER_PORT/" | grep -q "index.html\| Worksy"; then
    print_success "Main page is accessible"
else
    print_warning "Main page not responding (container may not be running)"
fi

echo "Testing SPA routing (random route)..."
if curl -s --max-time $TIMEOUT "http://localhost:$CONTAINER_PORT/test-route" | grep -q "index.html\| Worksy"; then
    print_success "SPA routing is working"
else
    print_warning "SPA routing may not be configured correctly"
fi

# =============================================================================
# Security Headers Check
# =============================================================================

print_header "🔒 Security Headers Check"

echo "Checking security headers..."
HEADERS=$(curl -sI --max-time $TIMEOUT "http://localhost:$CONTAINER_PORT/")

if echo "$HEADERS" | grep -qi "X-Frame-Options"; then
    print_success "X-Frame-Options header present"
else
    print_warning "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -qi "X-Content-Type-Options"; then
    print_success "X-Content-Type-Options header present"
else
    print_warning "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -qi "X-XSS-Protection"; then
    print_success "X-XSS-Protection header present"
else
    print_warning "X-XSS-Protection header missing"
fi

# =============================================================================
# Resource Usage
# =============================================================================

print_header "📊 Resource Usage"

if docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
    echo "Current resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $CONTAINER_NAME
else
    print_warning "Container not running, skipping resource stats"
fi

# =============================================================================
# Image Information
# =============================================================================

print_header "🖼️ Image Information"

IMAGE_SIZE=$(docker images worksy-frontend:latest --format '{{.Size}}' 2>/dev/null)
if [ -n "$IMAGE_SIZE" ]; then
    echo "Image: worksy-frontend:latest"
    echo "Size: $IMAGE_SIZE"
else
    print_warning "Image not found (build first)"
fi

# =============================================================================
# Summary
# =============================================================================

print_header "📋 Summary"

echo "Verification completed!"
echo ""
echo "Next steps:"
echo "  1. If container is not running: docker compose --env-file .env.docker.local up -d --build"
echo "  2. View logs: docker compose logs -f"
echo "  3. Access app: http://localhost"
echo "  4. Stop container: docker compose down"
echo ""

if docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
    print_success "Deployment appears to be working correctly!"
else
    print_warning "Container is not running. Build and start it first."
fi

echo ""
