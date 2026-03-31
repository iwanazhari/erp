@echo off
REM =============================================================================
REM Worksy ERP Frontend - Quick Deploy to Docker Server
REM =============================================================================
REM Usage: deploy-server.bat
REM =============================================================================

setlocal enabledelayedexpansion

set ENV_FILE=.env.docker.local
set NETWORK_NAME=worksy_worksy-network

echo [========================================]
echo    Worksy ERP Frontend - Server Deploy
echo [========================================]
echo.

REM Check Docker
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found
    pause
    exit /b 1
)

docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon not running
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Check network
docker network inspect %NETWORK_NAME% >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] Network %NETWORK_NAME% not found
    echo Frontend will create it if not exists
    echo.
) else (
    echo [OK] Network %NETWORK_NAME% exists
)

REM Check backend
docker ps --format "{{.Names}}" | findstr "worksy-backend" >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] worksy-backend container not running
    echo Make sure backend is running before starting frontend
    echo.
) else (
    echo [OK] worksy-backend is running
)

REM Check environment file
if exist "%ENV_FILE%" (
    echo [OK] Using %ENV_FILE%
) else if exist ".env.docker" (
    echo [WARN] %ENV_FILE% not found, using .env.docker
    set ENV_FILE=.env.docker
) else (
    echo [ERROR] No environment file found
    echo Create %ENV_FILE% first
    pause
    exit /b 1
)
echo.

REM Parse arguments
set ACTION=%1
if "%ACTION%"=="" set ACTION=deploy

if "%ACTION%"=="build" (
    echo [BUILD] Building image...
    docker compose --env-file "%ENV_FILE%" build
    goto :show_status
)

if "%ACTION%"=="up" (
    echo [START] Starting container...
    docker compose --env-file "%ENV_FILE%" up -d
    goto :show_status
)

if "%ACTION%"=="down" (
    echo [STOP] Stopping container...
    docker compose down
    echo [OK] Container stopped
    goto :end
)

if "%ACTION%"=="restart" (
    echo [RESTART] Restarting container...
    docker compose --env-file "%ENV_FILE%" down
    docker compose --env-file "%ENV_FILE%" up -d --build
    goto :show_status
)

if "%ACTION%"=="logs" (
    echo [LOGS] Following logs...
    docker compose logs -f
    goto :eof
)

REM Default: deploy
echo [DEPLOY] Building and starting container...
docker compose --env-file "%ENV_FILE%" up -d --build

:show_status
echo.
echo [========================================]
echo    Deployment Status
echo [========================================]
echo.
docker compose ps
echo.
echo [========================================]
echo    Access Information
echo [========================================]
echo.
echo Application: http://localhost
echo Health:      http://localhost/health
echo.
echo To view logs: docker compose logs -f
echo To stop:      docker compose down
echo.

:end
echo [OK] Done!
pause
