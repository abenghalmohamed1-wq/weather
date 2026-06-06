const express = require('express');
const router = express.Router();
const { getCurrentWeather, getForecast } = require('../controllers/weatherController');

// Weather data is public — no auth required.
// This ensures geolocation and city search work even before login.
router.get('/current', getCurrentWeather);
router.get('/forecast', getForecast);

module.exports = router;
