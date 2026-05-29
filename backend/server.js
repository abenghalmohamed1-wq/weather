const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000', 'https://weather-i0rc.onrender.com'], credentials: true }));
app.use(express.json());

// Ensure data directory and files exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(path.join(dataDir, 'users.json'))) fs.writeFileSync(path.join(dataDir, 'users.json'), '[]');
if (!fs.existsSync(path.join(dataDir, 'chats.json'))) fs.writeFileSync(path.join(dataDir, 'chats.json'), '[]');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/chat', require('./routes/chat'));

app.get('/', (req, res) => {
  res.json({ message: '🌤️ SkyBot Weather Chatbot API is running!', version: '1.0.0' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running successfully and listening on port ${PORT}`);
});
