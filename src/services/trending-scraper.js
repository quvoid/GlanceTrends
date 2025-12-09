import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * Scrapes Trends24.in for India.
 * @returns {Promise<string[]>} List of trending keywords.
 */
export async function scrapeTrends24() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        const url = 'https://trends24.in/india/';

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const html = await page.content();
        const $ = cheerio.load(html);

        const candidates = [];
        $('a').each((i, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr('href');

            if (href && (href.includes('twitter.com/search') || href.includes('x.com/search'))) {
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
        console.error('Error scraping Trends24:', error);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}
