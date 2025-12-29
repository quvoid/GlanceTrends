import axios from 'axios';
import { scrapeTrends24 } from './trending-scraper.js';

async function getRedditTrends() {
    try {
        console.log('Fetching Reddit trends...');
        // Fetch top posts from r/popular (or r/news, r/worldnews)
        // Increased limit to 25
        const response = await axios.get('https://www.reddit.com/r/popular/top.json?limit=25&t=day', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 5000
        });

        const posts = response.data?.data?.children || [];
        console.log(`Fetched ${posts.length} Reddit posts.`);

        // Extract titles
        const trends = posts.map(post => post.data.title).slice(0, 25);
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

        const fallback = ['#India', '#Tech', '#AI', '#Cricket', '#Startup', '#Economy', '#Movies', '#Space'];

        // Ensure we have Twitter trends (visuals)
        const finalTwitter = trends24.length > 0 ? trends24 : fallback;
        const finalReddit = redditTrends; // Reddit usually works, or is []

        // Interleave results (Trend1, Reddit1, Trend2, Reddit2...)
        const combined = [];
        const maxLength = Math.max(finalTwitter.length, finalReddit.length);

        for (let i = 0; i < maxLength; i++) {
            if (finalTwitter[i]) combined.push(finalTwitter[i]);
            if (finalReddit[i]) combined.push(finalReddit[i]);
        }

        const uniqueKeywords = [...new Set(combined)];

        return {
            all: uniqueKeywords.length > 0 ? uniqueKeywords : fallback,
            twitter: finalTwitter,
            reddit: finalReddit
        };
    } catch (error) {
        console.error('Error fetching trending keywords:', error);
        // Fallback
        const fallback = ['#India', '#Tech', '#Bollywood', '#Cricket', '#News', '#Movies', '#Startups', '#Business'];
        return {
            all: fallback,
            twitter: fallback,
            reddit: []
        };
    }
}
