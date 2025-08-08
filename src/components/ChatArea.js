import React, { useEffect, useState } from 'react';
import API from '../api'; // your API file

const ChatArea = () => {
  const [messages, setMessages] = useState([]);

  // Fetch messages on component load
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await API.get('/messages');
        setMessages(res.data);
      } catch (err) {
        console.error('❌ Failed to fetch messages:', err);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc' }}>
      <h3>📨 Messages</h3>
      {messages.length === 0 ? (
        <p>No messages yet.</p>
      ) : (
        <ul>
          {messages.map((msg) => (
            <li key={msg._id}>
              <strong>{msg.name}</strong>: {msg.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatArea;
