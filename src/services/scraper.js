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
        // hl=en-IN&gl=IN&ceid=IN:en for India specific news
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=en-IN&gl=IN&ceid=IN:en`;

        const rssRes = await axios.get(rssUrl, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: 8000 // Increased timeout
        });

        const $rss = cheerio.load(rssRes.data, { xmlMode: true });
        const items = $rss('item').toArray();

        if (!items.length) {
            console.log('No RSS items found');
            return null;
        }

        // Try the first 3 items in case the first one is protected/unscrapable
        for (let i = 0; i < Math.min(items.length, 3); i++) {
            try {
                const item = cheerio.load(items[i]);
                const title = item('title').text();
                const link = item('link').text();
                const pubDate = item('pubDate').text();
                const sourceName = item('source').text() || 'Google News';

                console.log(`[Item ${i + 1}] Found RSS item: ${title}`);

                // 2. Try to fetch full content from the source URL
                let fullText = '';
                try {
                    console.log(`Attempting full scrape for: ${link}`);
                    const articleRes = await axios.get(link, {
                        headers: {
                            'User-Agent': USER_AGENT,
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                            'Accept-Language': 'en-US,en;q=0.9'
                        },
                        timeout: 5000
                    });

                    const $article = cheerio.load(articleRes.data);
                    // Remove junk
                    $article('script, style, nav, header, footer, iframe, .ad, .advertisement, .cookie-banner, .menu, .sidebar, .newsletter, .popup').remove();

                    const paragraphs = [];
                    // Try specific article selectors first, then generic
                    $article('[itemprop="articleBody"], main article, .article-body, .story-body, .content-body, p').each((i, el) => {
                        const txt = $article(el).text().trim();
                        // Relaxed length check and avoid overly short cookie warnings
                        if (txt.length > 25 && !txt.toLowerCase().includes('cookie') && !txt.toLowerCase().includes('subscribe')) {
                            paragraphs.push(txt);
                        }
                    });

                    // Take more paragraphs
                    fullText = paragraphs.slice(0, 20).join('\n\n');
                } catch (e) {
                    console.log(`Full scrape failed for ${link} (${e.message})`);
                }

                // 3. Validation & Fallback
                if (fullText && fullText.length > 200) {
                    return {
                        title,
                        text: fullText,
                        url: link,
                        source: sourceName
                    };
                } else {
                    console.log(`Content too short (${fullText ? fullText.length : 0} chars), trying next item...`);
                }

            } catch (innerErr) {
                console.error(`Error processing item ${i}:`, innerErr.message);
            }
        }

        // 4. Ultimate Fallback: If all full scrapes fail, return the first item's snippet if available
        console.log('All full scrapes failed/insufficient. Using RSS snippet fallback.');
        const firstItem = cheerio.load(items[0]);
        const title = firstItem('title').text();
        let snippet = firstItem('description').text();
        snippet = cheerio.load(snippet).text(); // Clean HTML

        // Combine title and snippet to ensure decent length
        const combinedText = `${title}.\n\n${snippet}\n\n(Source: ${firstItem('source').text() || 'Google News'} - ${firstItem('pubDate').text()})`;

        return {
            title: title,
            text: combinedText,
            url: firstItem('link').text(),
            source: firstItem('source').text() || 'Google News'
        };

    } catch (error) {
        console.error(`Error scraping news for ${keyword}:`, error.message);
        return null;
    }
}
