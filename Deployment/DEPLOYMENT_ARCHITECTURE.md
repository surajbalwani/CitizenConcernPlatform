# 🏗️ Citizen Sphere Deployment Architecture & File Structure

This document explains the complete deployment architecture, file structure, and how all components work together for the Citizen Sphere platform deployment.

## 📁 Project Structure

```
CitizenConcernPlatform/
├── deployment/                           # Deployment scripts and documentation
│   ├── deploy-all.sh                    # Main deployment orchestrator
│   ├── deploy-backend.sh                # Backend-specific deployment
│   ├── deploy-frontend.sh               # Frontend-specific deployment
│   ├── cleanup-deployment.sh            # Resource cleanup script
│   ├── DEPLOYMENT_GUIDE.md              # Step-by-step deployment guide
│   ├── DEPLOYMENT_ARCHITECTURE.md       # This file - architecture overview
│   ├── Backend.Dockerfile               # Backup/reference Dockerfile
│   ├── Frontend.Dockerfile              # Backup/reference Dockerfile
│   └── nginx.conf                       # Backup/reference nginx config
├── Backend/                              # .NET Core API
│   ├── heroku.yml                       # Heroku build configuration
│   ├── Dockerfile                       # Docker build instructions
│   └── [API source files...]
├── Frontend/                             # Angular PWA
│   ├── heroku.yml                       # Heroku build configuration
│   ├── Dockerfile                       # Docker build instructions
│   ├── nginx.conf                       # Nginx server configuration
│   └── [Angular source files...]
```

## 🔄 Deployment Flow & File References

### 1. Main Orchestrator (`deploy-all.sh`)

```bash
#!/bin/bash
# This script doesn't reference Docker files directly
# It orchestrates the entire deployment process

./deploy-backend.sh    # Calls backend deployment
./deploy-frontend.sh   # Calls frontend deployment
```

**What it does:**
- Checks prerequisites (Heroku CLI, Git, Node.js, .NET)
- Calls individual deployment scripts in sequence
- Provides final deployment URLs and credentials
- **Does NOT directly reference Docker files**

### 2. Backend Deployment (`deploy-backend.sh`)

```bash
# Key configurations
APP_NAME="citizen-sphere-backend"
TEAM_NAME="runtimeterror"

# Creates Heroku app
heroku create $APP_NAME --region eu --team $TEAM_NAME

# IMPORTANT: This tells Heroku to use Docker
heroku stack:set container --app $APP_NAME

# Navigates to Backend directory and pushes
cd ../Backend
git push heroku main:main
```

**File reference chain:**
1. `deploy-backend.sh` sets container stack
2. Heroku looks for `Backend/heroku.yml`
3. `heroku.yml` references `Backend/Dockerfile`
4. Docker builds using `Backend/Dockerfile`

### 3. Frontend Deployment (`deploy-frontend.sh`)

```bash
# Key configurations
APP_NAME="citizen-sphere-frontend"
TEAM_NAME="runtimeterror"

# Creates Heroku app
heroku create $APP_NAME --region eu --team $TEAM_NAME

# Sets container stack for Docker deployment
heroku stack:set container --app $APP_NAME

# Navigates to Frontend directory and pushes
cd ../Frontend
git push heroku main:main
```

**File reference chain:**
1. `deploy-frontend.sh` sets container stack
2. Heroku looks for `Frontend/heroku.yml`
3. `heroku.yml` references `Frontend/Dockerfile`
4. Docker builds using `Frontend/Dockerfile` and `nginx.conf`

## 📋 Configuration Files Explained

### Backend Configuration Files

#### `Backend/heroku.yml`
```yaml
build:
  docker:
    web: Dockerfile        # References Backend/Dockerfile
run:
  web: dotnet CitizenConcernAPI.dll
```
- Tells Heroku to build using Docker
- Specifies which Dockerfile to use (local `Dockerfile`)
- Defines the command to run the application

#### `Backend/Dockerfile`
```dockerfile
# Multi-stage build process
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base    # Runtime base
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build     # Build environment
FROM build AS publish                                # Publishing stage
FROM base AS final                                   # Final runtime image

# Environment configuration for Heroku
ENV ASPNETCORE_URLS=http://*:$PORT
ENV ASPNETCORE_ENVIRONMENT=Production
```

### Frontend Configuration Files

#### `Frontend/heroku.yml`
```yaml
build:
  docker:
    web: Dockerfile        # References Frontend/Dockerfile
```
- Simpler than backend (no run command needed)
- Nginx handles the serving automatically

#### `Frontend/Dockerfile`
```dockerfile
# Multi-stage build: Node.js builder + Nginx server
FROM node:18-alpine AS builder     # Build Angular app
FROM nginx:alpine                  # Serve with Nginx

# Dynamic port configuration for Heroku
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/nginx.conf && nginx -g 'daemon off;'
```

#### `Frontend/nginx.conf`
```nginx
server {
    listen $PORT;                    # Heroku dynamic port
    root /usr/share/nginx/html;
    
    # Angular Router support
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🚀 Heroku Deployment Process

### Step-by-Step Flow

1. **Script Execution**
   ```bash
   cd deployment
   ./deploy-all.sh
   ```

2. **Backend Deployment**
   ```
   deploy-all.sh → deploy-backend.sh → Heroku Build Process
   ```
   
3. **Heroku Backend Build**
   ```
   Git Push → heroku.yml Detection → Dockerfile Build → Container Deploy
   ```

4. **Frontend Deployment**
   ```
   deploy-all.sh → deploy-frontend.sh → Heroku Build Process
   ```

5. **Heroku Frontend Build**
   ```
   Git Push → heroku.yml Detection → Dockerfile Build → Container Deploy
   ```

### How Heroku Finds and Uses Files

1. **Container Stack Detection**
   - `heroku stack:set container` tells Heroku to use Docker
   - Heroku looks for `heroku.yml` in the repository root

2. **Build Configuration**
   - `heroku.yml` specifies which Dockerfile to use
   - Must be relative to the git repository being pushed

3. **Docker Build Process**
   - Heroku runs `docker build -f Dockerfile .`
   - All referenced files must be in the build context

4. **Runtime Configuration**
   - Environment variables injected (like `$PORT`)
   - Application starts using the run command

## 🏭 Multi-Stage Docker Builds Explained

### Backend Docker Build Stages

```dockerfile
# Stage 1: Runtime Base
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
# Minimal runtime environment

# Stage 2: Build Environment  
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
# Full SDK for compilation

# Stage 3: Publish
FROM build AS publish
# Creates optimized output

# Stage 4: Final Runtime
FROM base AS final
# Combines runtime + published app
```

**Benefits:**
- Smaller final image (no SDK tools)
- Faster deployment
- Better security (fewer attack surfaces)

### Frontend Docker Build Stages

```dockerfile
# Stage 1: Build Angular App
FROM node:18-alpine AS builder
# npm install + ng build

# Stage 2: Nginx Server
FROM nginx:alpine
# Lightweight web server
```

**Benefits:**
- No Node.js in production image
- Optimized static file serving
- Automatic gzip compression

## 🌍 Regional and Team Configuration

### Current Configuration

```bash
# Team: runtimeterror
# Region: eu (Europe - Ireland)
# Apps: citizen-sphere-backend, citizen-sphere-frontend
```

**Why Europe Region?**
- **India**: ~140-160ms latency
- **UK**: ~20-30ms latency  
- **Australia**: ~300-350ms latency
- **Best compromise** for all three regions

### Team Benefits

- Centralized billing under "runtimeterror"
- Collaborative access management
- Team dashboard and monitoring
- Consistent resource organization

## 🔧 Environment Variables & Configuration

### Backend Environment Variables
```bash
ASPNETCORE_ENVIRONMENT=Production
JWT_KEY="YourSuperSecretKeyThatIsAtLeast32CharactersLong123456"
JWT_ISSUER="CitizenConcernAPI" 
JWT_AUDIENCE="CitizenConcernAPI"
DATABASE_URL="postgresql://..." # Auto-added by Heroku
PORT="8080"                      # Auto-injected by Heroku
```

### Frontend Environment Variables
```bash
NODE_ENV=production
API_BASE_URL="https://citizen-sphere-backend.herokuapp.com"
PORT="8080"                      # Auto-injected by Heroku
```

## 🗑️ Cleanup Process (`cleanup-deployment.sh`)

### What Gets Deleted
```bash
# Heroku Apps
heroku apps:destroy --app citizen-sphere-backend --confirm citizen-sphere-backend
heroku apps:destroy --app citizen-sphere-frontend --confirm citizen-sphere-frontend

# Git Remotes
git remote remove heroku  # From both Backend and Frontend directories
```

### Safety Features
- Requires typing "DELETE" to confirm
- Shows what will be deleted before proceeding
- Lists all addons and their data
- Handles non-existent apps gracefully

## 📊 Resource Allocation

### Heroku Resources Created

**Backend App (`citizen-sphere-backend`)**
- Heroku Dyno: 1x web dyno
- PostgreSQL: essential-0 addon (10,000 rows)
- Region: Europe (eu)
- Team: runtimeterror

**Frontend App (`citizen-sphere-frontend`)**  
- Heroku Dyno: 1x web dyno
- No database needed
- Region: Europe (eu)
- Team: runtimeterror

### Cost Breakdown
- **Backend Dyno**: Free tier (sleeps after 30min inactivity)
- **Frontend Dyno**: Free tier (sleeps after 30min inactivity)
- **PostgreSQL**: essential-0 ($5/month for production)
- **Total**: $0/month (development) or $19/month (production)

## 🚨 Troubleshooting Common Issues

### "heroku.yml not found"
**Problem**: Heroku can't find build configuration
**Solution**: Ensure `heroku.yml` is in the repository root being pushed

### "Dockerfile not found"
**Problem**: heroku.yml references non-existent Dockerfile
**Solution**: Verify Dockerfile path in heroku.yml is correct and file exists

### "Build context missing files"
**Problem**: Dockerfile references files outside build context
**Solution**: Ensure all referenced files are in the same directory or subdirectories

### "Container stack not set"
**Problem**: Heroku tries to use buildpacks instead of Docker
**Solution**: Run `heroku stack:set container --app APP_NAME`

## ✅ Verification Checklist

After deployment, verify:

- [ ] Apps created in correct region (eu)
- [ ] Apps assigned to correct team (runtimeterror)
- [ ] Container stack set for both apps
- [ ] Environment variables configured
- [ ] Database addon attached
- [ ] SSL certificates active
- [ ] Frontend connects to backend API
- [ ] Demo accounts accessible
- [ ] Logs are flowing

## 🎯 Quick Commands Reference

```bash
# Deploy everything
cd deployment && ./deploy-all.sh

# Deploy backend only  
cd deployment && ./deploy-backend.sh

# Deploy frontend only
cd deployment && ./deploy-frontend.sh

# Clean up everything
cd deployment && ./cleanup-deployment.sh

# View logs
heroku logs --tail --app citizen-sphere-backend
heroku logs --tail --app citizen-sphere-frontend

# Team management
heroku teams:info runtimeterror
heroku apps --team runtimeterror
```

---

## 🎉 Summary

The deployment architecture uses a **multi-script approach** with **Docker containerization**:

1. **deploy-all.sh**: Orchestrates the process
2. **deploy-backend.sh** & **deploy-frontend.sh**: Handle specific deployments
3. **heroku.yml**: Tells Heroku how to build containers
4. **Dockerfiles**: Define the container build process
5. **cleanup-deployment.sh**: Provides safe resource cleanup

All files work together to create a robust, scalable deployment pipeline for the Citizen Sphere platform on Heroku with optimal configuration for users in India, UK, and Australia.