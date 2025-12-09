/**
 * Summarizes text using an LLM.
 * Currently a MOCK implementation.
 * @param {string} text 
 * @returns {Promise<string>} Summary
 */
export async function summarizeNews(text) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!text || text.length < 50) return null;

    // Mock summary logic: Take first 3 sentences to form a coherent preview
    // In a real app, this would call OpenAI/Gemini
    const sentences = text.split('.').slice(0, 3).join('. ').trim();

    return sentences.endsWith('.') ? sentences : `${sentences}.`;
}
