import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const RAGIE_API_KEY = process.env.RAGIE_API_KEY?.trim();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim();
const RAGIE_API_BASE = 'https://api.ragie.ai';

// Initialize OpenAI client
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ragieConfigured: !!RAGIE_API_KEY });
});

// Upload document to Ragie
app.post('/api/documents/upload', upload.single('file'), async (req, res) => {
  try {
    if (!RAGIE_API_KEY) {
      return res.status(500).json({ error: 'Ragie API key not configured' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { mode, metadata, name, partition, external_id } = req.body;

    // Create form data for Ragie API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    if (mode) formData.append('mode', mode);
    if (name) formData.append('name', name);
    if (partition) formData.append('partition', partition);
    if (external_id) formData.append('external_id', external_id);

    // Parse and add metadata if provided
    if (metadata) {
      try {
        const metadataObj = JSON.parse(metadata);
        formData.append('metadata', JSON.stringify(metadataObj));
      } catch (e) {
        console.error('Invalid metadata JSON:', e);
      }
    }

    // Upload to Ragie
    const response = await axios.post(`${RAGIE_API_BASE}/documents`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${RAGIE_API_KEY}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json(response.data);
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);

    // Clean up file if it exists
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
});

// List documents
app.get('/api/documents', async (req, res) => {
  try {
    if (!RAGIE_API_KEY) {
      return res.status(500).json({ error: 'Ragie API key not configured' });
    }

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

    res.json(response.data);
  } catch (error) {
    console.error('List documents error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
});

// Get document by ID
app.get('/api/documents/:id', async (req, res) => {
  try {
    if (!RAGIE_API_KEY) {
      return res.status(500).json({ error: 'Ragie API key not configured' });
    }

    const response = await axios.get(`${RAGIE_API_BASE}/documents/${req.params.id}`, {
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Get document error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
});

// Get document chunks
app.get('/api/documents/:id/chunks', async (req, res) => {
  try {
    if (!RAGIE_API_KEY) {
      return res.status(500).json({ error: 'Ragie API key not configured' });
    }

    const response = await axios.get(`${RAGIE_API_BASE}/documents/${req.params.id}/chunks`, {
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Get chunks error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
});

// Retrieve/Query documents (chat)
app.post('/api/retrievals', async (req, res) => {
  try {
    if (!RAGIE_API_KEY) {
      return res.status(500).json({ error: 'Ragie API key not configured' });
    }

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

    res.json(response.data);
  } catch (error) {
    console.error('Retrieval error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
});

// Chat with LLM (RAG with OpenAI)
app.post('/api/chat', async (req, res) => {
  try {
    if (!RAGIE_API_KEY) {
      return res.status(500).json({ error: 'Ragie API key not configured' });
    }

    if (!OPENAI_API_KEY || !openai) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const { query, partition, top_k = 5, filters, model = 'gpt-4.1-mini', system_prompt } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Step 1: Retrieve relevant chunks from Ragie
    const retrievalPayload = {
      query,
      top_k
    };

    if (partition) retrievalPayload.partition = partition;
    if (filters) retrievalPayload.filters = filters;

    const retrievalResponse = await axios.post(`${RAGIE_API_BASE}/retrievals`, retrievalPayload, {
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const chunks = retrievalResponse.data.scored_chunks || [];

    // Step 2: Format chunks as context
    const context = chunks.map((chunk, index) =>
      `[Chunk ${index + 1}] (Score: ${chunk.score?.toFixed(4)})
Source: ${chunk.document_metadata?.document_name || 'Unknown'}
Content: ${chunk.text}`
    ).join('\n\n');

    // Step 3: Build the prompt for OpenAI with context injected
    const defaultSystemPrompt = `You are a helpful AI assistant. Use the provided context from the retrieved documents to answer the user's question accurately and comprehensively. If the context doesn't contain relevant information, say so clearly.`;

    const baseSystemPrompt = system_prompt || defaultSystemPrompt;

    // Build the full input with context appended after system prompt and before user question
    const fullInput = `${baseSystemPrompt}

RETRIEVED CONTEXT FROM DOCUMENTS:
${context}

USER QUESTION: ${query}`;

    // Step 4: Call OpenAI's Responses API
    const response = await openai.responses.create({
      model: model,
      input: fullInput
    });

    // Step 5: Return both the LLM response and the raw chunks
    res.json({
      answer: response.output_text,
      chunks: chunks,
      model: model,
      context_used: context
    });

  } catch (error) {
    console.error('Chat error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message
    });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    if (!RAGIE_API_KEY) {
      return res.status(500).json({ error: 'Ragie API key not configured' });
    }

    await axios.delete(`${RAGIE_API_BASE}/documents/${req.params.id}`, {
      headers: {
        'Authorization': `Bearer ${RAGIE_API_KEY}`
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.detail || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Ragie API configured: ${!!RAGIE_API_KEY}`);
  console.log(`🤖 OpenAI API configured: ${!!OPENAI_API_KEY}`);
});
