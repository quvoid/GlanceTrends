import { getTrendingKeywords } from '../src/services/trending.js';

async function test() {
    console.log('Testing getTrendingKeywords...');
    try {
        const result = await getTrendingKeywords();
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
