const axios = require('axios');

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
    this.geocodingUrl = 'https://api.openweathermap.org/geo/1.0';
    
    if (!this.apiKey) {
      throw new Error('OPENWEATHER_API_KEY environment variable is required');
    }
  }

  async getCoordinates(city) {
    try {
      const response = await axios.get(`${this.geocodingUrl}/direct`, {
        params: {
          q: city,
          limit: 1,
          appid: this.apiKey
        },
        timeout: 10000
      });

      if (!response.data || response.data.length === 0) {
        throw new Error(`City "${city}" not found`);
      }

      const { lat, lon, name, country } = response.data[0];
      return { lat, lon, name, country };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key for weather service');
      }
      throw new Error(`Failed to get coordinates for ${city}: ${error.message}`);
    }
  }

  async getCurrentWeather(city) {
    try {
     

      const coordinates = await this.getCoordinates(city);
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lon,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 10000
      });

      const data = response.data;
      return {
        location: {
          name: coordinates.name,
          country: coordinates.country,
          coordinates: { lat: coordinates.lat, lon: coordinates.lon }
        },
        current: {
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          visibility: data.visibility / 1000,
          uvIndex: await this.getUVIndex(coordinates.lat, coordinates.lon),
          windSpeed: data.wind?.speed || 0,
          windDirection: data.wind?.deg || 0,
          cloudCover: data.clouds?.all || 0,
          condition: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Weather service error: ${error.message}`);
    }
  }

  async getForecast(city) {
    try {
    
      const coordinates = await this.getCoordinates(city);
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lon,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 10000
      });

      const forecastData = response.data.list.slice(0, 8).map(item => ({
        datetime: new Date(item.dt * 1000).toISOString(),
        temperature: Math.round(item.main.temp),
        humidity: item.main.humidity,
        windSpeed: item.wind?.speed || 0,
        condition: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        precipitationProbability: item.pop * 100
      }));

      return {
        location: coordinates.name,
        forecast: forecastData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Forecast service error: ${error.message}`);
    }
  }

  async getAirQuality(city) {
    try {
      
      const coordinates = await this.getCoordinates(city);
      const response = await axios.get(`${this.baseUrl}/air_pollution`, {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lon,
          appid: this.apiKey
        },
        timeout: 10000
      });

      const aqi = response.data.list[0].main.aqi;
      const components = response.data.list[0].components;

      const aqiLevels = {
        1: { level: 'Good', color: '#00e400', description: 'Air quality is considered satisfactory' },
        2: { level: 'Fair', color: '#ffff00', description: 'Air quality is acceptable for most people' },
        3: { level: 'Moderate', color: '#ff7e00', description: 'Members of sensitive groups may experience health effects' },
        4: { level: 'Poor', color: '#ff0000', description: 'Everyone may begin to experience health effects' },
        5: { level: 'Very Poor', color: '#8f3f97', description: 'Health warnings of emergency conditions' }
      };

      return {
        location: coordinates.name,
        airQuality: {
          aqi: aqi,
          level: aqiLevels[aqi].level,
          color: aqiLevels[aqi].color,
          description: aqiLevels[aqi].description,
          components: {
            co: components.co,
            no: components.no,
            no2: components.no2,
            o3: components.o3,
            so2: components.so2,
            pm2_5: components.pm2_5,
            pm10: components.pm10,
            nh3: components.nh3
          }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Air quality service error: ${error.message}`);
    }
  }

  async getUVIndex(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/uvi`, {
        params: {
          lat: lat,
          lon: lon,
          appid: this.apiKey
        },
        timeout: 5000
      });
      return Math.round(response.data.value);
    } catch (error) {
      return 5;
    }
  }
}

module.exports = new WeatherService();