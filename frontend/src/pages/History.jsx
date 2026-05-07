import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getChatHistory, deleteChatSession } from '../services/api';
import Footer from '../components/Footer';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadHistory = async () => {
    try {
      const { data } = await getChatHistory();
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleDelete = async (e, sessionId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this conversation?')) return;
    try {
      await deleteChatSession(sessionId);
      setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    } catch {
      alert('Failed to delete. Please try again.');
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="history-page">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="section-title">📋 Chat <span>History</span></h1>
            <p style={{ color: 'var(--muted)' }}>Your past weather conversations with SkyBot</p>
          </div>
          <Link to="/chat" className="btn btn-primary">💬 New Chat</Link>
        </div>

        {loading && <div className="page-loader"><div className="spinner" /></div>}

        {!loading && sessions.length === 0 && (
          <div className="history-empty">
            <div className="empty-icon">💬</div>
            <h3>No conversations yet</h3>
            <p>Start chatting with SkyBot to see your history here.</p>
            <Link to="/chat" className="btn btn-primary" style={{ marginTop: 20 }}>Start a Chat</Link>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="history-list">
            {sessions.map(session => (
              <div key={session.sessionId} className="glass-card history-item" onClick={() => navigate(`/chat/${session.sessionId}`)}>
                <div className="history-icon">💬</div>
                <div className="history-info">
                  <div className="history-title">{session.title}</div>
                  <div className="history-meta">
                    🕒 {formatDate(session.updatedAt)} · {session.messageCount} messages
                  </div>
                  {session.preview && (
                    <div className="history-preview">💬 {session.preview}</div>
                  )}
                </div>
                <div className="history-actions">
                  <button
                    id={`delete-${session.sessionId}`}
                    className="btn btn-danger btn-sm"
                    onClick={(e) => handleDelete(e, session.sessionId)}
                  >🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
