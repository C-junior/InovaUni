/**
 * OpenWeather API Service
 * Fetches weather data for Palmas (TO), Brazil
 */

import axios from 'axios'

// Palmas (TO) city ID for OpenWeather API
const PALMAS_CITY_ID = '3474574'

// OpenWeather API configuration
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5'
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

/**
 * Create axios instance with default configuration
 */
const weatherApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  params: {
    appid: API_KEY,
    units: 'metric', // Celsius temperature
    lang: 'pt_br'
  }
})

/**
 * Fetch current weather data for Palmas (TO)
 * @returns {Promise<Object>} Weather data object
 */
export async function fetchCurrentWeather() {
  try {
    const response = await weatherApi.get('/weather', {
      params: {
        id: PALMAS_CITY_ID
      }
    })

    const data = response.data
    
    // Extract relevant weather parameters for ETo calculation
    return {
      temperature: {
        current: Math.round(data.main.temp * 10) / 10,
        max: Math.round(data.main.temp_max * 10) / 10,
        min: Math.round(data.main.temp_min * 10) / 10,
        feelsLike: Math.round(data.main.feels_like * 10) / 10
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind: {
        speed: Math.round(data.wind.speed * 10) / 10,
        direction: data.wind.deg || 0
      },
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      },
      clouds: data.clouds.all,
      visibility: data.visibility || null,
      timestamp: data.dt,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch weather data:', error)
    throw new WeatherApiError('Failed to fetch current weather data', error)
  }
}

/**
 * Fetch 5-day weather forecast for Palmas (TO)
 * @returns {Promise<Object>} Forecast data object
 */
export async function fetchWeatherForecast() {
  try {
    const response = await weatherApi.get('/forecast', {
      params: {
        id: PALMAS_CITY_ID
      }
    })

    const data = response.data
    
    // Process forecast data
    const forecasts = data.list.map(item => ({
      timestamp: item.dt,
      date: new Date(item.dt * 1000),
      temperature: {
        current: Math.round(item.main.temp * 10) / 10,
        max: Math.round(item.main.temp_max * 10) / 10,
        min: Math.round(item.main.temp_min * 10) / 10,
        feelsLike: Math.round(item.main.feels_like * 10) / 10
      },
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      wind: {
        speed: Math.round(item.wind.speed * 10) / 10,
        direction: item.wind.deg || 0
      },
      weather: {
        main: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      },
      clouds: item.clouds.all,
      visibility: item.visibility || null,
      precipitationProbability: item.pop || 0
    }))

    return {
      location: {
        name: data.city.name,
        country: data.city.country,
        coordinates: {
          lat: data.city.coord.lat,
          lon: data.city.coord.lon
        }
      },
      forecasts
    }
  } catch (error) {
    console.error('Failed to fetch weather forecast:', error)
    throw new WeatherApiError('Failed to fetch weather forecast', error)
  }
}

/**
 * Get weather data suitable for ETo calculation
 * Uses current weather data and provides fallback values
 * @returns {Promise<Object>} Weather data for ETo calculation
 */
export async function getWeatherForEtoCalculation() {
  try {
    const currentWeather = await fetchCurrentWeather()
    
    return {
      tmax: currentWeather.temperature.max,
      tmin: currentWeather.temperature.min,
      humidity: currentWeather.humidity,
      windSpeed: currentWeather.wind.speed,
      pressure: currentWeather.pressure,
      cloudiness: currentWeather.clouds,
      weatherDescription: currentWeather.weather.description,
      timestamp: currentWeather.timestamp,
      location: currentWeather.location
    }
  } catch (error) {
    console.error('Failed to get weather data for ETo calculation:', error)
    throw error
  }
}

/**
 * Check if API key is configured
 * @returns {boolean} True if API key is available
 */
export function isApiKeyConfigured() {
  return Boolean(API_KEY && API_KEY !== 'your_api_key_here')
}

/**
 * Get default weather values for manual input
 * @returns {Object} Default weather values for Palmas region
 */
export function getDefaultWeatherValues() {
  return {
    tmax: 32.0,
    tmin: 23.0,
    humidity: 65,
    windSpeed: 2.0,
    solarRadiation: 22.0
  }
}

/**
 * Custom error class for weather API errors
 */
export class WeatherApiError extends Error {
  constructor(message, originalError = null) {
    super(message)
    this.name = 'WeatherApiError'
    this.originalError = originalError
    this.timestamp = new Date().toISOString()
  }
}

/**
 * Validate weather data for ETo calculation
 * @param {Object} weatherData - Weather data to validate
 * @returns {boolean} True if data is valid
 */
export function validateWeatherData(weatherData) {
  const required = ['tmax', 'tmin', 'humidity', 'windSpeed']
  
  for (const field of required) {
    if (typeof weatherData[field] !== 'number' || isNaN(weatherData[field])) {
      return false
    }
  }
  
  // Basic range validation
  if (weatherData.tmax < weatherData.tmin) return false
  if (weatherData.humidity < 0 || weatherData.humidity > 100) return false
  if (weatherData.windSpeed < 0) return false
  
  return true
}