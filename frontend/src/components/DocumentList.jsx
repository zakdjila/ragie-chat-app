import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DocumentList.css';

function DocumentList({ refresh }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [chunks, setChunks] = useState(null);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [partition, setPartition] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [refresh, partition]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (partition) params.partition = partition;

      const response = await axios.get('/api/documents', { params });
      const data = response.data;

      // Handle different response formats
      if (Array.isArray(data)) {
        setDocuments(data);
      } else if (data.results && Array.isArray(data.results)) {
        setDocuments(data.results);
      } else if (data.documents && Array.isArray(data.documents)) {
        setDocuments(data.documents);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await axios.delete(`/api/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete document');
    }
  };

  const viewDocument = async (doc) => {
    setSelectedDoc(doc);
    setChunks(null); // Reset chunks when viewing different doc
  };

  const viewChunks = async (docId) => {
    setLoadingChunks(true);
    try {
      const response = await axios.get(`/api/documents/${docId}/chunks`);
      setChunks(response.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load chunks');
    } finally {
      setLoadingChunks(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      ready: '#22c55e',
      indexed: '#3b82f6',
      pending: '#f59e0b',
      failed: '#ef4444',
      partitioning: '#8b5cf6',
      chunked: '#06b6d4'
    };

    return (
      <span
        className="status-badge"
        style={{ background: statusColors[status] || '#6b7280' }}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="document-list">
        <h2>Documents</h2>
        <div className="loading">Loading documents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-list">
        <h2>Documents</h2>
        <div className="alert error">{error}</div>
        <button onClick={fetchDocuments} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="document-list">
      <div className="list-header">
        <h2>Documents ({documents.length})</h2>
        <div className="filter-section">
          <input
            type="text"
            placeholder="Filter by partition..."
            value={partition}
            onChange={(e) => setPartition(e.target.value)}
            className="partition-filter"
          />
          <button onClick={fetchDocuments} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="empty-state">
          <p>No documents found. Upload your first document!</p>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="doc-header">
                <h3>{doc.name}</h3>
                {getStatusBadge(doc.status)}
              </div>

              <div className="doc-info">
                {doc.partition && (
                  <div className="info-row">
                    <strong>Partition:</strong> {doc.partition}
                  </div>
                )}
                {doc.chunk_count !== null && (
                  <div className="info-row">
                    <strong>Chunks:</strong> {doc.chunk_count}
                  </div>
                )}
                {doc.page_count !== null && (
                  <div className="info-row">
                    <strong>Pages:</strong> {doc.page_count}
                  </div>
                )}
                <div className="info-row">
                  <strong>Created:</strong> {new Date(doc.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="doc-actions">
                <button onClick={() => viewDocument(doc)} className="btn-view">
                  View Details
                </button>
                <button onClick={() => handleDelete(doc.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoc && (
        <div className="modal" onClick={() => { setSelectedDoc(null); setChunks(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setSelectedDoc(null); setChunks(null); }}>
              ✕
            </button>
            <h3>{selectedDoc.name}</h3>

            <div className="detail-section">
              <strong>ID:</strong>
              <code>{selectedDoc.id}</code>
            </div>

            <div className="detail-section">
              <strong>Status:</strong>
              {getStatusBadge(selectedDoc.status)}
            </div>

            {selectedDoc.chunk_count !== null && (
              <div className="detail-section">
                <strong>Total Chunks:</strong>
                <span>{selectedDoc.chunk_count}</span>
              </div>
            )}

            {selectedDoc.external_id && (
              <div className="detail-section">
                <strong>External ID:</strong>
                <span>{selectedDoc.external_id}</span>
              </div>
            )}

            {selectedDoc.metadata && Object.keys(selectedDoc.metadata).length > 0 && (
              <div className="detail-section">
                <strong>Metadata:</strong>
                <pre>{JSON.stringify(selectedDoc.metadata, null, 2)}</pre>
              </div>
            )}

            <div className="detail-section">
              <strong>Created:</strong>
              <span>{new Date(selectedDoc.created_at).toLocaleString()}</span>
            </div>

            <div className="detail-section">
              <strong>Updated:</strong>
              <span>{new Date(selectedDoc.updated_at).toLocaleString()}</span>
            </div>

            <button
              onClick={() => viewChunks(selectedDoc.id)}
              className="btn-view-chunks"
              disabled={loadingChunks}
            >
              {loadingChunks ? 'Loading Chunks...' : chunks ? 'Refresh Chunks' : '🔍 View All Chunks'}
            </button>

            {chunks && (
              <div className="chunks-section">
                <h4>Document Chunks ({Array.isArray(chunks) ? chunks.length : chunks.chunks?.length || 0})</h4>
                <div className="chunks-list">
                  {(Array.isArray(chunks) ? chunks : chunks.chunks || []).map((chunk, index) => (
                    <div key={chunk.chunk_id || index} className="chunk-item">
                      <div className="chunk-header">
                        <span className="chunk-index">#{index + 1}</span>
                        {chunk.chunk_id && (
                          <span className="chunk-id">ID: {chunk.chunk_id.slice(0, 12)}...</span>
                        )}
                      </div>
                      <div className="chunk-content">
                        {chunk.text || chunk.content || 'No text content'}
                      </div>
                      <details className="chunk-raw">
                        <summary>View Raw Data</summary>
                        <pre>{JSON.stringify(chunk, null, 2)}</pre>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentList;
