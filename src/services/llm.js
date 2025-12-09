/**
 * Summarizes text using an LLM.
 * Currently a MOCK implementation.
 * @param {string} text 
 * @returns {Promise<string>} Summary
 */
export async function summarizeNews(text) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!text) return "No content to summarize.";

    // Mock summary logic: Take first 3 sentences or generic text
    const sentences = text.split('.').slice(0, 3).join('. ') + '.';

    return `[AI Summary] ${sentences} (This is a mock summary for the MVP).`;
}
