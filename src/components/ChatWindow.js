import React, { useEffect, useRef } from 'react';
import '../App.css';

const statusIcon = (status) => {
  if (!status) return '';
  if (status === 'sent') return '✔️';
  if (status === 'delivered') return '✅';
  if (status === 'read') return '🟦';
  return status;
};

const ChatWindow = ({ messages = [] }) => {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return <div className="chat-window">No messages yet</div>;
  }

  const topInfo = messages[0];
  return (
    <div className="chat-area">
      <div className="chat-header" style={{ padding: '12px 16px', borderBottom: '1px solid #ddd', background: '#fff' }}>
        <div style={{ fontWeight: '700' }}>{topInfo?.name || topInfo?.wa_id}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{topInfo?.number || topInfo?.wa_id}</div>
      </div>

      <div className="chat-window">
        {messages.map((msg, i) => {
          const isSender = msg.wa_id === topInfo.wa_id; // messages grouped by wa_id in the frontend
          return (
            <div key={i} className={`message-row ${isSender ? 'sent' : 'received'}`}>
              <div className="message-bubble">
                <div className="sender-name">{msg.name || msg.wa_id}</div>
                <div className="bubble-content">{msg.message}</div>
                <div className="timestamp">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &nbsp; {statusIcon(msg.status)}</div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
