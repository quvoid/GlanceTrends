import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Scrapes news using Google News RSS and Readability for content extraction.
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
            timeout: 8000
        });

        const $rss = cheerio.load(rssRes.data, { xmlMode: true });
        const items = $rss('item').toArray();

        if (!items.length) {
            console.log('No RSS items found');
            return null;
        }

        // Try the first 3 items
        for (let i = 0; i < Math.min(items.length, 3); i++) {
            try {
                const item = cheerio.load(items[i]);
                const title = item('title').text();
                const link = item('link').text();
                const sourceName = item('source').text() || 'Google News';
                const pubDate = item('pubDate').text();

                console.log(`[Item ${i + 1}] Found RSS item: ${title}`);

                // 2. Try full scrape with Readability
                let fullText = '';
                try {
                    console.log(`Attempting full scrape for: ${link}`);
                    const articleRes = await axios.get(link, {
                        headers: {
                            'User-Agent': USER_AGENT,
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
                        },
                        timeout: 8000
                    });

                    const dom = new JSDOM(articleRes.data, {
                        url: articleRes.request.res.responseUrl || link
                    });

                    const reader = new Readability(dom.window.document);
                    const article = reader.parse();

                    if (article && article.textContent && article.textContent.length > 200) {
                        // Clean up the text further if needed
                        let content = article.textContent.trim();
                        // Remove repetitive title if it appears at start
                        if (content.startsWith(title)) {
                            content = content.replace(title, '').trim();
                        }

                        fullText = content;
                        console.log(`Readability extraction success: ${fullText.length} chars`);
                    } else {
                        console.log('Readability returned empty or short content.');
                    }

                } catch (e) {
                    console.log(`Full scrape failed for ${link} (${e.message})`);
                }

                if (fullText) {
                    return {
                        title,
                        text: fullText,
                        url: link,
                        source: sourceName
                    };
                }

            } catch (innerErr) {
                console.error(`Error processing item ${i}:`, innerErr.message);
            }
        }

        // 3. Fallback: Use RSS description but clean it better
        console.log('All full scrapes failed. Using RSS snippet fallback.');
        const firstItem = cheerio.load(items[0]);
        const cleanDescription = cheerio.load(firstItem('description').text()).text().trim();

        // If description is just the link or very short, refrain from using it as "article"
        if (cleanDescription.length < 50) {
            return null; // Better to return nothing than garbage
        }

        return {
            title: firstItem('title').text(),
            text: cleanDescription,
            url: firstItem('link').text(),
            source: firstItem('source').text() || 'Google News'
        };

    } catch (error) {
        console.error(`Error scraping news for ${keyword}:`, error.message);
        return null;
    }
}
