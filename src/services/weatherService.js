/**
 * PHASE 2: Weather Service
 * Handles all weather API calls and data processing
 */

import axios from 'axios';
import { WeatherCache } from '../models/index.js';

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// ============================================================================
// LOCATION GEOCODING
// ============================================================================

export async function geocodeLocation(location) {
    try {
        const response = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
            params: {
                q: location,
                limit: 1,
                appid: OPENWEATHER_API_KEY,
            },
        });

        if (response.data.length === 0) {
            return {
                success: false,
                error: 'Location not found',
            };
        }

        const { lat, lon, name, state, country } = response.data[0];
        return {
            success: true,
            lat,
            lon,
            displayName: `${name}${state ? ', ' + state : ''}, ${country}`,
        };
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return {
            success: false,
            error: 'Failed to geocode location',
        };
    }
}

// ============================================================================
// WEATHER API FUNCTIONS (Used by OpenAI Function Calling)
// ============================================================================

/**
 * Function Tool 1: Get current and forecast weather
 * Called by OpenAI when user asks about current/future weather
 */
export async function getCurrentAndForecastWeather(location) {
    try {
        const geoData = await geocodeLocation(location);
        if (!geoData.success) {
            return {
                error: 'Invalid location',
                data: null,
            };
        }

        const { lat, lon, displayName } = geoData;

        // Check cache first
        const cacheKey = `current_forecast_${lat}_${lon}`;
        const cached = await WeatherCache.findOne({ cacheKey });

        if (cached && new Date() < cached.expiresAt) {
            console.log('Using cached weather data');
            return {
                error: null,
                data: cached.data,
            };
        }

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

        const weatherData = {
            location: displayName,
            timestamp: new Date().toISOString(),
            current: {
                temp: currentResponse.data.main.temp,
                feels_like: currentResponse.data.main.feels_like,
                humidity: currentResponse.data.main.humidity,
                pressure: currentResponse.data.main.pressure,
                description: currentResponse.data.weather[0].description,
                icon: currentResponse.data.weather[0].icon,
                wind_speed: currentResponse.data.wind.speed,
                wind_direction: currentResponse.data.wind.deg,
                cloudiness: currentResponse.data.clouds.all,
                visibility: currentResponse.data.visibility,
                uvi: currentResponse.data.uvi || null,
            },
            forecast: forecastResponse.data.list.slice(0, 8).map((item) => ({
                time: new Date(item.dt * 1000).toLocaleString(),
                timestamp: item.dt,
                temp: item.main.temp,
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                description: item.weather[0].description,
                humidity: item.main.humidity,
                wind_speed: item.wind.speed,
                rain_probability: (item.clouds.all / 100) * 100,
            })),
        };

        // Cache the result
        await WeatherCache.updateOne(
            { cacheKey },
            {
                cacheKey,
                location: displayName,
                type: 'current',
                data: weatherData,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
            { upsert: true }
        );

        return {
            error: null,
            data: weatherData,
        };
    } catch (error) {
        console.error('getCurrentAndForecastWeather error:', error.message);
        return {
            error: 'Failed to fetch weather data',
            data: null,
        };
    }
}

/**
 * Function Tool 2: Get historical weather
 * Called by OpenAI when user asks about past weather
 */
export async function getHistoricalWeather(location, dateString) {
    try {
        // Parse and validate date
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(date)) {
            return {
                error: 'Invalid date format. Use YYYY-MM-DD',
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

        // Geocode location
        const geoData = await geocodeLocation(location);
        if (!geoData.success) {
            return {
                error: 'Invalid location',
                data: null,
            };
        }

        const { lat, lon, displayName } = geoData;

        // Check cache
        const cacheKey = `historical_${lat}_${lon}_${dateString}`;
        const cached = await WeatherCache.findOne({ cacheKey });

        if (cached && new Date() < cached.expiresAt) {
            console.log('Using cached historical weather');
            return {
                error: null,
                data: cached.data,
            };
        }

        // Use Open-Meteo Historical API (free, no auth required)
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

        // WMO Weather Interpretation Codes
        const weatherCodes = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Slight rain showers',
            81: 'Moderate rain showers',
            82: 'Violent rain showers',
            85: 'Slight snow showers',
            86: 'Heavy snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm with slight hail',
            99: 'Thunderstorm with heavy hail',
        };

        const weatherData = {
            location: displayName,
            date: formattedDate,
            timestamp: new Date().toISOString(),
            historical: {
                temp_max: dailyData.temperature_2m_max[0],
                temp_min: dailyData.temperature_2m_min[0],
                temp_avg: (dailyData.temperature_2m_max[0] + dailyData.temperature_2m_min[0]) / 2,
                precipitation: dailyData.precipitation_sum[0],
                weather_description: weatherCodes[dailyData.weather_code[0]] || 'Unknown',
                weather_code: dailyData.weather_code[0],
            },
        };

        // Cache for 24 hours (historical data doesn't change)
        await WeatherCache.updateOne(
            { cacheKey },
            {
                cacheKey,
                location: displayName,
                date: formattedDate,
                type: 'historical',
                data: weatherData,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
            { upsert: true }
        );

        return {
            error: null,
            data: weatherData,
        };
    } catch (error) {
        console.error('getHistoricalWeather error:', error.message);
        return {
            error: 'Failed to fetch historical weather data',
            data: null,
        };
    }
}

/**
 * Get coordinates from location name
 */
export async function getCoordinates(location) {
    const result = await geocodeLocation(location);
    if (result.success) {
        return {
            lat: result.lat,
            lon: result.lon,
            displayName: result.displayName,
        };
    }
    throw new Error(result.error);
}