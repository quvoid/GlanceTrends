import { summarizeNews } from '../src/services/llm.js';
import 'dotenv/config';

async function testGroq() {
    console.log('Testing Groq Summarization...');

    const title = "SpaceX Launches New Starship";
    const text = "SpaceX has successfully launched its latest version of the Starship rocket. The launch took place locally in Texas and represents a major milestone for the company's Mars ambitions. Elon Musk tweeted his congratulations to the team. The rocket achieved orbit and splashed down safely.";

    try {
        console.log('Sending request to Groq...');
        const result = await summarizeNews(text, title);

        console.log('\n--- Result ---');
        console.log(JSON.stringify(result, null, 2));

        if (result && result.summary && result.summary !== "Summary unavailable.") {
            console.log('\nTest PASSED: Groq returned a valid summary.');
        } else {
            console.error('\nTest FAILED: Invalid summary returned.');
        }

    } catch (error) {
        console.error('\nTest ERROR:', error);
    }
}

testGroq();
