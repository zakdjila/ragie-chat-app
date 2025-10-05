import React, { useState } from 'react';
import axios from 'axios';
import './FileUpload.css';

function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('fast');
  const [name, setName] = useState('');
  const [partition, setPartition] = useState('');
  const [externalId, setExternalId] = useState('');
  const [metadata, setMetadata] = useState([{ key: '', value: '', type: 'string' }]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (!name && selectedFile) {
      setName(selectedFile.name);
    }

    // Auto-adjust mode based on file type
    if (selectedFile) {
      const fileType = selectedFile.type.toLowerCase();
      const fileName = selectedFile.name.toLowerCase();

      // Video files
      if (fileType.startsWith('video/') || fileName.match(/\.(mp4|avi|mov|mkv|webm)$/)) {
        if (mode === 'fast') {
          setMode('all'); // Default to 'all' for videos
        }
      }
      // Audio files
      else if (fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|m4a|aac|ogg)$/)) {
        if (mode === 'fast') {
          setMode('all'); // Default to 'all' for audio
        }
      }
    }
  };

  const handleMetadataChange = (index, field, value) => {
    const newMetadata = [...metadata];
    newMetadata[index][field] = value;
    setMetadata(newMetadata);
  };

  const addMetadataField = () => {
    setMetadata([...metadata, { key: '', value: '', type: 'string' }]);
  };

  const removeMetadataField = (index) => {
    setMetadata(metadata.filter((_, i) => i !== index));
  };

  const convertMetadataValue = (value, type) => {
    if (!value) return '';
    switch (type) {
      case 'number':
        return parseFloat(value) || 0;
      case 'boolean':
        return value === 'true' || value === '1';
      case 'array':
        return value.split(',').map(v => v.trim());
      default:
        return value;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mode', mode);

      if (name) formData.append('name', name);
      if (partition) formData.append('partition', partition.toLowerCase());
      if (externalId) formData.append('external_id', externalId);

      // Build metadata object
      const metadataObj = {};
      metadata.forEach(({ key, value, type }) => {
        if (key && value) {
          metadataObj[key] = convertMetadataValue(value, type);
        }
      });

      if (Object.keys(metadataObj).length > 0) {
        formData.append('metadata', JSON.stringify(metadataObj));
      }

      const response = await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(`Document uploaded successfully! ID: ${response.data.id}`);

      // Reset form
      setFile(null);
      setName('');
      setPartition('');
      setExternalId('');
      setMetadata([{ key: '', value: '', type: 'string' }]);
      document.getElementById('file-input').value = '';

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <h2>Upload Document</h2>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file-input">Choose File *</label>
          <div className="file-upload-container">
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              accept=".txt,.pdf,.doc,.docx,.csv,.xlsx,.xls,.ppt,.pptx,.json,.md,.html,.xml,.png,.jpg,.jpeg,.tiff,.bmp,.heic,.webp,.eml,.msg,.rst,.rtf,.epub,.odt,.tsv,.mp3,.mp4,.wav,.avi,.mov"
              required
              className="file-input-hidden"
            />
            <label htmlFor="file-input" className="file-input-label">
              <span className="file-icon">📁</span>
              <span className="file-text">
                {file ? file.name : 'Click to select or drag & drop'}
              </span>
            </label>
          </div>

          <div className="supported-formats">
            <div className="format-category">
              <strong>📄 Documents:</strong>
              <span>PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, CSV, TXT, MD, JSON, HTML, XML, RTF, EPUB, ODT, TSV</span>
            </div>
            <div className="format-category">
              <strong>🖼️ Images:</strong>
              <span>PNG, JPG, JPEG, TIFF, BMP, HEIC, WEBP</span>
            </div>
            <div className="format-category">
              <strong>📧 Email:</strong>
              <span>EML, MSG</span>
            </div>
            <div className="format-category">
              <strong>🎵 Audio:</strong>
              <span>MP3, WAV</span>
            </div>
            <div className="format-category">
              <strong>🎬 Video:</strong>
              <span>MP4, AVI, MOV</span>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="mode">Processing Mode</label>
          <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="fast">Fast (text documents only)</option>
            <option value="hi_res">High Resolution (images & tables for PDFs/Docs)</option>
            <option value="all">All (audio, video, and all document types)</option>
          </select>
          <small>
            {mode === 'fast' && '⚡ Fast mode: Text extraction only. Not for audio/video files.'}
            {mode === 'hi_res' && '🔍 Hi-res mode: Extracts images/tables (up to 20x slower). Not for audio/video files.'}
            {mode === 'all' && '🎬 All mode: Processes all media types including audio and video.'}
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="name">Document Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Auto-filled from filename"
          />
        </div>

        <div className="form-group">
          <label htmlFor="partition">Partition</label>
          <input
            id="partition"
            type="text"
            value={partition}
            onChange={(e) => setPartition(e.target.value)}
            placeholder="e.g., customer-docs, internal"
            pattern="[a-z0-9_-]*"
          />
          <small>Lowercase alphanumeric, _ and - only</small>
        </div>

        <div className="form-group">
          <label htmlFor="external-id">External ID</label>
          <input
            id="external-id"
            type="text"
            value={externalId}
            onChange={(e) => setExternalId(e.target.value)}
            placeholder="Optional external identifier or URL"
          />
        </div>

        <div className="metadata-section">
          <div className="metadata-header">
            <label>Metadata</label>
            <button type="button" onClick={addMetadataField} className="btn-add">
              + Add Field
            </button>
          </div>

          {metadata.map((field, index) => (
            <div key={index} className="metadata-row">
              <input
                type="text"
                placeholder="Key"
                value={field.key}
                onChange={(e) => handleMetadataChange(index, 'key', e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                value={field.value}
                onChange={(e) => handleMetadataChange(index, 'value', e.target.value)}
              />
              <select
                value={field.type}
                onChange={(e) => handleMetadataChange(index, 'type', e.target.value)}
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="array">Array (comma-separated)</option>
              </select>
              {metadata.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMetadataField(index)}
                  className="btn-remove"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <small>Maximum 1000 values allowed. Keys must be strings.</small>
        </div>

        <button type="submit" className="btn-submit" disabled={uploading}>
          {uploading ? 'Uploading...' : '📤 Upload Document'}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;
