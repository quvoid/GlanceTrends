
import axios from 'axios';
import { scrapeNews } from '../src/services/scraper.js';

// Mock Axios
jest.mock('axios');

// We can't easily mock axios in ES modules without a test runner like Jest setup for it.
// Instead, let's create a manual test that checks the logic by temporarily modifying the file or just running it against the real API if available. 
// OR better yet, since I can't easily introduce Jest here, I will create a script that Monkey Patches axios for this test run.

const originalPost = axios.post;
const originalGet = axios.get;

console.log("Starting Scraper Integration Test...");

// Mock responses
axios.post = async (url, data) => {
    if (url.includes('/search')) {
        console.log(`[Mock] POST /search with query: "${data.query}"`);
        return { data: { jobId: 'test-job-123', status: 'queued' } };
    }
    throw new Error(`Unexpected POST to ${url}`);
};

axios.get = async (url) => {
    if (url.includes('/job/test-job-123')) {
        console.log(`[Mock] GET /job/test-job-123`);
        return {
            data: {
                id: 'test-job-123',
                state: 'completed',
                result: {
                    title: 'Mock Article Title',
                    content: '<div><h1>Header</h1><p>HTML Content</p></div>',
                    textContent: 'Clean Text Content from API',
                    sourceUrl: 'https://example.com/news',
                    excerpt: 'Short excerpt'
                }
            }
        };
    }
    throw new Error(`Unexpected GET to ${url}`);
};

async function test() {
    try {
        const result = await scrapeNews('test query');

        console.log("\n--- Result ---");
        console.log("Title:", result.title);
        console.log("Text:", result.text); // Should be 'Clean Text Content from API'
        console.log("URL:", result.url);

        if (result.text === 'Clean Text Content from API') {
            console.log("\n✅ SUCCESS: 'textContent' was correctly prioritized.");
        } else if (result.text.includes('HTML Content')) {
            console.log("\n❌ FAILED: Still using 'content' (HTML).");
        } else {
            console.log("\n❌ FAILED: Unexpected text content.");
        }

    } catch (e) {
        console.error("Test failed with error:", e);
    } finally {
        // Restore (not strictly necessary for a script that exists)
        axios.post = originalPost;
        axios.get = originalGet;
    }
}

test();
