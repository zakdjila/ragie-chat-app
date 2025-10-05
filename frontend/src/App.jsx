import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Chat from './components/Chat';
import DocumentList from './components/DocumentList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshDocuments(prev => prev + 1);
    setActiveTab('documents');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 Ragie Chat</h1>
        <p>Upload documents and chat with your knowledge base</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          📤 Upload
        </button>
        <button
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📚 Documents
        </button>
        <button
          className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
      </div>

      <div className="content">
        {activeTab === 'upload' && (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        )}
        {activeTab === 'documents' && (
          <DocumentList refresh={refreshDocuments} />
        )}
        {activeTab === 'chat' && <Chat />}
      </div>
    </div>
  );
}

export default App;
