import React, { useState } from 'react';
import API from '../api';

const MessageInput = ({ wa_id, onNewMessage }) => {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await API.post('/messages', {
        sender: wa_id,
        text,
      });
      setText('');
      onNewMessage(); // refresh messages
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="message-input-container">
      <input
        type="text"
        className="message-input"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button className="send-button" onClick={handleSend}>Send</button>
    </div>
  );
};

export default MessageInput;
