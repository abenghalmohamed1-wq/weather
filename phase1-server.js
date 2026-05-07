/**
 * PHASE 1: AI-Powered Weather Chatbot - Single File POC
 * This is a comprehensive single-file server that combines:
 * - Express backend with REST API
 * - OpenAI API with multi-tool function calling
 * - Weather API integrations (current, forecast, historical)
 * - Multilingual support (English, French, Arabic, Darija)
 * - Embedded HTML/CSS/JS frontend
 * 
 * REQUIREMENTS:
 * npm install express cors dotenv openai axios
 * 
 * ENVIRONMENT VARIABLES (create .env file):
 * OPENAI_API_KEY=sk_...
 * OPENWEATHER_API_KEY=...
 * PORT=3000
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Default location for testing
const DEFAULT_LOCATION = 'Casablanca, Morocco';

// Supported languages with translations
const TRANSLATIONS = {
    en: {
        greeting: 'Hello! I\'m your AI Weather Assistant. Ask me about current, future, or historical weather.',
        invalidLocation: 'I couldn\'t find that location. Please try again with a valid city name.',
        invalidDate: 'The date you provided is invalid or too far in the past. Please use a date within the last 5 years.',
        fetchError: 'Sorry, I encountered an error fetching weather data. Please try again.',
        noData: 'No weather data available for the specified parameters.',
    },
    fr: {
        greeting: 'Bonjour! Je suis votre assistant météo IA. Posez-moi des questions sur la météo actuelle, future ou historique.',
        invalidLocation: 'Je n\'ai pas pu trouver cet endroit. Veuillez réessayer avec un nom de ville valide.',
        invalidDate: 'La date que vous avez fournie est invalide ou trop ancienne. Veuillez utiliser une date des 5 dernières années.',
        fetchError: 'Désolé, j\'ai rencontré une erreur en récupérant les données météorologiques. Veuillez réessayer.',
        noData: 'Aucune donnée météorologique disponible pour les paramètres spécifiés.',
    },
    ar: {
        greeting: 'مرحبا! أنا مساعدك في الأرصاد الجوية بالذكاء الاصطناعي. اسأل عن الطقس الحالي أو المستقبلي أو التاريخي.',
        invalidLocation: 'لم أتمكن من العثور على هذا الموقع. يرجى المحاولة مرة أخرى باستخدام اسم مدينة صحيح.',
        invalidDate: 'التاريخ الذي قدمته غير صحيح أو قديم جداً. يرجى استخدام تاريخ من آخر 5 سنوات.',
        fetchError: 'عذراً، واجهت خطأ في جلب بيانات الطقس. يرجى المحاولة مرة أخرى.',
        noData: 'لا توجد بيانات طقس متاحة للمعاملات المحددة.',
    },
    darija: {
        greeting: 'السلام عليكم! أنا مساعدك فالطقس بالذكاء الاصطناعي. سوالني على الطقس اليوم أو غدا ولا البارح.',
        invalidLocation: 'ما لقيتش هاد الجوج. حاول بزاف باسم مدينة آخر.',
        invalidDate: 'التاريخ ما صحيح والا قديم برك. استعمل تاريخ من اخر 5 سنوات.',
        fetchError: 'سمح ليا، واجهت مشكلة في جلب معلومات الطقس. حاول مرة خرى.',
        noData: 'ما فايتش معلومات الطقس للمعطيات اللي قلت ليا.',
    },
};

// ============================================================================
// WEATHER DATA FETCHING FUNCTIONS
// ============================================================================

/**
 * Validate and geocode a location to get coordinates
 */
async function geocodeLocation(location) {
    try {
        const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
            params: {
                q: location,
                limit: 1,
                appid: OPENWEATHER_API_KEY,
            },
        });

        if (response.data.length === 0) {
            throw new Error('Location not found');
        }

        const { lat, lon, name, state, country } = response.data[0];
        return {
            lat,
            lon,
            displayName: `${name}${state ? ', ' + state : ''}, ${country}`,
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            error: 'Location not found',
        };
    }
}

/**
 * Function Tool 1: Get current and forecast weather
 */
async function getCurrentAndForecastWeather(location) {
    try {
        const geoData = await geocodeLocation(location);
        if (!geoData.success) {
            return {
                error: 'Invalid location',
                data: null,
            };
        }

        const { lat, lon, displayName } = geoData;

        // Fetch current weather
        const currentResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                lat,
                lon,
                units: 'metric',
                appid: OPENWEATHER_API_KEY,
            },
        });

        // Fetch 5-day forecast
        const forecastResponse = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
            params: {
                lat,
                lon,
                units: 'metric',
                appid: OPENWEATHER_API_KEY,
            },
        });

        const current = {
            temp: currentResponse.data.main.temp,
            feels_like: currentResponse.data.main.feels_like,
            humidity: currentResponse.data.main.humidity,
            pressure: currentResponse.data.main.pressure,
            description: currentResponse.data.weather[0].description,
            wind_speed: currentResponse.data.wind.speed,
            cloudiness: currentResponse.data.clouds.all,
        };

        const forecast = forecastResponse.data.list.slice(0, 8).map((item) => ({
            time: new Date(item.dt * 1000).toLocaleString(),
            temp: item.main.temp,
            description: item.weather[0].description,
            humidity: item.main.humidity,
        }));

        return {
            error: null,
            data: {
                location: displayName,
                current,
                forecast,
                timestamp: new Date().toISOString(),
            },
        };
    } catch (error) {
        return {
            error: 'Failed to fetch weather data',
            data: null,
        };
    }
}

/**
 * Function Tool 2: Get historical weather
 * Using Visual Crossing API (free tier available) or OpenWeatherMap historical archive
 */
async function getHistoricalWeather(location, dateString) {
    try {
        // Parse the date
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Validate date
        if (isNaN(date)) {
            return {
                error: 'Invalid date format',
                data: null,
            };
        }

        if (date >= today) {
            return {
                error: 'Date must be in the past',
                data: null,
            };
        }

        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

        if (date < fiveYearsAgo) {
            return {
                error: 'Date too far in the past (maximum 5 years)',
                data: null,
            };
        }

        // Geocode the location
        const geoData = await geocodeLocation(location);
        if (!geoData.success) {
            return {
                error: 'Invalid location',
                data: null,
            };
        }

        const { lat, lon, displayName } = geoData;

        // Use Open-Meteo Historical API (free, no key needed)
        const formattedDate = date.toISOString().split('T')[0];
        const response = await axios.get('https://archive-api.open-meteo.com/v1/archive', {
            params: {
                latitude: lat,
                longitude: lon,
                start_date: formattedDate,
                end_date: formattedDate,
                hourly: 'temperature_2m,relative_humidity_2m,precipitation,weather_code',
                daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
                timezone: 'auto',
            },
        });

        if (!response.data.daily) {
            return {
                error: 'No historical data available for this date',
                data: null,
            };
        }

        const dailyData = response.data.daily;
        const weatherCodes = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Rime fog',
            51: 'Light drizzle',
            61: 'Slight rain',
            71: 'Slight snow',
            80: 'Moderate rain',
            85: 'Moderate snow',
            95: 'Thunderstorm',
        };

        const historical = {
            date: formattedDate,
            temp_max: dailyData.temperature_2m_max[0],
            temp_min: dailyData.temperature_2m_min[0],
            precipitation: dailyData.precipitation_sum[0],
            weather_description: weatherCodes[dailyData.weather_code[0]] || 'Unknown',
        };

        return {
            error: null,
            data: {
                location: displayName,
                historical,
                timestamp: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error('Historical weather error:', error.message);
        return {
            error: 'Failed to fetch historical weather data',
            data: null,
        };
    }
}

// ============================================================================
// OPENAI FUNCTION DEFINITIONS & CALLING
// ============================================================================

const tools = [
    {
        type: 'function',
        function: {
            name: 'get_current_and_forecast_weather',
            description:
                'Get current weather and 5-day forecast for a specific location. Use this when user asks about today, tomorrow, or future weather.',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'The city and country, e.g., "Paris, France" or "London, UK"',
                    },
                },
                required: ['location'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'get_historical_weather',
            description:
                'Get historical weather data for a specific past date and location. Use this when user asks about weather on a specific past date.',
            parameters: {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'The city and country, e.g., "Paris, France"',
                    },
                    date: {
                        type: 'string',
                        description: 'The date in YYYY-MM-DD format, e.g., "2023-01-15"',
                    },
                },
                required: ['location', 'date'],
            },
        },
    },
];

/**
 * Process tool calls from OpenAI
 */
async function processToolCall(toolName, toolInput) {
    if (toolName === 'get_current_and_forecast_weather') {
        return await getCurrentAndForecastWeather(toolInput.location);
    } else if (toolName === 'get_historical_weather') {
        return await getHistoricalWeather(toolInput.location, toolInput.date);
    }
    return { error: 'Unknown tool' };
}

/**
 * Main chat function with OpenAI function calling
 */
async function chat(userMessage, conversationHistory, language = 'en') {
    try {
        // Build messages array with conversation history
        const messages = [
            {
                role: 'system',
                content: `You are a helpful weather assistant. You help users understand weather patterns, forecasts, and historical data.
Current location context: ${DEFAULT_LOCATION}. If the user asks about weather without specifying a location, assume they mean the current context location.
You are multilingual and respond in ${language === 'darija' ? 'Moroccan Darija' : language.toUpperCase()}.
Always use the provided function tools to fetch real weather data. Never make up weather information.
Format responses clearly, including temperature in Celsius, humidity percentage, wind speed in m/s.`,
            },
            ...conversationHistory,
            {
                role: 'user',
                content: userMessage,
            },
        ];

        // Call OpenAI with tools
        let response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages,
            tools,
            tool_choice: 'auto',
            temperature: 0.7,
        });

        // Handle tool calls in a loop
        while (response.choices[0].finish_reason === 'tool_calls') {
            const toolCalls = response.choices[0].message.tool_calls;

            // Add assistant message to history
            messages.push({
                role: 'assistant',
                content: response.choices[0].message.content,
                tool_calls: toolCalls,
            });

            // Process each tool call
            const toolResults = [];
            for (const toolCall of toolCalls) {
                const result = await processToolCall(toolCall.function.name, JSON.parse(toolCall.function.arguments));
                toolResults.push({
                    role: 'user',
                    content: JSON.stringify(result),
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                });
            }

            // Add tool results to messages
            messages.push(...toolResults);

            // Get next response
            response = await openai.chat.completions.create({
                model: 'gpt-4-turbo',
                messages,
                tools,
                tool_choice: 'auto',
                temperature: 0.7,
            });
        }

        // Extract final response text
        const finalResponse = response.choices[0].message.content || 'No response generated';

        return {
            success: true,
            message: finalResponse,
            conversationHistory: [...messages],
        };
    } catch (error) {
        console.error('Chat error:', error.message);
        return {
            success: false,
            message: TRANSLATIONS[language].fetchError || 'An error occurred.',
            error: error.message,
        };
    }
}

// ============================================================================
// EXPRESS MIDDLEWARE & ROUTES
// ============================================================================

app.use(cors());
app.use(express.json());

// Serve embedded HTML frontend
app.get('/', (req, res) => {
    res.send(getEmbeddedHTML());
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    const { message, conversationHistory = [], language = 'en' } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const result = await chat(message, conversationHistory, language);
    res.json(result);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============================================================================
// EMBEDDED HTML/CSS/JS FRONTEND
// ============================================================================

function getEmbeddedHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Weather Chatbot</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      width: 100%;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow: hidden;
    }

    .container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      margin: 8px;
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header h1 {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .header p {
      font-size: 12px;
      opacity: 0.9;
    }

    .language-selector {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.5);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
    }

    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #f7f9fc;
    }

    .message {
      display: flex;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.user {
      justify-content: flex-end;
    }

    .message-bubble {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 12px;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .message.assistant .message-bubble {
      background: white;
      color: #333;
      border-left: 4px solid #667eea;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    }

    .message.user .message-bubble {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .loading {
      display: flex;
      gap: 6px;
      padding: 12px 16px;
    }

    .loading-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      animation: bounce 1.4s infinite;
    }

    .loading-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .loading-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        opacity: 0.5;
        transform: translateY(0);
      }
      40% {
        opacity: 1;
        transform: translateY(-8px);
      }
    }

    .input-area {
      padding: 16px;
      background: white;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .input-group {
      flex: 1;
      display: flex;
      gap: 8px;
    }

    input[type="text"] {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      font-family: inherit;
      transition: border-color 0.2s;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    button {
      padding: 12px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: transform 0.2s;
    }

    button:hover {
      transform: translateY(-2px);
    }

    button:active {
      transform: translateY(0);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .geo-button {
      padding: 12px;
      background: #f0f0f0;
      color: #667eea;
      border: 1px solid #e0e0e0;
    }

    .geo-button:hover {
      background: #e8e8e8;
    }

    .weather-table {
      background: white;
      border-collapse: collapse;
      width: 100%;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      margin: 8px 0;
    }

    .weather-table th {
      background: #f5f5f5;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .weather-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
      font-size: 13px;
    }

    .weather-table tr:last-child td {
      border-bottom: none;
    }

    @media (max-width: 600px) {
      .container {
        margin: 0;
        border-radius: 0;
      }

      .message-bubble {
        max-width: 85%;
      }

      .language-selector {
        top: 10px;
        right: 10px;
        font-size: 10px;
        padding: 6px 10px;
      }

      .header h1 {
        font-size: 18px;
      }

      .header p {
        font-size: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌦️ AI Weather Assistant</h1>
      <p>Ask about current, future, or historical weather</p>
      <select class="language-selector" id="languageSelector">
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="ar">العربية</option>
        <option value="darija">دارجة</option>
      </select>
    </div>

    <div class="chat-container" id="chatContainer"></div>

    <div class="input-area">
      <div class="input-group">
        <button class="geo-button" id="geoButton" title="Use my location">📍</button>
        <input
          type="text"
          id="messageInput"
          placeholder="Ask about weather (e.g., 'How was the weather on January 15, 2023 in Paris?')"
          autocomplete="off"
        />
        <button id="sendButton">Send</button>
      </div>
    </div>
  </div>

  <script>
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const geoButton = document.getElementById('geoButton');
    const languageSelector = document.getElementById('languageSelector');

    let conversationHistory = [];
    let isLoading = false;
    let currentLanguage = 'en';
    let currentLocation = 'Casablanca, Morocco';

    const translations = {
      en: {
        greeting: "Hello! I'm your AI Weather Assistant. Ask me about current, future, or historical weather.",
        sending: 'Sending...',
        error: 'Error: ',
      },
      fr: {
        greeting: 'Bonjour! Je suis votre assistant météo IA. Posez-moi des questions sur la météo.',
        sending: 'Envoi...',
        error: 'Erreur: ',
      },
      ar: {
        greeting: 'مرحبا! أنا مساعدك في الأرصاد الجوية بالذكاء الاصطناعي.',
        sending: 'جاري الإرسال...',
        error: 'خطأ: ',
      },
      darija: {
        greeting: 'السلام عليكم! أنا مساعدك فالطقس بالذكاء الاصطناعي.',
        sending: 'غادي نسيفت...',
        error: 'خطأ: ',
      },
    };

    function addMessage(text, isUser = false, isLoading = false) {
      const messageDiv = document.createElement('div');
      messageDiv.className = \`message \${isUser ? 'user' : 'assistant'}\`;

      if (isLoading) {
        messageDiv.innerHTML = \`
          <div class="loading">
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
          </div>
        \`;
      } else {
        messageDiv.innerHTML = \`<div class="message-bubble">\${escapeHtml(text)}</div>\`;
      }

      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      return messageDiv;
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    async function sendMessage() {
      const message = messageInput.value.trim();
      if (!message || isLoading) return;

      isLoading = true;
      sendButton.disabled = true;
      messageInput.disabled = true;
      sendButton.textContent = translations[currentLanguage].sending;

      // Add user message to UI
      addMessage(message, true);
      messageInput.value = '';

      // Add loading indicator
      const loadingMsg = addMessage('', false, true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            conversationHistory,
            language: currentLanguage,
          }),
        });

        const data = await response.json();

        // Remove loading indicator
        loadingMsg.remove();

        if (data.success) {
          addMessage(data.message, false);
          conversationHistory = data.conversationHistory;
        } else {
          addMessage(
            translations[currentLanguage].error + (data.error || 'Unknown error'),
            false
          );
        }
      } catch (error) {
        loadingMsg.remove();
        addMessage(translations[currentLanguage].error + error.message, false);
      } finally {
        isLoading = false;
        sendButton.disabled = false;
        messageInput.disabled = false;
        sendButton.textContent = 'Send';
        messageInput.focus();
      }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    geoButton.addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          messageInput.value = \`Weather at coordinates \${latitude.toFixed(2)}, \${longitude.toFixed(2)}\`;
          messageInput.focus();
        }, () => {
          alert('Unable to get your location. Please enable location services.');
        });
      }
    });

    languageSelector.addEventListener('change', (e) => {
      currentLanguage = e.target.value;
    });

    // Initialize with greeting
    window.addEventListener('load', () => {
      addMessage(translations[currentLanguage].greeting, false);
    });
  </script>
</body>
</html>
  `;
}

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
    console.log(\`
╔════════════════════════════════════════════════════════════════╗
║        AI Weather Chatbot - Phase 1 (Single File POC)         ║
║                                                                ║
║  Server running at: http://localhost:\${PORT}                   ║
║                                                                ║
║  REQUIRED ENVIRONMENT VARIABLES:                              ║
║  - OPENAI_API_KEY: Your OpenAI API key                       ║
║  - OPENWEATHER_API_KEY: Your OpenWeatherMap API key          ║
║                                                                ║
║  Features:                                                    ║
║  ✓ Current & Forecast Weather (Function Call #1)            ║
║  ✓ Historical Weather (Function Call #2)                     ║
║  ✓ Multilingual Support (EN, FR, AR, Darija)                ║
║  ✓ Mobile-Responsive UI                                      ║
║  ✓ Geolocation Integration                                   ║
║                                                                ║
║  Test it out:                                                 ║
║  - "What's the weather in Paris?"                             ║
║  - "How was the weather in Cairo on January 15, 2023?"       ║
║  - "ما الطقس في الرباط؟"                                      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  \`);
});

module.exports = app;