// API Configuration
// In production on Vercel, API routes are serverless functions at /api/*
// In development, use empty string to leverage Vite's proxy
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Requests will use relative paths which work with:
// - Vite's proxy in development (proxies /api/* to http://localhost:3001)
// - Vercel serverless functions in production (/api/* routes)
