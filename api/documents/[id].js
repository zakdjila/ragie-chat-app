import axios from 'axios';
import { RAGIE_API_KEY, RAGIE_API_BASE, handleCors } from '../_config.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (!RAGIE_API_KEY) {
    return res.status(500).json({ error: 'Ragie API key not configured' });
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const response = await axios.get(`${RAGIE_API_BASE}/documents/${id}`, {
        headers: {
          'Authorization': `Bearer ${RAGIE_API_KEY}`
        }
      });
      res.status(200).json(response.data);
    } else if (req.method === 'DELETE') {
      await axios.delete(`${RAGIE_API_BASE}/documents/${id}`, {
        headers: {
          'Authorization': `Bearer ${RAGIE_API_KEY}`
        }
      });
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Document operation error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
}
