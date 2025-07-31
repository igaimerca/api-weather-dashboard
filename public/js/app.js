class WeatherApp {
    constructor() {
        this.currentData = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDefaultCity();
    }

    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');
        const quickCities = document.querySelectorAll('.quick-city');
        const refreshBtn = document.getElementById('refreshBtn');
        const exportBtn = document.getElementById('exportBtn');
        const sortOptions = document.getElementById('sortOptions');
        const searchData = document.getElementById('searchData');

        searchBtn.addEventListener('click', () => this.searchWeather());
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        
        quickCities.forEach(btn => {
            btn.addEventListener('click', () => {
                const city = btn.dataset.city;
                document.getElementById('cityInput').value = city;
                this.searchWeather();
            });
        });

        refreshBtn.addEventListener('click', () => this.refreshData());
        exportBtn.addEventListener('click', () => this.exportData());
        sortOptions.addEventListener('change', (e) => this.sortForecastData(e.target.value));
        searchData.addEventListener('input', (e) => this.filterData(e.target.value));
    }

    async loadDefaultCity() {
        document.getElementById('cityInput').value = 'Kigali';
        await this.searchWeather();
    }

    async searchWeather() {
        const cityInput = document.getElementById('cityInput');
        const city = cityInput.value.trim();
        
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }

        this.showLoading(true);
        this.hideError();

        try {
            const response = await fetch(`/api/dashboard/${encodeURIComponent(city)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch weather data');
            }

            this.currentData = data;
            this.displayWeatherData(data);
            this.showDashboard(true);
        } catch (error) {
            console.error('Search error:', error);
            this.showError(`Error: ${error.message}`);
            this.showDashboard(false);
        } finally {
            this.showLoading(false);
        }
    }

    async refreshData() {
        const cityInput = document.getElementById('cityInput');
        if (cityInput.value.trim()) {
            await this.searchWeather();
        }
    }

    displayWeatherData(data) {
        this.displayCurrentWeather(data.weather);
        this.displayAirQuality(data.airQuality);
        this.displayForecast(data.forecast);
        this.displayNews(data.news);
        this.displayErrors(data.errors);
    }

    displayCurrentWeather(weather) {
        if (!weather) {
            this.showPartialError('Weather data unavailable');
            return;
        }

        const current = weather.current;
        document.getElementById('currentTemp').textContent = current.temperature;
        document.getElementById('weatherCondition').textContent = current.condition;
        document.getElementById('weatherDescription').textContent = current.description;
        document.getElementById('feelsLike').textContent = `Feels like ${current.feelsLike}°C`;
        document.getElementById('humidity').textContent = `${current.humidity}%`;
        document.getElementById('windSpeed').textContent = `${current.windSpeed} m/s`;
        document.getElementById('pressure').textContent = `${current.pressure} hPa`;
        document.getElementById('uvIndex').textContent = current.uvIndex;

        const uvIndexElement = document.getElementById('uvIndex');
        uvIndexElement.className = 'detail-value ' + this.getUVIndexClass(current.uvIndex);
    }

    displayAirQuality(airQuality) {
        if (!airQuality) {
            this.showPartialError('Air quality data unavailable');
            return;
        }

        const aqi = airQuality.airQuality;
        const aqiValueElement = document.getElementById('aqiValue');
        aqiValueElement.textContent = aqi.aqi;
        aqiValueElement.style.color = aqi.color;
        
        document.getElementById('aqiLevel').textContent = aqi.level;
        document.getElementById('aqiDescription').textContent = aqi.description;

        const pollutantsContainer = document.getElementById('pollutants');
        pollutantsContainer.innerHTML = '';

        const pollutants = [
            { name: 'CO', value: aqi.components.co, unit: 'μg/m³' },
            { name: 'NO₂', value: aqi.components.no2, unit: 'μg/m³' },
            { name: 'O₃', value: aqi.components.o3, unit: 'μg/m³' },
            { name: 'PM2.5', value: aqi.components.pm2_5, unit: 'μg/m³' },
            { name: 'PM10', value: aqi.components.pm10, unit: 'μg/m³' },
            { name: 'SO₂', value: aqi.components.so2, unit: 'μg/m³' }
        ];

        pollutants.forEach(pollutant => {
            const pollutantElement = document.createElement('div');
            pollutantElement.className = 'pollutant-item';
            pollutantElement.innerHTML = `
                <div class="pollutant-name">${pollutant.name}</div>
                <div class="pollutant-value">${Math.round(pollutant.value)}</div>
            `;
            pollutantsContainer.appendChild(pollutantElement);
        });
    }

    displayForecast(forecast) {
        if (!forecast || !forecast.forecast) {
            this.showPartialError('Forecast data unavailable');
            return;
        }

        const forecastContainer = document.getElementById('forecastItems');
        forecastContainer.innerHTML = '';

        forecast.forecast.forEach((item, index) => {
            const forecastElement = document.createElement('div');
            forecastElement.className = 'forecast-item';
            forecastElement.setAttribute('data-temperature', item.temperature);
            forecastElement.setAttribute('data-humidity', item.humidity);
            forecastElement.setAttribute('data-wind', item.windSpeed);
            forecastElement.setAttribute('data-time', index);
            
            const time = new Date(item.datetime);
            const timeString = time.getHours().toString().padStart(2, '0') + ':00';
            
            forecastElement.innerHTML = `
                <div class="forecast-time">${timeString}</div>
                <div class="forecast-temp">${item.temperature}°C</div>
                <div class="forecast-condition">${item.condition}</div>
                <div class="forecast-details">
                    <div>💧 ${item.humidity}%</div>
                    <div>💨 ${item.windSpeed}m/s</div>
                </div>
            `;
            forecastContainer.appendChild(forecastElement);
        });
    }

    displayNews(news) {
        if (!news || !news.articles) {
            this.showPartialError('News data unavailable');
            return;
        }

        const newsContainer = document.getElementById('newsItems');
        newsContainer.innerHTML = '';

        news.articles.forEach(article => {
            const newsElement = document.createElement('div');
            newsElement.className = 'news-item';
            
            const publishedDate = new Date(article.publishedAt);
            const timeAgo = this.getTimeAgo(publishedDate);
            
            newsElement.innerHTML = `
                <div class="news-title">
                    <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                        ${article.title}
                    </a>
                </div>
                <div class="news-description">${article.description}</div>
                <div class="news-meta">
                    <span class="news-source">${article.source}</span>
                    <span class="news-time">${timeAgo}</span>
                    <span class="news-category">${article.category}</span>
                </div>
            `;
            newsContainer.appendChild(newsElement);
        });
    }

    displayErrors(errors) {
        if (errors && errors.length > 0) {
            console.warn('Partial data loading errors:', errors);
        }
    }

    sortForecastData(sortBy) {
        if (!sortBy || !this.currentData?.forecast?.forecast) return;

        const forecastContainer = document.getElementById('forecastItems');
        const items = Array.from(forecastContainer.children);

        items.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'temperature':
                    aValue = parseInt(a.getAttribute('data-temperature'));
                    bValue = parseInt(b.getAttribute('data-temperature'));
                    return bValue - aValue;
                case 'humidity':
                    aValue = parseInt(a.getAttribute('data-humidity'));
                    bValue = parseInt(b.getAttribute('data-humidity'));
                    return bValue - aValue;
                case 'wind':
                    aValue = parseFloat(a.getAttribute('data-wind'));
                    bValue = parseFloat(b.getAttribute('data-wind'));
                    return bValue - aValue;
                case 'time':
                    aValue = parseInt(a.getAttribute('data-time'));
                    bValue = parseInt(b.getAttribute('data-time'));
                    return aValue - bValue;
                default:
                    return 0;
            }
        });

        forecastContainer.innerHTML = '';
        items.forEach(item => forecastContainer.appendChild(item));
    }

    filterData(searchTerm) {
        if (!searchTerm) {
            this.showAllNewsItems();
            return;
        }

        const newsItems = document.querySelectorAll('.news-item');
        const lowerSearchTerm = searchTerm.toLowerCase();

        newsItems.forEach(item => {
            const title = item.querySelector('.news-title').textContent.toLowerCase();
            const description = item.querySelector('.news-description').textContent.toLowerCase();
            const source = item.querySelector('.news-source').textContent.toLowerCase();

            if (title.includes(lowerSearchTerm) || 
                description.includes(lowerSearchTerm) || 
                source.includes(lowerSearchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    showAllNewsItems() {
        const newsItems = document.querySelectorAll('.news-item');
        newsItems.forEach(item => {
            item.style.display = 'block';
        });
    }

    exportData() {
        if (!this.currentData) {
            this.showError('No data available to export');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            city: this.currentData.city,
            weather: this.currentData.weather,
            airQuality: this.currentData.airQuality,
            forecast: this.currentData.forecast,
            news: this.currentData.news
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-data-${this.currentData.city}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    getUVIndexClass(uvIndex) {
        if (uvIndex <= 2) return 'uv-low';
        if (uvIndex <= 5) return 'uv-moderate';
        if (uvIndex <= 7) return 'uv-high';
        if (uvIndex <= 10) return 'uv-very-high';
        return 'uv-extreme';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    showLoading(show) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.classList.toggle('hidden', !show);
    }

    showDashboard(show) {
        const dashboardContent = document.getElementById('dashboardContent');
        dashboardContent.classList.toggle('hidden', !show);
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        errorElement.classList.add('hidden');
    }

    showPartialError(message) {
        console.warn('Partial loading error:', message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});