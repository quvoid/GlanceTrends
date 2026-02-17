import FirecrawlApp from '@mendable/firecrawl-js';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import * as cheerio from 'cheerio';
import 'dotenv/config';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ── Firecrawl Config ────────────────────────────────────────────────
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || 'fc-455937d7e3a94c86b1ff11c3fc101782';
const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });

// ── Utilities ────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractDomain(url) {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return '';
    }
}

// ─────────────────────────────────────────────────────────────────────
// PRIMARY: Firecrawl API (Deep Research)
// ─────────────────────────────────────────────────────────────────────

/**
 * Scrapes a query using the Firecrawl API.
 * Uses the /search endpoint to find and scrape the top result.
 * @param {string} keyword
 * @returns {Promise<{title: string, text: string, url: string, source: string} | null>}
 */
async function scrapeViaFirecrawl(keyword) {
    console.log(`[Firecrawl] Searching for: "${keyword}"`);
    try {
        const searchResult = await firecrawl.search(keyword, {
            scrapeOptions: {
                formats: ['markdown']
            },
            limit: 1 // We only need the top result for now
        });

        const results = searchResult.data || searchResult.web || [];

        if (results.length > 0) {
            const result = results[0];
            console.log(`[Firecrawl] Found: "${result.title}"`);

            return {
                title: result.title || '',
                text: result.markdown || result.content || '', // Prefer Markdown for LLMs
                url: result.url || '',
                source: extractDomain(result.url) || 'Web'
            };
        }

        console.log(`[Firecrawl] No results found for "${keyword}"`);
        return null;

    } catch (error) {
        console.error(`[Firecrawl] Error: ${error.message}`);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────────────
// FALLBACK: Google News RSS + Readability (original method)
// ─────────────────────────────────────────────────────────────────────

/**
 * Scrapes news using Google News RSS and Readability for content extraction.
 * @param {string} keyword
 * @returns {Promise<{title: string, text: string, url: string, source: string} | null>}
 */
async function scrapeViaRSS(keyword) {
    const TIMEOUT = 15000;
    // 1. Fetch Google News RSS (XML)
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=en-IN&gl=IN&ceid=IN:en`;

    try {
        const rssRes = await axios.get(rssUrl, {
            headers: { 'User-Agent': USER_AGENT },
            timeout: TIMEOUT
        });

        const $rss = cheerio.load(rssRes.data, { xmlMode: true });
        const items = $rss('item').toArray();

        if (!items.length) {
            console.log('[RSS Fallback] No RSS items found');
            return null;
        }

        // Try the first 3 items
        for (let i = 0; i < Math.min(items.length, 3); i++) {
            try {
                const item = cheerio.load(items[i]);
                const title = item('title').text();
                const link = item('link').text();
                const sourceName = item('source').text() || 'Google News';

                console.log(`[RSS Fallback] [Item ${i + 1}] Found: ${title}`);

                // 2. Try full scrape with Readability
                let fullText = '';
                try {
                    const articleRes = await axios.get(link, {
                        headers: {
                            'User-Agent': USER_AGENT,
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
                        },
                        timeout: TIMEOUT
                    });

                    const dom = new JSDOM(articleRes.data, {
                        url: articleRes.request.res.responseUrl || link
                    });

                    const reader = new Readability(dom.window.document);
                    const article = reader.parse();

                    if (article && article.textContent && article.textContent.length > 200) {
                        let content = article.textContent.trim();
                        if (content.startsWith(title)) {
                            content = content.replace(title, '').trim();
                        }
                        fullText = content;
                        console.log(`[RSS Fallback] Readability success: ${fullText.length} chars`);
                    } else {
                        console.log('[RSS Fallback] Readability returned empty or short content.');
                    }
                } catch (e) {
                    console.log(`[RSS Fallback] Full scrape failed for ${link} (${e.message})`);
                }

                if (fullText) {
                    return { title, text: fullText, url: link, source: sourceName };
                }
            } catch (innerErr) {
                console.error(`[RSS Fallback] Error processing item ${i}:`, innerErr.message);
            }
        }

        // 3. Last resort: Use RSS description
        console.log('[RSS Fallback] All full scrapes failed. Using RSS snippet.');
        const firstItem = cheerio.load(items[0]);
        const cleanDescription = cheerio.load(firstItem('description').text()).text().trim();

        if (cleanDescription.length < 50) {
            return null;
        }

        return {
            title: firstItem('title').text(),
            text: cleanDescription,
            url: firstItem('link').text(),
            source: firstItem('source').text() || 'Google News'
        };
    } catch (e) {
        console.error(`[RSS Fallback] Failed to fetch RSS: ${e.message}`);
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────
// PUBLIC: Main entry point
// ─────────────────────────────────────────────────────────────────────

/**
 * Scrapes news for a keyword.
 * Tries Firecrawl first; if it fails, falls back to Google News RSS.
 *
 * @param {string} keyword
 * @param {Object} options
 * @returns {Promise<{title: string, text: string, url: string, source: string} | null>}
 */
export async function scrapeNews(keyword, options = {}) {
    // ── Strategy 1: Firecrawl ──
    try {
        console.log(`[scrapeNews] Trying Firecrawl for: "${keyword}"`);
        const result = await scrapeViaFirecrawl(keyword);
        if (result && result.text) {
            console.log(`[scrapeNews] ✓ Firecrawl succeeded`);
            return result;
        }
        console.log(`[scrapeNews] Firecrawl returned empty result, falling back…`);
    } catch (err) {
        console.warn(`[scrapeNews] Firecrawl unavailable (${err.message}), falling back to RSS…`);
    }

    // ── Strategy 2: Google News RSS + Readability ──
    return await scrapeViaRSS(keyword);
}
