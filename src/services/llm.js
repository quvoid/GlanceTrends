import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Summarizes text using Gemini.
 * @param {string} text 
 * @returns {Promise<{summary: string, category: string, sentiment: string} | null>}
 */
export async function summarizeNews(text, title = '') {
    if (!text || text.length < 10) return null;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are a news assistant. You are given a news article with a TITLE and BODY text.
        Your job is to produce:
        1. A 2-sentence engaging summary that ADDS context or detail beyond the title. Do NOT repeat the title verbatim. The summary must provide new information.
        2. A category from: "Tech", "Politics", "Entertainment", "Sports", "Business", "World", "Health", "Science".
        3. A sentiment: "Positive", "Neutral", "Negative".

        Return ONLY a raw JSON object (no markdown) with keys: "summary", "category", "sentiment".

        Title: ${title}

        Body:
        ${text.slice(0, 3000)}
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let textResponse = response.text();

        // Clean up markdown code blocks if present
        textResponse = textResponse.replace(/^```json/, '').replace(/^```/, '').trim();

        const json = JSON.parse(textResponse);
        return {
            summary: json.summary || "Summary unavailable.",
            category: json.category || "General",
            sentiment: json.sentiment || "Neutral"
        };
    } catch (error) {
        console.error('LLM Error:', error);
        // Fallback for reliability
        const fallbackSummary = text.split('.').slice(0, 2).join('. ') + '.';
        return {
            summary: fallbackSummary,
            category: "General",
            sentiment: "Neutral"
        };
    }
}
