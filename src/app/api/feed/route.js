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

        // 1. Get Trending Keywords
        const { all: keywords, twitter, reddit } = await getTrendingKeywords();

        // 2. Paginate keywords
        const limitedKeywords = keywords.slice(offset, offset + limit);

        if (limitedKeywords.length === 0) {
            return NextResponse.json({ feed: [], trending: keywords, hasMore: false });
        }

        const newsPromises = limitedKeywords.map(async (keyword) => {
            // Scrape
            const article = await scrapeNews(keyword);
            if (!article) return null;

            // Summarize
            const summary = await summarizeNews(article.text);
            if (!summary) return null;

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
