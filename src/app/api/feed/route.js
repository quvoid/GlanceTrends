import { NextResponse } from 'next/server';
import { getTrendingKeywords } from '@/services/trending';
import { scrapeNews } from '@/services/scraper';
import { summarizeNews } from '@/services/llm';
import { getInteractions, saveInteraction } from '@/services/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 3;
        const offset = (page - 1) * limit;

        // 1. Get Trending Keywords
        const keywords = await getTrendingKeywords();

        // 2. Paginate keywords
        const limitedKeywords = keywords.slice(offset, offset + limit);

        if (limitedKeywords.length === 0) {
            return NextResponse.json({ feed: [], trending: keywords, hasMore: false });
        }

        // Load all interactions once
        const allInteractions = getInteractions();

        const newsPromises = limitedKeywords.map(async (keyword) => {
            // Scrape
            const article = await scrapeNews(keyword);
            if (!article) return null;

            // Summarize
            const summary = await summarizeNews(article.text);

            // Get existing interactions
            const articleInteractions = allInteractions[article.url] || { likes: 0, comments: [] };

            return {
                id: Buffer.from(article.url).toString('base64'), // Simple ID from URL
                keyword,
                title: article.title,
                summary,
                url: article.url,
                source: article.source,
                likes: articleInteractions.likes,
                comments: articleInteractions.comments
            };
        });

        const results = await Promise.all(newsPromises);
        const feed = results.filter(item => item !== null);

        return NextResponse.json({
            feed,
            trending: keywords,
            hasMore: offset + limit < keywords.length
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { action, url, comment } = body;

        let result;
        if (action === 'like') {
            result = saveInteraction(url, 'like');
        } else if (action === 'comment' && comment) {
            result = saveInteraction(url, 'comment', {
                text: comment,
                timestamp: new Date().toISOString()
            });
        }

        if (!result) {
            return NextResponse.json({ error: 'Failed to save interaction' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            likes: result.likes,
            comments: result.comments
        });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
