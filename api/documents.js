import axios from 'axios';
import { RAGIE_API_KEY, RAGIE_API_BASE, handleCors } from './_config.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (!RAGIE_API_KEY) {
    return res.status(500).json({ error: 'Ragie API key not configured' });
  }

  try {
    const { partition, limit = 100, offset = 0 } = req.query;

    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    if (partition) params.append('partition', partition);

    const response = await axios.get(`${RAGIE_API_BASE}/documents?${params}`, {
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('List documents error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
}
