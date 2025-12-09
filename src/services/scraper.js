import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * Searches for a keyword and scrapes the first news article.
 * Uses DuckDuckGo HTML search to avoid Google blocking.
 * Includes a fallback to return a mock article if scraping fails.
 * @param {string} keyword 
 * @returns {Promise<{title: string, text: string, url: string, source: string} | null>}
 */
export async function scrapeNews(keyword) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // 1. Search DuckDuckGo (HTML version is easier to scrape)
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(keyword + " news")}`;

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

        // 2. Extract the first result URL
        const articleUrl = await page.evaluate(() => {
            const link = document.querySelector('.result__a');
            return link ? link.href : null;
        });

        if (!articleUrl) {
            console.log(`No article found for ${keyword} on DDG`);
            throw new Error('No article found');
        }

        console.log(`Found article: ${articleUrl}`);

        // 3. Go to the article page
        await page.goto(articleUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // 4. Extract content
        const html = await page.content();
        const $ = cheerio.load(html);

        const title = $('h1').first().text().trim() || $('title').text().trim();

        $('script, style, nav, header, footer, .ad, .advertisement').remove();

        const paragraphs = [];
        $('p').each((i, el) => {
            const text = $(el).text().trim();
            if (text.length > 50) paragraphs.push(text);
        });

        const text = paragraphs.join('\n\n');
        const source = new URL(articleUrl).hostname.replace('www.', '');

        if (!text) throw new Error('No text content extracted');

        return {
            title,
            text,
            url: articleUrl,
            source
        };

    } catch (error) {
        console.error(`Error scraping news for ${keyword}:`, error.message);
        // FALLBACK: Return a mock article so the UI isn't empty
        return {
            title: `Latest News about ${keyword}`,
            text: `This is a placeholder article for ${keyword}. The scraper could not fetch the live content due to network restrictions, but here is where the summary would appear.`,
            url: `https://google.com/search?q=${keyword}`,
            source: 'Fallback Source'
        };
    } finally {
        if (browser) await browser.close();
    }
}
