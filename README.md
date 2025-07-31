# Weather Intelligence Dashboard

A comprehensive weather intelligence application that provides real-time weather data, air quality monitoring, weather forecasts, and related news for East African cities. Built with Node.js, Express, HTML and CSS.

## Demo & Resources

- **Docker Image**: [igaimerca/weather-dashboard](https://hub.docker.com/r/igaimerca/weather-dashboard)
- **Demo Video**: [Watch Demo Video](https://vimeo.com/1106268380)
- **GitHub Repository**: [https://github.com/igaimerca/api-weather-dashboard](https://github.com/igaimerca/api-weather-dashboard)

## Features

- Real-time Weather Data: Current weather conditions with temperature, humidity, wind speed, pressure, and UV index
- Air Quality Monitoring: Comprehensive air quality index with pollutant breakdowns (PM2.5, PM10, CO, NO2, O3, SO2)
- 24-Hour Forecast: Interactive scrollable forecast with hourly weather predictions
- Weather News: Latest weather-related news from trusted sources
- Interactive UI: Sort, filter, and search through weather data
- Pre-configured for Kigali, Bujumbura, Kampala, Nairobi, and Dar es Salaam
- Mobile Responsive: Optimized for desktop, tablet, and mobile devices
- Docker Ready: Containerized for easy deployment and scaling

## Technology Stack

- Backend: Node.js, Express.js
- Frontend: HTML5, CSS3, Vanilla JavaScript
- APIs: OpenWeatherMap API, NewsAPI
- Security: Helmet.js, CORS, Rate Limiting
- Containerization: Docker
- Deployment: Load-balanced across multiple servers

## Prerequisites

- Node.js 18+ 
- NPM or Yarn
- Docker (for containerization)
- API Keys: OpenWeatherMap API and NewsAPI

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/igaimerca/api-weather-dashboard.git
cd api-weather-dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and add your API keys:
```env
OPENWEATHER_API_KEY=openweather_api_key_here
NEWS_API_KEY=news_api_key_here
PORT=8080
NODE_ENV=production
```

### 4. Run the application
```bash
npm start
```

Visit `http://localhost:8080` to view the dashboard.

## Docker Deployment

### Build and Test Locally

```bash
# Build the Docker image
docker build -t igaimerca/weather-dashboard:v1 .

# Test locally
docker run -p 8080:8080 \
  -e OPENWEATHER_API_KEY=key_here \
  -e NEWS_API_KEY=key_here \
  igaimerca/weather-dashboard:v1

# Verify it works
curl http://localhost:8080/api/health
```

### Push to Docker Hub

```bash
docker login
docker push igaimerca/weather-dashboard:v1
```

**Docker Hub Repository**: https://hub.docker.com/r/igaimerca/weather-dashboard

## Production Deployment

### Deploy on Web01 and Web02
```bash
# Pull and run the image on each server
docker pull igaimerca/weather-dashboard:v1
docker run -d --name weather-app --restart unless-stopped \
  -p 8080:8080 \
  -e OPENWEATHER_API_KEY=key \
  -e NEWS_API_KEY=key \
  igaimerca/weather-dashboard:v1
```

## API Endpoints

- `GET /api/weather/:city` - Current weather for a city
- `GET /api/forecast/:city` - 24-hour forecast
- `GET /api/air-quality/:city` - Air quality data
- `GET /api/dashboard/:city` - Complete dashboard data
- `GET /api/news/weather?q=query` - Weather-related news
- `GET /api/health` - Health check endpoint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Required |
| `NEWS_API_KEY` | NewsAPI key | Required |
| `PORT` | Server port | 8080 |
| `NODE_ENV` | Environment mode | development |

## User Interaction Features

- Sort forecast by temperature, humidity, wind speed, or time
- Search through news articles by title, description, or source
- Export complete weather data as JSON

## Supported Cities

East Africa Focus: Kigali, Bujumbura, Kampala, Nairobi, and Dar es Salaam
Global Support: Any city worldwide through search functionality

## API Credits

- Weather Data: OpenWeatherMap - Current weather, forecasts, air quality, UV index
- News Data: NewsAPI - Weather-related news articles
- Developer: Aime Igirimpuhwe, Student at African Leadership University
