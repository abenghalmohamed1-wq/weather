const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const getCurrentWeather = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let url;

    if (lat && lon) {
      url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else if (city) {
      url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ message: 'Please provide a city name or coordinates.' });
    }

    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'City not found. Please check the spelling.' });
    }
    res.status(500).json({ message: 'Failed to fetch weather data.', error: err.message });
  }
};

const getForecast = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    let url;

    if (lat && lon) {
      url = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    } else if (city) {
      url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ message: 'Please provide a city name or coordinates.' });
    }

    const { data } = await axios.get(url);

    // Return only daily forecasts (one per day at noon)
    const daily = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    res.json({ city: data.city, list: daily });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ message: 'City not found. Please check the spelling.' });
    }
    res.status(500).json({ message: 'Failed to fetch forecast data.', error: err.message });
  }
};

module.exports = { getCurrentWeather, getForecast };
