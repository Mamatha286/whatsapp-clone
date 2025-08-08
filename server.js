// server.js
const express = require('express');
const http = require('http'); // ✅ needed for socket.io
const { Server } = require('socket.io');
const connectDB = require('./db');
const dotenv = require('dotenv');
const cors = require('cors');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ create HTTP server
const io = new Server(server, {
  cors: { origin: '*' } // allow all origins for now
});

// Middleware
app.use(express.json());
app.use(cors());

// WebSocket connection
io.on('connection', (socket) => {
  console.log('⚡ Client connected');

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Routes
app.get('/api/test', (req, res) => {
  res.send('✅ Test route is working!');
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { sender, text } = req.body;
    const newMsg = new Message({
      wa_id: sender,
      name: sender,
      number: sender,
      message: text,
      timestamp: new Date(),
      status: "sent",
      meta_msg_id: Date.now().toString()
    });

    await newMsg.save();

    // ✅ Emit new message to all clients
    io.emit('new_message', newMsg);

    res.status(201).json(newMsg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

const PORT = process.env.PORT || 5000;
connectDB();

server.listen(PORT, () => { // ✅ use server.listen, not app.listen
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
