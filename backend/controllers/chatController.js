const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const chatsPath = path.join(__dirname, '../data/chats.json');
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

const getChats = () => {
  try {
    return JSON.parse(fs.readFileSync(chatsPath, 'utf8'));
  } catch { return []; }
};

const saveChats = (chats) => {
  fs.writeFileSync(chatsPath, JSON.stringify(chats, null, 2));
};

// Extract city name from user message using multiple patterns
const extractCity = (message) => {
  const patterns = [
    /(?:weather|forecast|temperature|rain|snow|wind|humidity|climate)\s+(?:in|at|for|of)\s+([A-Za-z\s,]+?)(?:\?|$|today|tomorrow|this week)/i,
    /(?:in|at|for|of)\s+([A-Za-z\s,]+?)\s+(?:weather|forecast|temperature|rain|snow)/i,
    /(?:how(?:'s| is) (?:the )?weather (?:like )?in|what(?:'s| is) (?:the )?weather (?:like )?in)\s+([A-Za-z\s,]+?)(?:\?|$)/i,
    /([A-Za-z\s,]+?)\s+(?:weather|forecast)/i,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const city = match[1].trim().replace(/,$/, '');
      if (city.length > 1 && city.length < 50) return city;
    }
  }
  return null;
};

const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim())
      return res.status(400).json({ message: 'Message cannot be empty.' });

    const currentSessionId = sessionId || uuidv4();
    let weatherContext = '';

    // Fetch live weather if a city is detected
    const city = extractCity(message);
    if (city) {
      try {
        const [currentRes, forecastRes] = await Promise.allSettled([
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`),
          axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&cnt=8`),
        ]);

        if (currentRes.status === 'fulfilled') {
          const w = currentRes.value.data;
          weatherContext += `\n[LIVE WEATHER DATA for ${w.name}, ${w.sys.country}]\n`;
          weatherContext += `• Temperature: ${w.main.temp}°C (feels like ${w.main.feels_like}°C)\n`;
          weatherContext += `• Condition: ${w.weather[0].description}\n`;
          weatherContext += `• Humidity: ${w.main.humidity}%\n`;
          weatherContext += `• Wind: ${w.wind.speed} m/s (${w.wind.deg}°)\n`;
          weatherContext += `• Visibility: ${(w.visibility / 1000).toFixed(1)} km\n`;
          weatherContext += `• Pressure: ${w.main.pressure} hPa\n`;
          weatherContext += `• Sunrise: ${new Date(w.sys.sunrise * 1000).toLocaleTimeString()}\n`;
          weatherContext += `• Sunset: ${new Date(w.sys.sunset * 1000).toLocaleTimeString()}\n`;
        }

        if (forecastRes.status === 'fulfilled') {
          const forecasts = forecastRes.value.data.list.slice(0, 4);
          weatherContext += `\n[SHORT-TERM FORECAST]\n`;
          forecasts.forEach(f => {
            weatherContext += `• ${f.dt_txt}: ${f.main.temp}°C, ${f.weather[0].description}\n`;
          });
        }
      } catch (e) {
        weatherContext = `\n[Note: Could not fetch weather data for "${city}". The city name might be misspelled.]\n`;
      }
    }

    const systemPrompt = `You are SkyBot, an expert AI weather assistant created to help users understand weather conditions, forecasts, climate patterns, weather safety tips, and atmospheric science. You are friendly, helpful, accurate, and concise.

Key guidelines:
- Always use Celsius for temperature
- Provide practical advice (what to wear, carry umbrella, etc.) when relevant
- If you have live weather data below, USE IT to give accurate, specific answers
- Respond in the SAME language the user uses (English, French, Arabic, Darija, etc.)
- Format your response clearly with relevant emojis for readability
- Keep responses concise but informative
- If asked about non-weather topics, politely redirect to weather-related questions
${weatherContext}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(`${systemPrompt}\n\nUser message: ${message}`);
    const reply = result.response.text();

    // Persist to chat history
    const chats = getChats();
    const existingSession = chats.find(c => c.sessionId === currentSessionId && c.userId === userId);

    const userMsg = { id: uuidv4(), role: 'user', content: message, timestamp: new Date().toISOString() };
    const botMsg = { id: uuidv4(), role: 'assistant', content: reply, timestamp: new Date().toISOString() };

    if (existingSession) {
      existingSession.messages.push(userMsg, botMsg);
      existingSession.updatedAt = new Date().toISOString();
    } else {
      chats.push({
        sessionId: currentSessionId,
        userId,
        title: message.length > 60 ? message.substring(0, 60) + '...' : message,
        messages: [userMsg, botMsg],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    saveChats(chats);

    res.json({ reply, sessionId: currentSessionId });
  } catch (err) {
    console.error('Chat error:', err.message || err);
    if (err.status === 429) {
      return res.status(429).json({ message: 'SkyBot is a bit busy right now. Please wait a few seconds and try again! ⏳' });
    }
    if (err.status === 403) {
      return res.status(403).json({ message: 'API quota exceeded. Please try again later.' });
    }
    res.status(500).json({ message: 'Failed to process your message. Please try again.', error: err.message });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = getChats();
    const userChats = chats
      .filter(c => c.userId === userId)
      .map(c => ({
        sessionId: c.sessionId,
        title: c.title,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
        messageCount: c.messages.length,
        preview: c.messages[c.messages.length - 1]?.content?.substring(0, 100) || '',
      }))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(userChats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat history.' });
  }
};

const getSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    const chats = getChats();
    const session = chats.find(c => c.sessionId === sessionId && c.userId === userId);
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch session.' });
  }
};

const deleteSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;
    let chats = getChats();
    const initialLength = chats.length;
    chats = chats.filter(c => !(c.sessionId === sessionId && c.userId === userId));
    if (chats.length === initialLength) return res.status(404).json({ message: 'Session not found.' });
    saveChats(chats);
    res.json({ message: 'Session deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete session.' });
  }
};

module.exports = { sendMessage, getHistory, getSession, deleteSession };
