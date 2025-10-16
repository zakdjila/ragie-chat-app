import axios from 'axios';
import FormData from 'form-data';
import { RAGIE_API_KEY, RAGIE_API_BASE, handleCors } from '../_config.js';

// Disable body parsing for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!RAGIE_API_KEY) {
    return res.status(500).json({ error: 'Ragie API key not configured' });
  }

  try {
    // For Vercel, we need to use a different approach for file uploads
    // Parse multipart form data manually
    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // Forward the request body directly to Ragie
    const formData = new FormData();

    // Get the boundary from content-type header
    const boundary = contentType.split('boundary=')[1];

    // Forward the raw body with proper headers
    const response = await axios.post(`${RAGIE_API_BASE}/documents`, req, {
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`,
        'Content-Type': contentType,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
}
