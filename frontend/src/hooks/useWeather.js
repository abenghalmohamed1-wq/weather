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
          setError(err.response?.data?.message || 'Failed to fetch weather data.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError('Location access denied. Please search for a city.');
        setLoading(false);
      }
    );
  }, []);

  // Fetch user's location weather on mount
  useEffect(() => {
    fetchByLocation();
  }, [fetchByLocation]);

  return { weather, forecast, loading, error, city, fetchByCity, fetchByLocation };
};
