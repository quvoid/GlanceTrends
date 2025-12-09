import axios from 'axios';
import { scrapeTrends24 } from './trending-scraper';

async function getRedditTrends() {
    try {
        // Fetch top posts from r/popular (or r/news, r/worldnews)
        const response = await axios.get('https://www.reddit.com/r/popular/top.json?limit=10&t=day', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const posts = response.data?.data?.children || [];

        // Extract titles
        const trends = posts.map(post => post.data.title).slice(0, 10);
        return trends;
    } catch (error) {
        console.error('Error fetching Reddit trends:', error.message);
        return [];
    }
}

/**
 * Fetches trending keywords from multiple sources.
 * @returns {Promise<string[]>} List of trending keywords.
 */
export async function getTrendingKeywords() {
    try {
        const [trends24, redditTrends] = await Promise.all([
            scrapeTrends24(),
            getRedditTrends()
        ]);

        // Interleave results (Trend1, Reddit1, Trend2, Reddit2...)
        const combined = [];
        const maxLength = Math.max(trends24.length, redditTrends.length);

        for (let i = 0; i < maxLength; i++) {
            if (trends24[i]) combined.push(trends24[i]);
            if (redditTrends[i]) combined.push(redditTrends[i]);
        }

        const uniqueKeywords = [...new Set(combined)];

        if (uniqueKeywords.length === 0) {
            throw new Error('No trends found via scraping');
        }

        return {
            all: uniqueKeywords,
            twitter: trends24,
            reddit: redditTrends
        };
    } catch (error) {
        console.error('Error fetching trending keywords:', error);
        // Fallback
        const fallback = ['#India', '#Tech', '#Bollywood', '#Cricket', '#News'];
        return {
            all: fallback,
            twitter: fallback,
            reddit: []
        };
    }
}
