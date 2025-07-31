# Weather Intelligence Dashboard

A comprehensive weather intelligence application that provides real-time weather data, air quality monitoring, weather forecasts, and related news for East African cities. Built with Node.js, Express, and modern web technologies.

## 🌟 Features

- **Real-time Weather Data**: Current weather conditions with temperature, humidity, wind speed, pressure, and UV index
- **Air Quality Monitoring**: Comprehensive air quality index with pollutant breakdowns (PM2.5, PM10, CO, NO2, O3, SO2)
- **24-Hour Forecast**: Interactive scrollable forecast with hourly weather predictions
- **Weather News**: Latest weather-related news from trusted sources
- **Interactive UI**: Sort, filter, and search through weather data
- **East Africa Focus**: Pre-configured for Kigali, Bujumbura, Kampala, Nairobi, and Dar es Salaam
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- **Docker Ready**: Containerized for easy deployment and scaling

## 🚀 Live Demo

Visit the live application: [Weather Intelligence Dashboard](https://your-domain.com)

## 🛠 Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **APIs**: OpenWeatherMap API, NewsAPI
- **Security**: Helmet.js, CORS, Rate Limiting
- **Containerization**: Docker
- **Deployment**: Load-balanced across multiple servers

## 📋 Prerequisites

- Node.js 18+ 
- NPM or Yarn
- Docker (for containerization)
- API Keys:
  - [OpenWeatherMap API](https://openweathermap.org/api)
  - [NewsAPI](https://newsapi.org/)

## ⚡ Quick Start

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
OPENWEATHER_API_KEY=your_openweather_api_key_here
NEWS_API_KEY=your_news_api_key_here
PORT=8080
NODE_ENV=production
```

### 4. Run the application
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Visit `http://localhost:8080` to view the dashboard.

## 🐳 Docker Deployment

### Build and Test Locally

```bash
# Build the Docker image
docker build -t igaimerca/weather-dashboard:v1 .

# Test locally
docker run -p 8080:8080 \
  -e OPENWEATHER_API_KEY=your_key \
  -e NEWS_API_KEY=your_key \
  igaimerca/weather-dashboard:v1

# Verify it works
curl http://localhost:8080/api/health
```

### Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push the image
docker push igaimerca/weather-dashboard:v1
docker tag igaimerca/weather-dashboard:v1 igaimerca/weather-dashboard:latest
docker push igaimerca/weather-dashboard:latest
```

## 🌐 Production Deployment

### Web Server Setup (Part 2A: Docker Containers)

#### Deploy on Web01 and Web02
```bash
# SSH into web-01 and web-02
ssh user@web-01
ssh user@web-02

# Pull and run the image on each server
docker pull igaimerca/weather-dashboard:v1
docker run -d --name weather-app --restart unless-stopped \
  -p 8080:8080 \
  -e OPENWEATHER_API_KEY=your_key \
  -e NEWS_API_KEY=your_key \
  igaimerca/weather-dashboard:v1

# Verify each instance is running
curl http://localhost:8080/api/health
```

#### Configure Load Balancer (Lb01)
Update `/etc/haproxy/haproxy.cfg`:
```haproxy
backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
```

Reload HAProxy:
```bash
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

#### Test Load Balancing
```bash
# Test from host machine
curl http://localhost  # Should alternate between servers
curl http://localhost/api/health
```

## 📊 API Endpoints

### Weather Data
- `GET /api/weather/:city` - Current weather for a city
- `GET /api/forecast/:city` - 24-hour forecast
- `GET /api/air-quality/:city` - Air quality data
- `GET /api/dashboard/:city` - Complete dashboard data

### News
- `GET /api/news/weather?q=query` - Weather-related news

### System
- `GET /api/health` - Health check endpoint
- `GET /` - Dashboard interface

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Required |
| `NEWS_API_KEY` | NewsAPI key | Required |
| `PORT` | Server port | 8080 |
| `NODE_ENV` | Environment mode | development |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

### Security Features
- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Security headers with Helmet.js
- No sensitive data exposure

## 🎯 User Interaction Features

### Data Sorting
- Sort forecast by temperature, humidity, wind speed, or time
- Real-time sorting without page refresh

### Data Filtering
- Search through news articles by title, description, or source
- Filter results instantly as you type

### Data Export
- Export complete weather data as JSON
- Includes timestamp and all collected metrics

## 🌍 Supported Cities

**East Africa Focus:**
- Kigali, Rwanda
- Bujumbura, Burundi  
- Kampala, Uganda
- Nairobi, Kenya
- Dar es Salaam, Tanzania

**Global Support:** Any city worldwide through search functionality.

## 🚨 Error Handling

- Graceful API failure handling
- Fallback for missing data
- User-friendly error messages
- Comprehensive logging
- Service health monitoring

## 🧪 Testing

### Manual Testing Steps
1. Load application in browser
2. Test with different cities
3. Verify all data sections load
4. Test sorting and filtering
5. Verify mobile responsiveness
6. Test error scenarios (invalid city names)

### API Testing
```bash
# Health check
curl http://localhost:8080/api/health

# Weather data
curl http://localhost:8080/api/weather/Kigali

# Complete dashboard
curl http://localhost:8080/api/dashboard/Kampala
```

## 📈 Performance Optimization

- Efficient API request batching
- Client-side caching
- Optimized image loading
- Minified assets in production
- Docker multi-stage builds
- Rate limiting for API protection

## 🤝 API Credits & Attribution

- **Weather Data**: [OpenWeatherMap](https://openweathermap.org/) - Current weather, forecasts, air quality, UV index
- **News Data**: [NewsAPI](https://newsapi.org/) - Weather-related news articles
- **Developer**: Aime Igirimpuhwe, African Leadership University

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenWeatherMap for comprehensive weather APIs
- NewsAPI for news aggregation services
- African Leadership University for the project framework
- East African communities for inspiration and focus

---

**Built with ❤️ for East Africa by Aime Igirimpuhwe**
