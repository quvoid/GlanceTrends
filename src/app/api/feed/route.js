import { NextResponse } from 'next/server';
import { getTrendingKeywords } from '@/services/trending';
import { scrapeNews } from '@/services/scraper';
import { summarizeNews } from '@/services/llm';
import dbConnect from '@/lib/db';
import Interaction from '@/models/Interaction';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);
        return payload.userId;
    } catch (e) {
        return null;
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 3;
        const offset = (page - 1) * limit;

        // 1. Get Keywords (Search or Trending)
        // 1. Get Keywords (Search or Trending)
        const query = searchParams.get('q');
        let keywords = [];
        let twitter = [];
        let reddit = [];

        const CATEGORY_SUBTOPICS = {
            'Tech': ['Artificial Intelligence News', 'Latest Gadgets', 'Silicon Valley News', 'Cybersecurity Updates', 'Tech Industry Trends'],
            'Politics': ['Global Politics', 'Election News', 'Government Policy', 'Senate Updates', 'International Relations'],
            'Business': ['Stock Market News', 'Global Economy', 'Startup News', 'Cryptocurrency updates', 'Business Trends'],
            'Entertainment': ['Hollywood News', 'Celebrity Gossip', 'New Movie Releases', 'Music Industry News', 'Netflix Trends'],
            'Sports': ['Football News', 'NBA Updates', 'Cricket Match Results', 'Tennis News', 'F1 Racing'],
            'Science': ['Space Exploration', 'New Scientific Discoveries', 'Health and Medicine', 'Climate Change News', 'NASA Updates']
        };

        if (query) {
            // Check if query is a broad category
            const subtopics = CATEGORY_SUBTOPICS[query];
            if (subtopics) {
                // Return a mix of subtopics for a rich feed
                keywords = subtopics;
            } else {
                keywords = [query];
            }
        } else {
            const trends = await getTrendingKeywords();
            keywords = trends.all;
            twitter = trends.twitter;
            reddit = trends.reddit;
        }

        // 2. Paginate keywords (skip pagination if single search query, or handle it differently)
        // If it's a search, we might want fewer generic results, but let's keep logic simple.
        const limitedKeywords = query ? keywords : keywords.slice(offset, offset + limit);

        if (limitedKeywords.length === 0) {
            return NextResponse.json({ feed: [], trending: [], hasMore: false });
        }

        const newsPromises = limitedKeywords.map(async (keyword) => {
            // Scrape
            const article = await scrapeNews(keyword);
            if (!article) return null;

            // Summarize & Analyze
            const llmResult = await summarizeNews(article.text);
            if (!llmResult) return null;

            const { summary, category: llmCategory, sentiment } = llmResult;

            // Helper to enforce consistent categorization
            const assignCategory = (text, defaultCat) => {
                const lower = text.toLowerCase();
                if (lower.match(/\b(ai|tech|code|software|app|google|apple|microsoft|crypto|bitcoin)\b/)) return 'Tech';
                if (lower.match(/\b(election|vote|senate|congress|minister|policy|law|government)\b/)) return 'Politics';
                if (lower.match(/\b(stock|market|money|economy|business|startup|ipo|trade)\b/)) return 'Business';
                if (lower.match(/\b(movie|music|film|star|celebrity|actor|song|netflix|game)\b/)) return 'Entertainment';
                if (lower.match(/\b(sport|ball|score|team|player|league|cup|nba|nfl)\b/)) return 'Sports';
                if (lower.match(/\b(science|space|nasa|planet|biology|virus|health|study)\b/)) return 'Science';
                return defaultCat || 'General';
            };

            const category = assignCategory(article.title + ' ' + summary, llmCategory);

            // Get DB interactions
            const interactions = await Interaction.find({ articleUrl: article.url });

            const likes = interactions.filter(i => i.type === 'like').length;
            const comments = interactions.filter(i => i.type === 'comment').map(i => ({
                text: i.content,
                timestamp: i.createdAt
            }));

            return {
                id: Buffer.from(article.url).toString('base64'),
                keyword,
                title: article.title,
                summary,
                category,
                sentiment,
                url: article.url,
                source: article.source,
                likes,
                comments
            };
        });

        const results = await Promise.all(newsPromises);
        const feed = results.filter(item => item !== null);

        return NextResponse.json({
            feed,
            trending: keywords,
            trendingSources: { twitter, reddit },
            hasMore: offset + limit < keywords.length
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const userId = await getUserFromToken();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, url, comment } = body;

        if (action === 'like') {
            await Interaction.create({
                userId,
                articleUrl: url,
                type: 'like'
            });
        } else if (action === 'comment' && comment) {
            await Interaction.create({
                userId,
                articleUrl: url,
                type: 'comment',
                content: comment
            });
        }

        // Fetch updated counts
        const interactions = await Interaction.find({ articleUrl: url });

        const likes = interactions.filter(i => i.type === 'like').length;
        const comments = interactions.filter(i => i.type === 'comment').map(i => ({
            text: i.content,
            timestamp: i.createdAt
        }));

        return NextResponse.json({
            success: true,
            likes,
            comments
        });
    } catch (error) {
        console.error('Interaction Error:', error);
        return NextResponse.json({ error: 'Invalid Request' }, { status: 400 });
    }
}
