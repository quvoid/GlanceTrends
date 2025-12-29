import { getTrendingKeywords } from '../src/services/trending.js';

async function deepDebug() {
    console.log('--- Deep Debugging Trending Service ---');
    try {
        const start = Date.now();
        const result = await getTrendingKeywords();
        const duration = Date.now() - start;

        console.log(`Duration: ${duration}ms`);
        console.log('Keys:', Object.keys(result));

        console.log('\n--- Twitter Trends ---');
        console.log(`Length: ${result.twitter?.length}`);
        console.log(JSON.stringify(result.twitter, null, 2));

        console.log('\n--- Reddit Trends ---');
        console.log(`Length: ${result.reddit?.length}`);
        console.log(JSON.stringify(result.reddit, null, 2));

        console.log('\n--- All Combined ---');
        console.log(`Length: ${result.all?.length}`);
        console.log(JSON.stringify(result.all, null, 2));

    } catch (e) {
        console.error('CRITICAL ERROR:', e);
    }
}

deepDebug();
