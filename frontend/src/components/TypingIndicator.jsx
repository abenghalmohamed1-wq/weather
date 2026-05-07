export default function TypingIndicator() {
  return (
    <div className="chat-bubble bot" style={{maxWidth:'120px'}}>
      <div className="bubble-avatar bot">⛅</div>
      <div className="bubble-content">
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
