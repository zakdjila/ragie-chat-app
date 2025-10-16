# Simple Single-Project Deployment Guide

This app now deploys as **ONE** Vercel project with serverless functions. Much simpler!

## Architecture

- **Frontend**: React app (Vite) in `/frontend` → builds to static files
- **Backend**: Serverless functions in `/api` → runs as Vercel Functions
- **Everything deploys together** in one Vercel project

## Quick Deploy Steps

### 1. Go to Vercel Dashboard
Visit [vercel.com/dashboard](https://vercel.com/dashboard)

### 2. Import Your Repository
1. Click "Add New" → "Project"
2. Import your GitHub repository: `zakdjila/ragie-chat-app`

### 3. Configure Project
Leave all settings as default:
- **Root Directory**: Leave empty (deploy from root)
- **Framework Preset**: Other
- **Build settings**: Auto-detected from vercel.json

### 4. Add Environment Variables
This is the most important step! Click "Environment Variables" and add:

```
RAGIE_API_KEY=your_new_ragie_api_key
OPENAI_API_KEY=your_new_openai_api_key
```

⚠️ **IMPORTANT**: Use NEW API keys (rotate your old ones since they were exposed)

### 5. Deploy
Click "Deploy" and wait 2-3 minutes

## That's It!

Once deployed:
- Your frontend will be at `https://your-project.vercel.app`
- API routes automatically available at `https://your-project.vercel.app/api/*`
- No need to configure any URLs or connect multiple projects

## How It Works

### Serverless Functions
All backend routes are now serverless functions:
- `/api/health` - Health check
- `/api/documents` - List documents
- `/api/documents/upload` - Upload files
- `/api/documents/[id]` - Get/Delete document
- `/api/documents/[id]/chunks` - Get chunks
- `/api/retrievals` - RAG retrieval
- `/api/chat` - LLM chat with RAG

### Local Development
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend

# Or both at once
npm run dev
```

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure `frontend/package.json` has all dependencies
- Verify vercel.json is not modified

### API Errors
- Verify environment variables are set in Vercel Dashboard
- Check function logs in Vercel Dashboard → Functions tab
- Make sure you're using the NEW API keys

### Frontend Shows Blank Page
- Check browser console for errors
- Verify API routes are accessible: visit `/api/health`
- Check that environment variables are set

### 404 Errors
- Clear deployment cache in Vercel
- Redeploy the project
- Ensure vercel.json rewrites are correct

## Advanced: Custom Domain
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-10 minutes)

## Support
- Vercel Docs: https://vercel.com/docs
- Ragie Docs: https://docs.ragie.ai
- OpenAI Docs: https://platform.openai.com/docs
