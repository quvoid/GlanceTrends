import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Scrapes news using Google News RSS (Reliable Fallback).
 * @param {string} keyword 
 * @returns {Promise<{title: string, text: string, url: string, source: string} | null>}
 */
export async function scrapeNews(keyword) {
    try {
        console.log(`Searching for: ${keyword}`);

        // 1. Fetch Google News RSS (XML)
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=en-IN&gl=IN&ceid=IN:en`;

        const rssRes = await axios.get(rssUrl, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 5000
        });

        const $rss = cheerio.load(rssRes.data, { xmlMode: true });
        const firstItem = $rss('item').first();

        if (!firstItem.length) {
            console.log('No RSS items found');
            return null;
        }

        const title = firstItem.find('title').text();
        const link = firstItem.find('link').text(); // Google redirects this
        const pubDate = firstItem.find('pubDate').text();
        const sourceName = firstItem.find('source').text() || 'Google News';

        // Use a description snippet if available, or just title repeated
        let textContent = firstItem.find('description').text() || title;
        // Clean up HTML in description
        textContent = cheerio.load(textContent).text();

        console.log(`Found RSS item: ${title}`);

        // 2. Optimization: Return RSS result immediately if we don't strictly need full text
        // Attempting to scrape the redirect link often fails due to Google's redirect page or blocks.
        // For the MVP, it is BETTER to show the snippet than nothing.

        return {
            title: title,
            // Add some context to the text so it looks like a summary
            text: `${textContent}\n\n(Source: ${sourceName} - ${pubDate})`,
            url: link, // This is a google redirect link, but it works for users
            source: sourceName
        };

    } catch (error) {
        console.error(`Error scraping news for ${keyword}:`, error.message);
        return null;
    }
}
