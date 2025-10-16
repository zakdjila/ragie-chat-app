ana# Deployment Guide

This guide will help you deploy the Ragie Chat App to Vercel.

## Architecture

This application has two separate components:
- **Frontend**: React app (Vite) in `/frontend`
- **Backend**: Express API in `/backend`

They must be deployed as separate Vercel projects.

## Step 1: Deploy the Backend

### 1.1 Create New Vercel Project for Backend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure the project:
   - **Project Name**: `ragie-chat-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

### 1.2 Add Environment Variables

In the Vercel project settings, add these environment variables:

```
RAGIE_API_KEY=your_ragie_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

⚠️ **Important**: Never commit these keys to Git! They should only be set in Vercel's environment variables.

### 1.3 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://ragie-chat-backend.vercel.app`)

## Step 2: Deploy the Frontend

### 2.1 Update vercel.json

1. Open `/vercel.json` in the root directory
2. Update line 8 with your actual backend URL:

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "npm install --prefix frontend",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR-BACKEND-URL.vercel.app/api/:path*"
    }
  ]
}
```

Replace `YOUR-BACKEND-URL.vercel.app` with your actual backend URL from Step 1.3.

### 2.2 Create New Vercel Project for Frontend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import the same Git repository
4. Configure the project:
   - **Project Name**: `ragie-chat-app` (or your preferred name)
   - **Root Directory**: (leave as root - the vercel.json will handle the rest)
   - **Framework Preset**: Other (vercel.json overrides this)
   - **Build Command**: Auto-detected from vercel.json
   - **Output Directory**: Auto-detected from vercel.json

### 2.3 Environment Variables (Optional)

You can optionally set `VITE_API_URL` if you want to override the proxy behavior:

```
VITE_API_URL=https://your-backend-url.vercel.app
```

However, this is not necessary if you've configured the rewrite in `vercel.json`.

### 2.4 Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Visit your frontend URL to test the application

## Step 3: Test Your Deployment

1. Open your frontend URL
2. Try uploading a document
3. Try chatting with your documents
4. Check the browser console for any errors

## Troubleshooting

### 404 Errors

If you're getting 404 errors:
- Verify your backend is deployed and accessible
- Check that the `vercel.json` rewrite rule has the correct backend URL
- Ensure the Root Directory is set correctly for each project

### API Connection Errors

If the frontend can't connect to the backend:
- Open browser DevTools → Network tab
- Check if API calls are going to the right URL
- Verify CORS is properly configured (backend has `cors()` middleware)

### Environment Variables Not Working

- Make sure environment variables are set in Vercel Dashboard, not in code
- Redeploy after adding/changing environment variables
- Backend vars: `RAGIE_API_KEY`, `OPENAI_API_KEY`
- Frontend vars: `VITE_API_URL` (optional)

### Build Failures

**Frontend build fails:**
- Check that all dependencies are in `frontend/package.json`
- Ensure the build command in `vercel.json` is correct

**Backend deployment fails:**
- Verify `backend/vercel.json` is valid
- Check that `server.js` exports properly for Vercel serverless

## Alternative: Single Project Deployment

If you prefer to deploy as a single project:

1. Deploy only the frontend project with the `vercel.json` rewrite
2. The backend will be deployed as Vercel serverless functions via the rewrite
3. This is simpler but may have limitations with file uploads

## Production Checklist

Before going live:
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set in Vercel (not in code)
- [ ] API connection tested (upload + chat)
- [ ] `.env` files NOT committed to Git
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled (automatic on Vercel)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure both projects are deployed successfully
