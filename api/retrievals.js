import axios from 'axios';
import { RAGIE_API_KEY, RAGIE_API_BASE, handleCors } from './_config.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!RAGIE_API_KEY) {
    return res.status(500).json({ error: 'Ragie API key not configured' });
  }

  try {
    const { query, partition, top_k = 5, filters } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const payload = {
      query,
      top_k
    };

    if (partition) payload.partition = partition;
    if (filters) payload.filters = filters;

    const response = await axios.post(`${RAGIE_API_BASE}/retrievals`, payload, {
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Retrieval error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
}
