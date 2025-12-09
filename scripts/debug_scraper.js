import { scrapeNews } from '../src/services/scraper.js';

async function test() {
    console.log('Testing scraper...');
    const result = await scrapeNews('#ShuklaFamily');
    console.log('Result:', result);
}

test();
