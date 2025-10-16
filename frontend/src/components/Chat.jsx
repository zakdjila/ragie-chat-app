import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './Chat.css';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [partition, setPartition] = useState('');
  const [topK, setTopK] = useState(5);
  const [useLLM, setUseLLM] = useState(true);
  const [model, setModel] = useState('gpt-4.1-mini');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);
  const messagesEndRef = useRef(null);

  // Load system prompt from localStorage on mount
  useEffect(() => {
    const savedSystemPrompt = localStorage.getItem('ragie_system_prompt');
    if (savedSystemPrompt) {
      setSystemPrompt(savedSystemPrompt);
    }
  }, []);

  // Save system prompt to localStorage whenever it changes
  useEffect(() => {
    if (systemPrompt) {
      localStorage.setItem('ragie_system_prompt', systemPrompt);
    }
  }, [systemPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        query: input,
        top_k: topK
      };

      if (partition) payload.partition = partition;

      let response;
      let assistantMessage;

      if (useLLM) {
        // Use LLM mode
        payload.model = model;
        if (systemPrompt) payload.system_prompt = systemPrompt;

        response = await axios.post(`${API_BASE_URL}/api/chat`, payload);

        assistantMessage = {
          id: Date.now() + 1,
          type: 'llm',
          answer: response.data.answer,
          chunks: response.data.chunks || [],
          model: response.data.model,
          timestamp: new Date()
        };
      } else {
        // Raw retrieval mode
        response = await axios.post(`${API_BASE_URL}/api/retrievals`, payload);

        assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.data.scored_chunks || [],
          timestamp: new Date()
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: err.response?.data?.error || 'Failed to retrieve results',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const renderChunk = (chunk, index) => {
    const metadata = chunk.document_metadata || {};

    return (
      <div key={index} className="chunk-result">
        <div className="chunk-header">
          <span className="chunk-score">Score: {chunk.score?.toFixed(4)}</span>
          <span className="chunk-doc">{metadata.document_name || 'Unknown'}</span>
        </div>
        <div className="chunk-text">{chunk.text}</div>

        <div className="chunk-metadata">
          {metadata.partition && (
            <span className="meta-tag">📁 {metadata.partition}</span>
          )}
          {metadata.document_id && (
            <span className="meta-tag">🆔 {metadata.document_id.slice(0, 8)}...</span>
          )}
          {chunk.chunk_id && (
            <span className="meta-tag">🔖 Chunk {chunk.chunk_id.slice(0, 8)}...</span>
          )}
          {metadata.document_type && (
            <span className="meta-tag">📄 {metadata.document_type}</span>
          )}

          {/* Display custom metadata */}
          {Object.entries(metadata).map(([key, value]) => {
            // Skip built-in fields
            if (['document_id', 'document_name', 'document_type', 'document_source',
                 'document_uploaded_at', 'partition', 'start_time', 'end_time'].includes(key)) {
              return null;
            }

            // Display custom metadata
            return (
              <span key={key} className="meta-tag custom-meta">
                {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
              </span>
            );
          })}
        </div>

        {/* Expandable section for full metadata */}
        <details className="chunk-details">
          <summary>View Full Metadata</summary>
          <pre className="metadata-json">{JSON.stringify(chunk, null, 2)}</pre>
        </details>
      </div>
    );
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <h2>💬 Chat with Documents</h2>

        <div className="mode-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={useLLM}
              onChange={(e) => setUseLLM(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
          <span className="mode-label">
            {useLLM ? '🤖 LLM Mode (AI Answers)' : '📊 Raw Retrieval (Chunks Only)'}
          </span>
        </div>

        {useLLM && (
          <div className="llm-controls">
            <div className="control-group">
              <label>Model:</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="model-select"
              >
                <option value="gpt-5">GPT-5</option>
                <option value="gpt-5-nano">GPT-5 Nano</option>
                <option value="gpt-5-mini">GPT-5 Mini</option>
                <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
              </select>
            </div>
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className="btn-system-prompt"
            >
              {showSystemPrompt ? '✓ Save & Close' : '⚙️ System Prompt'}
            </button>
          </div>
        )}

        {useLLM && showSystemPrompt && (
          <div className="system-prompt-section">
            <label>Custom System Prompt (optional):</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Leave empty for default prompt. Customize how the AI should respond..."
              className="system-prompt-textarea"
              rows="4"
            />
          </div>
        )}

        <div className="chat-controls">
          <div className="control-group">
            <label>Partition:</label>
            <input
              type="text"
              placeholder="All partitions"
              value={partition}
              onChange={(e) => setPartition(e.target.value)}
              className="partition-input"
            />
          </div>
          <div className="control-group">
            <label>Top K:</label>
            <input
              type="number"
              min="1"
              max="20"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="topk-input"
            />
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="btn-clear">
              Clear Chat
            </button>
          )}
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>👋 Ask a question about your documents!</p>
            <p className="hint">The system will retrieve relevant chunks from your uploaded documents.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              {message.type === 'user' && (
                <div className="message-content">
                  <strong>You:</strong>
                  <p>{message.content}</p>
                </div>
              )}

              {message.type === 'llm' && (
                <div className="message-content llm-content">
                  <div className="llm-header">
                    <strong>🤖 AI Answer:</strong>
                    <span className="model-badge">{message.model}</span>
                  </div>
                  <div className="llm-answer">
                    {message.answer}
                  </div>
                  <details className="source-chunks">
                    <summary>📚 View Source Chunks ({message.chunks.length})</summary>
                    <div className="chunks-container">
                      {message.chunks.map((chunk, index) => renderChunk(chunk, index))}
                    </div>
                  </details>
                </div>
              )}

              {message.type === 'assistant' && (
                <div className="message-content">
                  <strong>Results ({message.content.length}):</strong>
                  {message.content.length === 0 ? (
                    <p className="no-results">No relevant documents found.</p>
                  ) : (
                    <div className="chunks-container">
                      {message.content.map((chunk, index) => renderChunk(chunk, index))}
                    </div>
                  )}
                </div>
              )}

              {message.type === 'error' && (
                <div className="message-content error-content">
                  <strong>Error:</strong>
                  <p>{message.content}</p>
                </div>
              )}

              <span className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        {loading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="chat-input"
          disabled={loading}
        />
        <button type="submit" className="btn-send" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
