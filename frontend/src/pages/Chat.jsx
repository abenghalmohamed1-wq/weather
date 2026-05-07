import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sendMessage, getChatSession } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TypingIndicator from '../components/TypingIndicator';

const SUGGESTIONS = [
  "What's the weather in Paris? 🗼",
  "Will it rain in London tomorrow? 🌧️",
  "Show me the forecast for Tokyo 🗾",
  "What should I wear in New York today? 👗",
  "Is it good weather for a picnic in Rome? 🧺",
  "What's the temperature in Dubai? 🏙️",
];

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Chat() {
  const { user } = useAuth();
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(urlSessionId || null);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingSession, setLoadingSession] = useState(!!urlSessionId);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // Load existing session
  useEffect(() => {
    if (!urlSessionId) return;
    setLoadingSession(true);
    getChatSession(urlSessionId)
      .then(({ data }) => {
        setMessages(data.messages || []);
        setSessionId(data.sessionId);
      })
      .catch(() => navigate('/chat'))
      .finally(() => setLoadingSession(false));
  }, [urlSessionId, navigate]);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg = { id: Date.now(), role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await sendMessage({ message: msg, sessionId });
      if (!sessionId) {
        setSessionId(data.sessionId);
        navigate(`/chat/${data.sessionId}`, { replace: true });
      }
      const botMsg = { id: Date.now() + 1, role: 'assistant', content: data.reply, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      const msg = err.response?.data?.message || '⚠️ Sorry, I had trouble connecting. Please try again.';
      const errMsg = { id: Date.now() + 1, role: 'assistant', content: msg, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSessionId(null);
    navigate('/chat', { replace: true });
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  if (loadingSession) {
    return <div className="page-loader"><div className="spinner" /><p>Loading conversation...</p></div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-icon">⛅</div>
          <div>
            <h2>SkyBot</h2>
            <p>AI Weather Assistant · Online</p>
          </div>
          <button id="new-chat-btn" className="btn btn-secondary btn-sm new-chat-btn" onClick={handleNewChat}>
            ✏️ New Chat
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 && !isTyping && (
            <div className="chat-welcome">
              <div className="welcome-icon">🌤️</div>
              <h3>Hello, {user?.name?.split(' ')[0]}! I'm SkyBot</h3>
              <p>Ask me anything about the weather — current conditions, forecasts, or climate tips!</p>
              <div className="chat-suggestions">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => handleSend(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`chat-bubble ${msg.role}`}>
              <div className={`bubble-avatar ${msg.role === 'assistant' ? 'bot' : 'user'}`}>
                {msg.role === 'assistant' ? '⛅' : initials}
              </div>
              <div>
                <div className="bubble-content" style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
                <div className="bubble-time">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <div className="chat-input-row">
            <textarea
              id="chat-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about any city's weather... (Enter to send, Shift+Enter for new line)"
              rows={1}
              disabled={isTyping}
            />
            <button
              id="chat-send-btn"
              className="chat-send-btn"
              onClick={() => handleSend()}
              disabled={isTyping || !input.trim()}
            >
              {isTyping ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
