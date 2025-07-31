const axios = require('axios');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
    
    if (!this.apiKey) {
      throw new Error('NEWS_API_KEY environment variable is required');
    }
  }

  async getWeatherNews(query = 'weather') {
    try {
      const searchQuery = this.buildSearchQuery(query);
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: searchQuery,
          sortBy: 'publishedAt',
          language: 'en',
          pageSize: 10,
          apiKey: this.apiKey
        },
        timeout: 10000
      });

      const articles = response.data.articles
        .filter(article => article.title && article.description && article.url)
        .slice(0, 6)
        .map(article => ({
          title: article.title,
          description: article.description,
          url: article.url,
          source: article.source.name,
          publishedAt: article.publishedAt,
          urlToImage: article.urlToImage,
          category: this.categorizeArticle(article.title + ' ' + article.description)
        }));

      return {
        query: searchQuery,
        totalResults: Math.min(articles.length, response.data.totalResults),
        articles: articles,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key for news service');
      }
      if (error.response?.status === 429) {
        throw new Error('News API rate limit exceeded');
      }
      throw new Error(`News service error: ${error.message}`);
    }
  }

  buildSearchQuery(city) {
    const weatherTerms = [
      'weather', 'climate', 'storm', 'hurricane', 'tornado', 'flood', 
      'drought', 'heatwave', 'blizzard', 'rainfall', 'temperature'
    ];
    
    if (city && city !== 'weather') {
      return `("${city}" AND (${weatherTerms.join(' OR ')}))`;
    }
    
    return weatherTerms.slice(0, 5).join(' OR ');
  }

  categorizeArticle(content) {
    const categories = {
      severe: ['hurricane', 'tornado', 'flood', 'blizzard', 'storm', 'disaster', 'emergency'],
      climate: ['climate change', 'global warming', 'greenhouse', 'carbon', 'emissions'],
      forecast: ['forecast', 'prediction', 'outlook', 'expect', 'coming'],
      agriculture: ['crop', 'farm', 'agriculture', 'harvest', 'drought'],
      general: []
    };

    const lowerContent = content.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return category;
      }
    }
    
    return 'general';
  }

}

module.exports = new NewsService();