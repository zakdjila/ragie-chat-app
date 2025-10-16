import axios from 'axios';
import OpenAI from 'openai';
import { RAGIE_API_KEY, OPENAI_API_KEY, RAGIE_API_BASE, handleCors } from './_config.js';

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

export default async function handler(req, res) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!RAGIE_API_KEY) {
    return res.status(500).json({ error: 'Ragie API key not configured' });
  }

  if (!OPENAI_API_KEY || !openai) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
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
    res.status(200).json({
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
}
