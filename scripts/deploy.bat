@echo off
REM =============================================================================
REM Worksy ERP Frontend - Docker Deployment Script for Windows
REM =============================================================================
REM Usage: scripts\deploy.bat
REM =============================================================================

setlocal enabledelayedexpansion

REM Configuration
set CONTAINER_NAME=worksy-frontend-prod
set ENV_FILE=.env.docker.local

REM Colors (Windows 10+ supports ANSI colors)
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "RED=[31m"
set "NC=[0m"

echo %BLUE%========================================%NC%
echo %BLUE%   Worksy ERP Frontend - Docker Deploy  %NC%
echo %BLUE%========================================%NC%
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%NC% Docker is not installed or not in PATH
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo %GREEN%[OK]%NC% Docker is installed

REM Check if Docker is running
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo %RED%[ERROR]%NC% Docker daemon is not running
    echo Please start Docker Desktop
    pause
    exit /b 1
)
echo %GREEN%[OK]%NC% Docker daemon is running
echo.

REM Check environment file
if exist "%ENV_FILE%" (
    echo %GREEN%[OK]%NC% Using environment file: %ENV_FILE%
) else if exist ".env.docker" (
    echo %YELLOW%[WARN]%NC% %ENV_FILE% not found, using .env.docker
    set ENV_FILE=.env.docker
) else (
    echo %RED%[ERROR]%NC% No environment file found
    echo Please create %ENV_FILE% from .env.docker template
    pause
    exit /b 1
)
echo.

REM Parse command line arguments
set ACTION=%1
if "%ACTION%"=="" set ACTION=build

if "%ACTION%"=="build" (
    echo %BLUE%========================================%NC%
    echo %BLUE%   Building Docker Image              %NC%
    echo %BLUE%========================================%NC%
    echo.
    
    docker compose --env-file "%ENV_FILE%" build
    if %errorlevel% neq 0 (
        echo %RED%[ERROR]%NC% Build failed
        pause
        exit /b 1
    )
    echo %GREEN%[OK]%NC% Build completed successfully
    echo.
    
) else if "%ACTION%"=="up" (
    echo %BLUE%========================================%NC%
    echo %BLUE%   Starting Container                 %NC%
    echo %BLUE%========================================%NC%
    echo.
    
    docker compose --env-file "%ENV_FILE%" up -d
    if %errorlevel% neq 0 (
        echo %RED%[ERROR]%NC% Failed to start container
        pause
        exit /b 1
    )
    echo %GREEN%[OK]%NC% Container started successfully
    echo.
    
) else if "%ACTION%"=="down" (
    echo %BLUE%========================================%NC%
    echo %BLUE%   Stopping Container                 %NC%
    echo %BLUE%========================================%NC%
    echo.
    
    docker compose down
    if %errorlevel% neq 0 (
        echo %RED%[ERROR]%NC% Failed to stop container
        pause
        exit /b 1
    )
    echo %GREEN%[OK]%NC% Container stopped successfully
    echo.
    
) else if "%ACTION%"=="logs" (
    echo %BLUE%========================================%NC%
    echo %BLUE%   Viewing Logs                       %NC%
    echo %BLUE%========================================%NC%
    echo.
    
    docker compose logs -f
    goto :eof
    
) else if "%ACTION%"=="restart" (
    echo %BLUE%========================================%NC%
    echo %BLUE%   Restarting Container               %NC%
    echo %BLUE%========================================%NC%
    echo.
    
    docker compose --env-file "%ENV_FILE%" down
    docker compose --env-file "%ENV_FILE%" up -d --build
    if %errorlevel% neq 0 (
        echo %RED%[ERROR]%NC% Failed to restart container
        pause
        exit /b 1
    )
    echo %GREEN%[OK]%NC% Container restarted successfully
    echo.
    
) else (
    echo %RED%[ERROR]%NC% Unknown action: %ACTION%
    echo Valid actions: build, up, down, logs, restart
    pause
    exit /b 1
)

REM Show status
echo %BLUE%========================================%NC%
echo %BLUE%   Container Status                   %NC%
echo %BLUE%========================================%NC%
echo.
docker compose ps
echo.

REM Show access information
echo %BLUE%========================================%NC%
echo %BLUE%   Access Information                 %NC%
echo %BLUE%========================================%NC%
echo.
echo Application URL: http://localhost
echo Health Check: http://localhost/health
echo.
echo %GREEN%Deployment completed successfully!%NC%
echo.
echo To view logs: docker compose logs -f
echo To stop: docker compose down
echo.

pause
