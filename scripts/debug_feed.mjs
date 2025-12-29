import { getTrendingKeywords } from '../src/services/trending.js';
import { scrapeNews } from '../src/services/scraper.js';
import { summarizeNews } from '../src/services/llm.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function debugFeed() {
    console.log('--- Debugging Full Feed Pipeline ---');

    console.log('\n[Step 1] Fetching Trending Keywords...');
    const { all } = await getTrendingKeywords();
    console.log(`Trends found: ${all.length}`);
    console.log('Sample:', all.slice(0, 5));

    if (all.length === 0) {
        console.error('❌ No trends found.');
        return;
    }

    const keyword = all[0];
    console.log(`\n[Step 2] Scraping News for "${keyword}"...`);
    const article = await scrapeNews(keyword);

    if (!article) {
        console.error('❌ Scraper returned null.');
        return;
    }

    console.log('✅ Article Found');
    console.log(`   Title: ${article.title}`);
    console.log(`   Text Length: ${article.text.length}`);
    console.log(`   Text Preview: ${article.text.substring(0, 100)}...`);

    console.log('\n[Step 3] LLM Summarization...');
    const summary = await summarizeNews(article.text);

    if (!summary) {
        console.error('❌ LLM returned null (Text likely too short)');
        console.log(`   Input text length was: ${article.text.length}`);
    } else {
        console.log('✅ LLM Success');
        console.log(JSON.stringify(summary, null, 2));
    }
}

debugFeed();
