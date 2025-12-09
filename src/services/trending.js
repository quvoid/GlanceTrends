import { scrapeTrends24 } from './trending-scraper';

/**
 * Fetches trending keywords.
 * Uses Puppeteer to scrape Trends24.in.
 * @returns {Promise<string[]>} List of trending keywords.
 */
export async function getTrendingKeywords() {
    try {
        const keywords = await scrapeTrends24();

        if (keywords.length === 0) {
            throw new Error('No trends found via scraping');
        }

        return keywords;
    } catch (error) {
        console.error('Error fetching trending keywords:', error);
        // Fallback
        return ['#India', '#Tech', '#Bollywood', '#Cricket', '#News'];
    }
}
