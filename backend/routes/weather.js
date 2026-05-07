const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getCurrentWeather, getForecast } = require('../controllers/weatherController');

router.get('/current', authMiddleware, getCurrentWeather);
router.get('/forecast', authMiddleware, getForecast);

module.exports = router;
