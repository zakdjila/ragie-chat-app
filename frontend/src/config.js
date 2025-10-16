// API Configuration
// In production, this will use the environment variable
// In development, it defaults to the local backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// If VITE_API_URL is not set, requests will use relative paths
// which work with Vite's proxy in development
