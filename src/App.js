import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import API from './api';
import './App.css';

function App() {
  const [conversations, setConversations] = useState({});
  const [activeChat, setActiveChat] = useState(null);

  // ✅ Fetch messages from backend API
  const fetchMessages = async () => {
    try {
      const res = await API.get('/messages');
      const grouped = res.data.reduce((acc, msg) => {
        if (!acc[msg.wa_id]) acc[msg.wa_id] = [];
        acc[msg.wa_id].push(msg);
        return acc;
      }, {});
      setConversations(grouped);
    } catch (err) {
      console.error('❌ Failed to load messages', err);
    }
  };

  // ✅ Load messages on first render
  useEffect(() => {
    fetchMessages();
  }, []);

  // ✅ Real-time socket.io connection
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL_REALTIMESOCKET || 'http://localhost:5000');

    socket.on('connect', () => {
      console.log('🟢 Socket connected');
    });

    socket.on('new_message', (msg) => {
      console.log("📩 New message via socket:", msg);
      fetchMessages();
    });

    socket.on('status_update', (data) => {
      console.log("📊 Status update via socket:", data);
      fetchMessages();
    });

    socket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Refresh messages after sending new one
  const handleNewMessage = () => {
    fetchMessages();
  };

  return (
    <div className="app">
      {/* Sidebar - Chat List */}
      <div className="sidebar">
        <ChatList conversations={conversations} onSelect={setActiveChat} />
      </div>

      {/* Chat Window */}
      <div className="chat">
        {activeChat ? (
          <>
            <ChatWindow messages={conversations[activeChat]} />
            <MessageInput wa_id={activeChat} onNewMessage={handleNewMessage} />
          </>
        ) : (
          <div className="no-chat">← Select a conversation to start</div>
        )}
      </div>
    </div>
  );
}

export default App;
