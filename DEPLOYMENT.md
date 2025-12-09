# Deployment Guide - Render

This guide explains how to deploy the Collaborative Code Editor to Render.

## Prerequisites

- GitHub account
- Render account (free) - sign up at https://render.com
- Code pushed to a GitHub repository

## Quick Start

The application is configured for automatic deployment using `render.yaml`. Simply:

1. Push your code to GitHub
2. Connect Render to your repository  
3. Render automatically reads `render.yaml` and deploys!

## Detailed Steps

### 1. Push to GitHub

If you haven't already, initialize a git repository and push to GitHub:

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit with Render deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/collaborative-coder.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Render

#### Option A: Using Blueprint (Recommended)

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account (if not already connected)
4. Select your repository: `collaborative-coder`
5. Render detects `render.yaml` automatically
6. Click **"Apply"**
7. Deployment starts automatically! ✅

#### Option B: Manual Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. Configure:
   - **Name**: `collaborative-coder`
   - **Runtime**: Docker
   - **Branch**: `main`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
5. Set environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
6. Click **"Create Web Service"**

### 3. Monitor Deployment

- Build time: ~2-3 minutes
- Logs show build progress
- Once deployed, you'll get a URL: `https://collaborative-coder-xxxx.onrender.com`

### 4. Verify Deployment

Visit your Render URL and test:

- ✅ Application loads
- ✅ WebSocket connects (status shows "Connected")
- ✅ JavaScript code execution works
- ✅ Python code execution works (Pyodide loads)
- ✅ Real-time collaboration between tabs

## Configuration

### render.yaml

The `render.yaml` file configures:

- **Service Type**: Web Service (Docker)
- **Plan**: Free (750 hours/month)
- **Region**: Oregon (change to `frankfurt` or `singapore` if needed)
- **Auto-deploy**: Enabled (deploys on every push to main)
- **Health Check**: `/api/health` endpoint
- **Environment**: Production settings

### Environment Variables

Default environment variables in `render.yaml`:
```yaml
- NODE_ENV: production
- PORT: 3001
```

To add more, edit `render.yaml` or add via Render Dashboard → Environment.

## Custom Domain (Optional)

1. In Render Dashboard, go to your service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain (e.g., `code.yourdomain.com`)
4. Update DNS with provided CNAME record
5. SSL certificate auto-generated ✅

## Troubleshooting

### Build Fails

**Check Docker Build Locally:**
```bash
docker build -t collaborative-coder .
```

**Common Issues:**
- Missing dependencies: Check `package.json`
- Build errors: Check logs in Render Dashboard

### Application Not Loading

1. Check Render logs for errors
2. Verify health check endpoint: `https://your-app.onrender.com/api/health`
3. Should return: `{"status":"ok","timestamp":"..."}`

### WebSocket Not Connecting

- WebSocket support is enabled by default on Render
- Check browser console for connection errors
- Verify Socket.IO CORS settings in `server/index.js`

### Free Tier Limitations

Render free tier includes:
- ✅ 750 hours/month (enough for 24/7 running one app)
- ⏸️ Spins down after 15 min of inactivity
- 🔄 Cold start: ~30 seconds when waking up
- 💾 512MB RAM

**Prevent spin-down:** Upgrade to a paid plan ($7/month) for always-on.

## Continuous Deployment

The app auto-deploys when you push to `main`:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Render automatically:
# 1. Detects push
# 2. Builds Docker image
# 3. Deploys new version
# 4. Routes traffic (zero downtime)
```

## Monitoring

### View Logs

Render Dashboard → Your Service → Logs

Real-time logs show:
- Application startup
- HTTP requests
- WebSocket connections
- Errors and warnings

### Metrics

Render Dashboard → Your Service → Metrics

View:
- CPU usage
- Memory usage
- Request count
- Response times

## Scaling

### Vertical Scaling
Upgrade plan in Render Dashboard:
- **Starter**: $7/month - 512MB RAM, always-on
- **Standard**: $25/month - 2GB RAM
- **Pro**: $85/month - 4GB RAM

### Horizontal Scaling
Not available on free tier. Requires paid plan.

## Alternative Deployment Platforms

The Dockerfile works with any Docker platform:

- **Railway**: `railway up`
- **Fly.io**: `fly launch && fly deploy`
- **Google Cloud Run**: Deploy via console
- **AWS ECS/Fargate**: Use existing Dockerfile
- **DigitalOcean**: App Platform with Docker

## Getting Help

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- GitHub Issues: Report issues in your repository

## Summary

✅ **Easy deployment** with render.yaml  
✅ **Auto-deploy** on git push  
✅ **Free tier** with 750 hours/month  
✅ **SSL** included automatically  
✅ **WebSocket** support built-in  

Your collaborative code editor is now live! 🚀
