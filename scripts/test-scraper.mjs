// scripts/test-scraper.js
// Need to use esm or register babel, but since we are in a module project (type: module in package.json usually or .mjs), let's check.
// Next.js uses ES modules. We can try running this with node.

import { getTrendingKeywords } from '../src/services/trending.js';
import { scrapeNews } from '../src/services/scraper.js';
import { summarizeNews } from '../src/services/llm.js';

async function test() {
    console.log('1. Fetching Trending Keywords...');
    const keywords = await getTrendingKeywords();
    console.log('Keywords:', keywords);

    if (keywords.length === 0) {
        console.error('No keywords found.');
        return;
    }

    const keyword = keywords[0];
    console.log(`\n2. Scraping news for: ${keyword}`);

    const article = await scrapeNews(keyword);
    if (!article) {
        console.error('Scraping failed.');
        return;
    }

    console.log('Title:', article.title);
    console.log('URL:', article.url);
    console.log('Text Length:', article.text.length);

    console.log('\n3. Summarizing...');
    const summary = await summarizeNews(article.text);
    console.log('Summary:', summary);
}

test();
