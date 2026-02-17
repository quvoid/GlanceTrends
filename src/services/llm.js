import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Summarizes text using Groq (Llama 3).
 * @param {string} text 
 * @returns {Promise<{summary: string, category: string, sentiment: string} | null>}
 */
export async function summarizeNews(text, title = '') {
    if (!text || text.length < 10) return null;

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

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stop: null,
            stream: false,
        });

        let textResponse = chatCompletion.choices[0]?.message?.content || "";

        // Clean up markdown code blocks if present
        textResponse = textResponse.replace(/^```json/, '').replace(/^```/, '').trim();

        // Find JSON object if there is extra text
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            textResponse = jsonMatch[0];
        }

        const json = JSON.parse(textResponse);
        console.log(`[Groq] Summary generated for: "${title.substring(0, 30)}..."`);

        return {
            summary: json.summary || "Summary unavailable.",
            category: json.category || "General",
            sentiment: json.sentiment || "Neutral"
        };
    } catch (error) {
        console.error('LLM Error (Groq):', error.message);

        // Fallback for reliability
        const fallbackSummary = text.split('.').slice(0, 2).join('. ') + '.';
        return {
            summary: fallbackSummary,
            category: "General",
            sentiment: "Neutral"
        };
    }
}
