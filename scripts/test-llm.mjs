import { summarizeNews } from '../src/services/llm.js';

async function test() {
    const text = `
    Apple today announced new AI features for iOS 18. The company revealed 'Apple Intelligence' at WWDC 2024. 
    It integrates deeply with Siri and apps to offer writing tools, image generation, and more. 
    Tim Cook called it the next step for personal intelligence. The market reacted positively with stock prices rising 2%.
    Privacy remains a core focus, with most processing happening on-device.
    `;

    console.log('Testing Gemini Summary...');
    const result = await summarizeNews(text);
    console.log('Result:', JSON.stringify(result, null, 2));
}

test();
