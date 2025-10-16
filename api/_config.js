// Shared configuration for all API routes
export const RAGIE_API_KEY = process.env.RAGIE_API_KEY?.trim();
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
export const RAGIE_API_BASE = 'https://api.ragie.ai';

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
};

// Handle CORS preflight
export function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  return false;
}
