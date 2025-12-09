import { scrapeTrends24 } from './trending-scraper';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

async function getRedditTrends() {
    try {
        const scriptPath = path.join(process.cwd(), 'scripts', 'fetch_reddit.py');
        const { stdout } = await execPromise(`python "${scriptPath}"`);
        const trends = JSON.parse(stdout.trim());
        return Array.isArray(trends) ? trends : [];
    } catch (error) {
        console.error('Error fetching Reddit trends:', error);
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
