const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const weatherService = require('./services/weatherService');
const newsService = require('./services/newsService');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const weatherData = await weatherService.getCurrentWeather(city);
    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch weather data', 
      message: error.message 
    });
  }
});

app.get('/api/forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const forecastData = await weatherService.getForecast(city);
    res.json(forecastData);
  } catch (error) {
    console.error('Error fetching forecast data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch forecast data', 
      message: error.message 
    });
  }
});

app.get('/api/air-quality/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const airQualityData = await weatherService.getAirQuality(city);
    res.json(airQualityData);
  } catch (error) {
    console.error('Error fetching air quality data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch air quality data', 
      message: error.message 
    });
  }
});

app.get('/api/dashboard/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const [weather, forecast, airQuality, news] = await Promise.allSettled([
      weatherService.getCurrentWeather(city),
      weatherService.getForecast(city),
      weatherService.getAirQuality(city),
      newsService.getWeatherNews(city)
    ]);

    const response = {
      city,
      timestamp: new Date().toISOString(),
      weather: weather.status === 'fulfilled' ? weather.value : null,
      forecast: forecast.status === 'fulfilled' ? forecast.value : null,
      airQuality: airQuality.status === 'fulfilled' ? airQuality.value : null,
      news: news.status === 'fulfilled' ? news.value : null,
      errors: []
    };

    if (weather.status === 'rejected') response.errors.push('weather: ' + weather.reason.message);
    if (forecast.status === 'rejected') response.errors.push('forecast: ' + forecast.reason.message);
    if (airQuality.status === 'rejected') response.errors.push('airQuality: ' + airQuality.reason.message);
    if (news.status === 'rejected') response.errors.push('news: ' + news.reason.message);

    res.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data', 
      message: error.message 
    });
  }
});

app.get('/api/news/weather', async (req, res) => {
  try {
    const { q: query } = req.query;
    const newsData = await newsService.getWeatherNews(query || 'weather');
    res.json(newsData);
  } catch (error) {
    console.error('Error fetching news data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch news data', 
      message: error.message 
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Weather Intelligence Dashboard running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});