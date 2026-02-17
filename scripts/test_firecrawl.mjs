import FirecrawlApp from '@mendable/firecrawl-js';
import 'dotenv/config';
import { writeFileSync } from 'fs';

const apiKey = process.env.FIRECRAWL_API_KEY || 'fc-455937d7e3a94c86b1ff11c3fc101782';
const firecrawl = new FirecrawlApp({ apiKey });

async function testFirecrawl() {
    console.log('Inspecting FirecrawlApp instance...');
    let obj = firecrawl;
    while (obj) {
        console.log('Keys:', Object.getOwnPropertyNames(obj));
        obj = Object.getPrototypeOf(obj);
        if (obj === Object.prototype) break;
    }

    try {
        console.log('\n---------------------------------\n');

        console.log('Testing Firecrawl Search...');
        const searchResult = await firecrawl.search('latest tech news', {
            scrapeOptions: {
                formats: ['markdown']
            },
            limit: 1
        });
        console.log('Search Result Keys:', Object.keys(searchResult));
        writeFileSync('scripts/firecrawl_output.json', JSON.stringify(searchResult, null, 2));
        const results = searchResult.data || searchResult.web || [];
        console.log(`Found ${results.length} results.`);
        if (results.length > 0) {
            console.log('Result Object Keys:', Object.keys(results[0]));
            console.log('First Result Title:', results[0].title);
            console.log('First Result URL:', results[0].url);
            // console.log('First Result Markdown Preview:', results[0].markdown ? results[0].markdown.substring(0, 200) + '...' : 'No markdown');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testFirecrawl();
