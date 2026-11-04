import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_BASE = "https://ai-assistant-application1.onrender.com/api/rag";

// SVG Icons
const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const PaperclipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l7.88-7.88"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
);

const MessageSquareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ChevronDownIcon = ({ open }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10a37f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SidebarOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <path d="M9 3v18"/>
    <path d="m14 9 3 3-3 3"/>
  </svg>
);

const SidebarCloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <path d="M9 3v18"/>
    <path d="m16 15-3-3 3-3"/>
  </svg>
);

function App() {
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedChunks, setExpandedChunks] = useState({});

  // History & Sidebar Drawer state
  const [historyList, setHistoryList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch existing chat history from MySQL
  const fetchChatHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/chat-history`);
      if (res.ok) {
        const data = await res.json();
        setBackendOnline(true);
        if (data.history && data.history.length > 0) {
          setHistoryList(data.history);
        }
      } else {
        setBackendOnline(false);
      }
    } catch (err) {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto resize textarea
  const handleInputChange = (e) => {
    setInputQuestion(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  // Submit question
  const handleSend = async (queryToSubmit) => {
    const q = (typeof queryToSubmit === "string" ? queryToSubmit : inputQuestion).trim();
    if (!q || isLoading) return;

    const tempId = Date.now();
    const newEntry = {
      id: tempId,
      question: q,
      answer: null,
      chunks: [],
      error: null
    };

    setMessages((prev) => [...prev, newEntry]);
    setInputQuestion("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get answer");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                answer: data.answer || "No answer generated.",
                chunks: data.chunks || []
              }
            : msg
        )
      );

      // Refresh history sidebar
      fetchChatHistory();
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, error: err.message || "Error generating response" }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle PDF Upload
  const handleUploadSubmit = async () => {
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setUploadFeedback(null);

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setUploadFeedback({
        type: "success",
        text: `✓ Ingested successfully! ${data.chunks || 0} chunks created & indexed.`
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setUploadFeedback({
        type: "error",
        text: `✗ ${err.message || "Error uploading PDF"}`
      });
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleChunks = (id) => {
    setExpandedChunks((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const startNewChat = () => {
    setMessages([]);
    setInputQuestion("");
    if (textareaRef.current) textareaRef.current.focus();
  };

  const loadFromHistory = (item) => {
    setMessages([
      {
        id: item.id,
        question: item.question,
        answer: item.answer,
        chunks: []
      }
    ]);
  };

  // Suggestions for empty state
  const suggestions = [
    {
      title: "Warranty & Software Terms",
      desc: "Does Pelican Rx provide any warranty for its software?",
      prompt: "Does Pelican Rx provide any warranty?"
    },
    {
      title: "Data and Privacy Policy",
      desc: "What happens to the user data entered during the trial?",
      prompt: "What is the policy regarding user data entered during the trial period?"
    },
    {
      title: "Governing Law",
      desc: "Which jurisdiction and laws govern this agreement?",
      prompt: "What is the governing law of this agreement?"
    },
    {
      title: "Termination Conditions",
      desc: "Under what conditions can access be revoked or terminated?",
      prompt: "What are the rules regarding termination and license revocation?"
    }
  ];

  return (
    <div className="chatgpt-layout">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <div className="sidebar-header-top">
              <button className="new-chat-btn" onClick={startNewChat}>
                <span className="btn-content">
                  <PlusIcon /> New chat
                </span>
                <span className="shortcut-hint">⌘N</span>
              </button>
              <button
                className="icon-button close-sidebar-btn"
                onClick={() => setSidebarOpen(false)}
                title="Close sidebar"
              >
                <SidebarCloseIcon />
              </button>
            </div>

            <button className="upload-pill-btn" onClick={() => setShowUploadModal(true)}>
              <PaperclipIcon /> Ingest Document (PDF)
            </button>
          </div>

          <div className="sidebar-section-title">Recent Inquiries</div>

          <div className="sidebar-history">
            {historyList.length === 0 ? (
              <div className="empty-history">
                No history yet. Ask a question to begin.
              </div>
            ) : (
              historyList.slice().reverse().map((item) => (
                <button
                  key={item.id}
                  className="history-item"
                  onClick={() => loadFromHistory(item)}
                  title={item.question}
                >
                  <span className="history-icon">
                    <MessageSquareIcon />
                  </span>
                  <span className="history-text">{item.question}</span>
                </button>
              ))
            )}
          </div>

          <div className="sidebar-footer">
            <div className="status-indicator">
              <span className={`status-dot ${backendOnline ? "online" : "offline"}`} />
              <span className="status-text">
                {backendOnline ? "Backend Connected (5000)" : "Backend Offline"}
              </span>
            </div>
            <button
              className="icon-button"
              onClick={fetchChatHistory}
              title="Refresh history"
            >
              ↻
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Interface */}
      <main className="main-chat">
        {/* Navbar */}
        <header className="chat-navbar">
          <div className="nav-left">
            <button
              className="icon-button toggle-sidebar-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? <SidebarCloseIcon /> : <SidebarOpenIcon />}
            </button>
            <div className="model-selector">
              <span>Node RAG</span>
              <span className="model-badge">OpenRouter GPT-4o-mini</span>
            </div>
          </div>

          <button className="icon-button" onClick={startNewChat} title="New chat">
            <PlusIcon />
          </button>
        </header>

        {/* Messages Stream or Empty State */}
        <div className="chat-scroll-area">
          {messages.length === 0 ? (
            <div className="welcome-container">
              <div className="welcome-logo">
                <SparklesIcon />
              </div>
              <h1 className="welcome-title">What can I answer from your documents?</h1>
              <p className="welcome-sub">
                Answers are grounded directly in your uploaded PDF documents using vector embeddings and similarity search.
              </p>

              <div className="suggestions-grid">
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    className="suggestion-card"
                    onClick={() => handleSend(item.prompt)}
                  >
                    <div className="suggestion-card-title">{item.title}</div>
                    <div className="suggestion-card-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            messages.map((item) => (
              <div key={item.id}>
                {/* User Row */}
                <div className="message-row user-row">
                  <div className="message-container">
                    <div className="user-bubble">{item.question}</div>
                  </div>
                </div>

                {/* Assistant Row */}
                <div className="message-row assistant-row">
                  <div className="message-container">
                    <div className="assistant-avatar">
                      <SparklesIcon />
                    </div>
                    <div className="assistant-body">
                      {item.error ? (
                        <div style={{ color: "#ef4444", fontSize: "0.92rem" }}>
                          Error: {item.error}
                        </div>
                      ) : item.answer ? (
                        <div className="assistant-text">{item.answer}</div>
                      ) : (
                        <div className="typing-dots">
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                          <div className="typing-dot" />
                        </div>
                      )}

                      {/* Action Pill & Chunks */}
                      {item.answer && (
                        <div className="assistant-actions">
                          <button
                            className="action-pill"
                            onClick={() => copyToClipboard(item.answer, item.id)}
                          >
                            {copiedId === item.id ? <CheckIcon /> : <CopyIcon />}
                            <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                          </button>

                          {item.chunks && item.chunks.length > 0 && (
                            <button
                              className="action-pill"
                              onClick={() => toggleChunks(item.id)}
                            >
                              <span>{item.chunks.length} Sources</span>
                              <ChevronDownIcon open={expandedChunks[item.id]} />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Chunks Card */}
                      {expandedChunks[item.id] && item.chunks && (
                        <div className="chunks-card">
                          {item.chunks.map((chunk, cIdx) => (
                            <div key={cIdx} className="chunk-block">
                              <div className="chunk-meta">
                                <span>Source Chunk #{cIdx + 1}</span>
                                {chunk.score !== undefined && (
                                  <span style={{ color: "#10a37f", fontWeight: 600 }}>
                                    Match: {(chunk.score * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              <div className="chunk-snippet">{chunk.text}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        {/* ChatGPT Style Floating Input Box */}
        <div className="floating-input-wrapper">
          <div className="input-box">
            <button
              className="attach-btn"
              onClick={() => setShowUploadModal(true)}
              title="Attach & index PDF"
            >
              <PaperclipIcon />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              className="input-textarea"
              placeholder="Ask anything about your document..."
              value={inputQuestion}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <button
              className={`send-btn ${inputQuestion.trim() ? "active" : ""}`}
              onClick={() => handleSend()}
              disabled={!inputQuestion.trim() || isLoading}
              title="Send question"
            >
              <ArrowUpIcon />
            </button>
          </div>

          <div className="input-disclaimer">
            Node RAG answers are generated from indexed vector chunks. Always verify critical policy information.
          </div>
        </div>
      </main>

      {/* PDF Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <UploadIcon />
                <span>Upload & Index PDF</span>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowUploadModal(false)}
              >
                <CloseIcon />
              </button>
            </div>

            <p style={{ fontSize: "0.84rem", color: "#aaa" }}>
              Upload a document to extract text, calculate vector embeddings, and save into MySQL for RAG search.
            </p>

            <div
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setUploadFeedback(null);
                  }
                }}
              />
              <div style={{ marginBottom: 8 }}>
                <UploadIcon />
              </div>
              <div style={{ fontSize: "0.9rem", color: "#ddd", fontWeight: 500 }}>
                {selectedFile ? selectedFile.name : "Choose PDF or drag here"}
              </div>
              <div style={{ fontSize: "0.76rem", color: "#777", marginTop: 4 }}>
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : "PDF documents only"}
              </div>
            </div>

            {uploadFeedback && (
              <div
                style={{
                  fontSize: "0.82rem",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background:
                    uploadFeedback.type === "success"
                      ? "rgba(16, 163, 127, 0.15)"
                      : "rgba(239, 68, 68, 0.15)",
                  color:
                    uploadFeedback.type === "success" ? "#34d399" : "#f87171",
                  border: `1px solid ${
                    uploadFeedback.type === "success"
                      ? "rgba(16, 163, 127, 0.3)"
                      : "rgba(239, 68, 68, 0.3)"
                  }`
                }}
              >
                {uploadFeedback.text}
              </div>
            )}

            <button
              className="new-chat-btn"
              style={{
                background: selectedFile && !isUploading ? "#10a37f" : "var(--card-bg)",
                color: "#ffffff",
                justifyContent: "center",
                fontWeight: 600,
                border: "none",
                cursor: selectedFile && !isUploading ? "pointer" : "not-allowed"
              }}
              onClick={handleUploadSubmit}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? "Embedding & Ingesting PDF..." : "Upload & Generate Embeddings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
