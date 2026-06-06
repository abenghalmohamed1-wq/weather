import { useState, useEffect, useCallback } from 'react';
import { getCurrentWeather, getForecast } from '../services/api';

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [city, setCity] = useState('');

  const fetchByCity = useCallback(async (cityName) => {
    if (!cityName.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        getCurrentWeather({ city: cityName }),
        getForecast({ city: cityName }),
      ]);
      setWeather(weatherRes.data);
      setForecast(forecastRes.data);
      setCity(cityName);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather data.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const [weatherRes, forecastRes] = await Promise.all([
            getCurrentWeather({ lat: coords.latitude, lon: coords.longitude }),
            getForecast({ lat: coords.latitude, lon: coords.longitude }),
          ]);
          setWeather(weatherRes.data);
          setForecast(forecastRes.data);
          setCity(weatherRes.data.name);
        } catch (err) {
          console.error('Weather fetch error:', err);
          setError(err.response?.data?.message || 'Failed to fetch weather data for your location.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        let message;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = 'Location access was denied. Please allow location access in your browser settings, or search for a city manually.';
            break;
          case err.POSITION_UNAVAILABLE:
            message = 'Your location could not be determined. Please try again or search for a city.';
            break;
          case err.TIMEOUT:
            message = 'Location request timed out. Please check your connection and try again.';
            break;
          default:
            message = 'An unknown error occurred while getting your location.';
        }
        console.error('Geolocation error:', err.message);
        setError(message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // cache position for 5 minutes
      }
    );
  }, []);

  // Fetch user's location weather on mount
  useEffect(() => {
    fetchByLocation();
  }, [fetchByLocation]);

  return { weather, forecast, loading, error, city, fetchByCity, fetchByLocation };
};
