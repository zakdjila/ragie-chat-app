# 🤖 Ragie Chat - AI-Powered Document Intelligence

> Transform any document, video, or audio file into an intelligent, conversational knowledge base using RAG (Retrieval Augmented Generation) and OpenAI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)

## 🌟 What Does This Do?

Imagine having a super-smart assistant that has read all your documents, watched your videos, and listened to your audio files - and can answer questions about them instantly. That's exactly what this app does!

**In Simple Terms:**
1. 📤 **Upload** any file (PDFs, videos, audio, images, etc.)
2. 🤖 **Ask questions** in plain English
3. 💬 **Get accurate answers** based on your uploaded content

It's like ChatGPT, but it actually knows about YOUR specific documents and content.

## ✨ Key Features

### 📁 Universal File Support
Upload virtually anything:
- 📄 **Documents**: PDFs, Word, Excel, PowerPoint, Text files
- 🖼️ **Images**: PNG, JPG, TIFF, and more
- 🎬 **Videos**: MP4, AVI, MOV
- 🎵 **Audio**: MP3, WAV
- 📧 **Emails**: EML, MSG

### 🧠 Smart AI Modes

**🤖 LLM Mode** - Get natural, conversational answers
- AI reads your documents and gives you clear, helpful responses
- Choose from GPT-5, GPT-4.1, or lightweight models
- Customize how the AI responds with system prompts

**📊 Raw Retrieval Mode** - See exactly what was found
- View the exact chunks of text the AI found
- See relevance scores for each piece
- Perfect for fact-checking and research

### 🎯 Advanced Features

- **Custom System Prompts**: Tell the AI how to respond (e.g., "respond in bullet points", "be concise", "act like an expert")
- **Metadata Tagging**: Organize documents with custom tags and filters
- **Partition Support**: Group documents into categories
- **View Document Chunks**: See exactly how your files were processed
- **Smart Processing**: Different modes for text extraction vs. image/table extraction

## 🚀 Quick Start (Non-Technical Guide)

### What You'll Need

1. **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
2. **Ragie API Key** - [Get one free at ragie.ai](https://www.ragie.ai/)
3. **OpenAI API Key** - [Get one at openai.com](https://platform.openai.com/)

### Installation Steps

**Step 1: Get the Code**
```bash
git clone https://github.com/YOUR_USERNAME/ragie-chat-app.git
cd ragie-chat-app
```

**Step 2: Add Your API Keys**

1. Find the file called `.env` in the main folder
2. Open it and replace the placeholder text:
   ```
   RAGIE_API_KEY=your_actual_ragie_key_here
   OPENAI_API_KEY=your_actual_openai_key_here
   PORT=3001
   ```

**Step 3: Install & Run**
```bash
# Install everything (only needed once)
npm install

# Install backend
cd backend && npm install && cd ..

# Install frontend
cd frontend && npm install && cd ..

# Start the app
npm start
```

**Step 4: Open Your Browser**

Go to: http://localhost:3002

That's it! 🎉

## 📖 How to Use

### 1. Upload Documents

1. Click the **📤 Upload** tab
2. Click the pretty upload box and select a file
3. Choose processing mode:
   - **Fast**: Quick text extraction (good for most documents)
   - **Hi-res**: Extracts images and tables (slower, great for PDFs with visuals)
   - **All**: Processes audio and video too
4. (Optional) Add metadata tags like `category: training`, `year: 2024`
5. Click **Upload Document**

### 2. Chat with Your Documents

1. Click the **💬 Chat** tab
2. Toggle **🤖 LLM Mode** ON for AI answers
3. Select your preferred AI model (GPT-4.1 Mini is recommended)
4. (Optional) Click **⚙️ System Prompt** to customize AI behavior
5. Type your question and press Send!

### 3. Browse Your Documents

1. Click the **📚 Documents** tab
2. See all uploaded documents with their status
3. Click **View Details** to see metadata
4. Click **🔍 View All Chunks** to see how the document was processed
5. Delete documents you no longer need

## 🎨 Understanding the Interface

### Processing Modes Explained

| Mode | Best For | What It Does | Speed |
|------|----------|--------------|-------|
| **Fast** | Text documents, emails | Extracts text only | ⚡ Very Fast |
| **Hi-res** | PDFs with images/tables | Extracts text, images, and tables | 🐌 Slow (20x slower) |
| **All** | Videos, audio, all media | Processes everything including audio/video | 🕐 Varies |

### Document Status Lifecycle

Your document goes through these stages:

```
pending → partitioning → partitioned → refined → chunked → indexed → ready ✅
```

- **indexed**: Ready for basic chat
- **ready**: Fully processed with summaries

### What Are "Chunks"?

When you upload a document, it gets split into smaller pieces called "chunks". Think of it like cutting a book into paragraphs - this helps the AI find relevant information quickly.

When you ask a question, the AI:
1. Searches through all chunks
2. Finds the most relevant ones
3. Uses them to answer your question

## 🔧 Technical Architecture

<details>
<summary>For Developers (Click to expand)</summary>

### Tech Stack

**Frontend:**
- React 18 with Hooks
- Vite for blazing-fast development
- Axios for API communication
- LocalStorage for persistent settings

**Backend:**
- Node.js + Express
- OpenAI SDK (Responses API)
- Ragie SDK for document processing
- Multer for file uploads

### How RAG Works Here

1. **Document Ingestion** (Ragie)
   - Upload → Ragie API
   - Automatic chunking, embedding, and indexing
   - Supports multiple processing strategies

2. **Retrieval** (Ragie)
   - User query → Ragie retrieval API
   - Returns top-K most relevant chunks with scores

3. **Augmented Generation** (OpenAI)
   - System prompt + retrieved chunks + user query → OpenAI
   - Uses OpenAI Responses API
   - Returns natural language answer + source chunks

### API Endpoints

**Backend (Port 3001):**
- `POST /api/documents/upload` - Upload files
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/:id/chunks` - View document chunks
- `DELETE /api/documents/:id` - Delete document
- `POST /api/retrievals` - Raw retrieval (chunks only)
- `POST /api/chat` - RAG chat (LLM answers)

**Frontend (Port 3002):**
- React SPA with three main views
- Real-time updates via React state management

### Project Structure

```
ragie-chat-app/
├── backend/
│   ├── server.js          # Express server + API routes
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx    # Upload interface
│   │   │   ├── DocumentList.jsx  # Document management
│   │   │   └── Chat.jsx          # Chat interface
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .env                   # API keys (DO NOT COMMIT)
├── .gitignore
└── README.md
```

</details>

## 🎯 Use Cases

**For Businesses:**
- 📊 Analyze reports and presentations instantly
- 📧 Search through emails and documents
- 🎓 Create a searchable knowledge base
- 📹 Extract insights from meeting recordings

**For Students:**
- 📚 Study from lecture recordings
- 📝 Get summaries of research papers
- 🎥 Extract notes from video lectures
- 📖 Search across all your course materials

**For Content Creators:**
- 🎬 Transcribe and search video content
- 🎙️ Extract insights from podcasts
- 📄 Organize research materials
- ✍️ Find specific quotes and references

## 🔐 Privacy & Security

- ✅ All data is processed through Ragie's secure API
- ✅ API keys stored in `.env` (never committed to git)
- ✅ No data is stored by this application (only in Ragie)
- ✅ You can delete documents anytime

**Note**: Review Ragie and OpenAI's privacy policies before uploading sensitive information.

## 🛠️ Troubleshooting

### Common Issues

**"OpenAI API key not configured"**
- Check that your `.env` file has `OPENAI_API_KEY=your_key`
- Restart the server after adding the key

**"Failed to load chunks"**
- Wait for document status to be `indexed` or `ready`
- Refresh the documents tab

**Upload fails for video/audio**
- Make sure you're using "All" processing mode
- Videos/audio can't use "Fast" or "Hi-res" modes

**Port already in use**
- Change `PORT=3001` in `.env` to another number
- Update `vite.config.js` proxy target to match

## 🤝 Contributing

Contributions are welcome! This project was built to be educational and extensible.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this for personal or commercial projects!

## 🙏 Acknowledgments

- **Ragie** - For the amazing RAG infrastructure
- **OpenAI** - For the GPT models
- **Claude AI** - For helping build this project

---

**Built with ❤️ for the AI community**

*Star ⭐ this repo if you find it useful!*
