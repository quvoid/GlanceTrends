import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

async function testTrends24() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    try {
        const url = 'https://trends24.in/india/';
        console.log(`Navigating to ${url}...`);

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const html = await page.content();
        const $ = cheerio.load(html);

        console.log('Title:', $('title').text());

        // Find all links
        const listItems = $('a');
        console.log(`Found ${listItems.length} links`);

        const candidates = [];
        listItems.each((i, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr('href');

            if (href && (href.includes('twitter.com/search') || href.includes('x.com/search'))) {
                candidates.push(text);
            }
        });

        console.log('Trend Candidates:', candidates.slice(0, 20));

        // Also check headers
        const headers = [];
        $('h3, h4, h5').each((i, el) => {
            headers.push($(el).text().trim());
        });
        console.log('Headers:', headers.slice(0, 10));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

testTrends24();
