import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Scrapes Trends24.in for India.
 * @returns {Promise<string[]>} List of trending keywords.
 */
export async function scrapeTrends24() {
    try {
        const url = 'https://trends24.in/india/';

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const candidates = [];

        // Trends24 list items usually have links to twitter search
        $('a').each((i, el) => {
            const href = $(el).attr('href') || '';
            const text = $(el).text().trim();

            if (href.includes('twitter.com/search') || href.includes('x.com/search')) {
                if (text && text.length > 1) {
                    candidates.push(text);
                }
            }
        });

        // Remove duplicates and take top 10
        const uniqueTrends = [...new Set(candidates)];
        console.log('Scraped Trends:', uniqueTrends.slice(0, 10));
        return uniqueTrends.slice(0, 10);

    } catch (error) {
        console.error('Error scraping Trends24:', error.message);
        return [];
    }
}
