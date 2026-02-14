import dbConnect from '@/lib/db';
import Briefing from '@/models/Briefing';
import { getTrendingKeywords } from './trending';
import { scrapeNews } from './scraper';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a briefing for the current time slot.
 * Checks DB first. If missing, scrapes trends and uses LLM to generate.
 */
export async function getBriefing() {
    await dbConnect();

    const now = new Date();
    const hour = now.getHours();
    const isMorning = hour < 17;
    const type = isMorning ? 'morning' : 'evening';

    const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeSlot = `${now.toISOString().split('T')[0]}-${type}`;

    // 1. Check DB
    const existing = await Briefing.findOne({ timeSlot });
    if (existing) {
        console.log(`Returning cached briefing for ${timeSlot}`);
        return existing;
    }

    // 2. Generate New Briefing
    console.log(`Generating new ${type} briefing for ${timeSlot}...`);

    // Fetch Trends
    let keywords = [];
    try {
        const trends = await getTrendingKeywords();
        keywords = trends.all.slice(0, 5);
        console.log('Briefing keywords:', keywords);
    } catch (e) {
        console.error('Briefing: Failed to fetch trends:', e.message);
        keywords = ['India News', 'Technology', 'Business', 'Sports', 'Science'];
    }

    // Scrape Articles (Parallel, with individual error handling)
    const articlePromises = keywords.map(async (k) => {
        try {
            return await scrapeNews(k);
        } catch (e) {
            console.error(`Briefing: Scrape failed for "${k}":`, e.message);
            return null;
        }
    });
    const articles = (await Promise.all(articlePromises)).filter(a => a !== null);

    console.log(`Briefing: Got ${articles.length} articles out of ${keywords.length} keywords`);

    if (articles.length === 0) {
        // Return a fallback briefing instead of throwing
        console.warn('Briefing: No articles scraped, returning fallback');
        return {
            type,
            date: dateStr,
            timeSlot,
            title: type === 'morning' ? 'Morning Briefing ☕' : 'Evening Wrap 🌙',
            theme: 'Unable to fetch live news at this time. Please try again later.',
            stories: []
        };
    }

    // Prepare prompt for LLM
    const articlesText = articles.map((a, i) => `
    [Article ${i + 1}]
    Title: ${a.title}
    Source: ${a.source}
    Content: ${a.text.slice(0, 500)}...
    URL: ${a.url}
    `).join('\n\n');

    const prompt = `
    You are the Editor-in-Chief of a high-end news app. 
    Create a "${type === 'morning' ? 'Morning Briefing' : 'Evening Wrap'}" from these trending stories.

    Structure:
    1. A "Theme": One sentence summarizing the overall mood or connection between these stories.
    2. "Stories": Top 3-5 most important stories. For each:
       - Headline: Catchy but accurate.
       - Summary: 2 succinct sentences.
       - Category: Tech, Politics, Business, Sports, Entertainment, or Science.
       - Source: Name of the source.
       - URL: The provided URL.

    Return JSON ONLY (no markdown, no backticks):
    {
        "title": "${type === 'morning' ? 'Morning Briefing ☕' : 'Evening Wrap 🌙'}",
        "theme": "...",
        "stories": [
            { "headline": "...", "summary": "...", "category": "...", "source": "...", "url": "..." }
        ]
    }
    
    Input Articles:
    ${articlesText}
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = result.response;
        let textResponse = response.text();

        // Clean markdown fences
        textResponse = textResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        const data = JSON.parse(textResponse);

        // Save to DB
        const newBriefing = await Briefing.create({
            type,
            date: dateStr,
            timeSlot,
            title: data.title || (type === 'morning' ? 'Morning Briefing ☕' : 'Evening Wrap 🌙'),
            theme: data.theme,
            stories: data.stories
        });

        console.log(`Briefing saved: ${newBriefing._id}`);
        return newBriefing;

    } catch (e) {
        console.error('Briefing LLM/Save Error:', e.message);
        // Fallback: return raw articles without saving
        return {
            type,
            date: dateStr,
            timeSlot,
            title: type === 'morning' ? 'Morning Briefing ☕' : 'Evening Wrap 🌙',
            theme: 'Here are the top stories trending right now.',
            stories: articles.map(a => ({
                headline: a.title,
                summary: a.text.slice(0, 150) + '...',
                source: a.source,
                category: 'General',
                url: a.url
            }))
        };
    }
}
