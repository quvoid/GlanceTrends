'use client';

import { useEffect, useState } from 'react';
import NewsCard from './NewsCard';
import SkeletonCard from './SkeletonCard';
import Navigation from './Navigation';
import { useRouter } from 'next/navigation';
import { PenSquare } from 'lucide-react';
import styles from './Feed.module.css';

export default function Feed() {
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [savedItems, setSavedItems] = useState([]);
    const [trending, setTrending] = useState([]);
    const [trendingSources, setTrendingSources] = useState({ twitter: [], reddit: [] });

    // UI States
    const [activeTab, setActiveTab] = useState('twitter');
    const [feedTab, setFeedTab] = useState('trending'); // 'trending' | 'saved'
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const categories = ['All', 'Tech', 'Politics', 'Business', 'Entertainment', 'Sports', 'Science'];

    const fetchFeed = async (pageNum) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/feed?page=${pageNum}&limit=3`);
            const data = await res.json();

            if (data.feed) {
                setItems(prev => {
                    const newItems = data.feed.filter(item => !prev.some(p => p.id === item.id));

                    // INJECT DUMMY COMMENTS FOR DEMO (First Item Only)
                    if (pageNum === 1 && newItems.length > 0) {
                        const authors = [
                            { name: "Tech Insider", handle: "@techinsider", verified: true, bio: "Breaking tech news and reviews.", followers: "2.4M", avatar: "T" },
                            { name: "Sarah Connor", handle: "@skynet_hater", verified: true, bio: "No Fate. Resistance Leader.", followers: "50K", avatar: "S" },
                            { name: "Crypto King", handle: "@btc_maxi", verified: false, bio: "Bitcoin is king. HODL.", followers: "1.2K", avatar: "C" },
                            { name: "News Bot", handle: "@auto_news", verified: true, bio: "Automated news aggregation.", followers: "500K", avatar: "N" },
                            { name: "John Doe", handle: "@johndoe123", verified: false, bio: "Just a guy.", followers: "42", avatar: "J" },
                            { name: "Elon's Alt", handle: "@mars_mission", verified: true, bio: "Occupying Mars.", followers: "100M", avatar: "E" },
                            { name: "Design Daily", handle: "@ui_ux_trends", verified: true, bio: "Daily dose of design.", followers: "300K", avatar: "D" },
                            { name: "Code Ninja", handle: "@fullstack_dev", verified: false, bio: "Coffee -> Code.", followers: "4K", avatar: "C" }
                        ];

                        const rawComments = [
                            { text: "This is absolutely amazing! Love it." },
                            { text: "Terrible reporting, completely wrong." },
                            { text: "I agree with this perspective, very helpful." },
                            { text: "Worst article I've read all day. Boring." },
                            { text: "Fantastic news for the industry!" },
                            { text: "Sad to see this happening." },
                            { text: "Great insights, thanks for sharing." },
                            { text: "This is fake news, don't believe it." },
                            { text: "Cool update, waiting for more." },
                            { text: "Stupid decision by the company." },
                            { text: "Excellent summary, saved me time." },
                            { text: "Awful clickbait title." },
                            { text: "Nice work, really useful." },
                            { text: "Useless information, waste of time." },
                            { text: "Best thing I've read today!" },
                            { text: "Trash content." },
                            { text: "Loved the details." },
                            { text: "Hate this topic." },
                            { text: "Right on point!" },
                            { text: "Poorly written." },
                            { text: "Love this!" }, { text: "So happy about this" }, { text: "Amazing job" }
                        ];

                        // Map comments to random authors
                        const dummyComments = rawComments.flatMap(c => [c, c]).map((c, i) => ({ // Doubling via flatMap
                            ...c,
                            author: authors[i % authors.length]
                        }));

                        newItems[0].comments = dummyComments;
                    }

                    return [...prev, ...newItems];
                });
            }
            if (data.trending && pageNum === 1) {
                setTrending(data.trending);
                if (data.trendingSources) {
                    setTrendingSources(data.trendingSources);
                }
            }
            if (data.hasMore !== undefined) {
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error('Failed to fetch feed:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSaved = async () => {
        try {
            const res = await fetch('/api/bookmarks');
            const data = await res.json();
            if (data.bookmarks) {
                setSavedItems(data.bookmarks);
            }
        } catch (e) {
            console.error('Failed to fetch bookmarks');
        }
    };

    useEffect(() => {
        if (feedTab === 'trending') {
            fetchFeed(1);
        } else {
            fetchSaved();
        }
    }, [feedTab]);

    // Infinite scroll for trending only
    useEffect(() => {
        const handleScroll = () => {
            if (feedTab === 'trending' && window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !loading) {
                setPage(prev => {
                    const nextPage = prev + 1;
                    fetchFeed(nextPage);
                    return nextPage;
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading, feedTab]);

    // Filter Logic
    const displayedItems = feedTab === 'trending' ? items : savedItems;
    const finalItems = selectedCategory === 'All'
        ? displayedItems
        : displayedItems.filter(i => i.category === selectedCategory);

    return (
        <div className={styles.layout}>
            <div className={styles.navContainer}>
                <Navigation />
            </div>
            <div className={styles.main}>
                {/* Visual Header / Controls */}
                <div className={styles.controls}>
                    <div className={styles.feedTabs}>
                        <button
                            className={`${styles.feedTab} ${feedTab === 'trending' ? styles.activeFeedTab : ''}`}
                            onClick={() => setFeedTab('trending')}
                        >
                            🔥 Trending
                        </button>
                        <button
                            className={`${styles.feedTab} ${feedTab === 'saved' ? styles.activeFeedTab : ''}`}
                            onClick={() => setFeedTab('saved')}
                        >
                            🔖 Saved
                        </button>
                    </div>

                    <div className={styles.categories}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.activeCategory : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {finalItems.map((item) => (
                    <NewsCard key={item.id || item._id} item={item} />
                ))}

                {loading && (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                )}

                {!loading && finalItems.length === 0 && (
                    <div className={styles.empty}>
                        {feedTab === 'saved' ? 'No bookmarks yet.' : 'No news found.'}
                    </div>
                )}
            </div>

            <aside className={styles.sidebar}>
                <div className={styles.trendingContainer}>
                    <div className={styles.tabContainer}>
                        <button
                            className={`${styles.tab} ${activeTab === 'twitter' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('twitter')}
                        >
                            Twitter
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'reddit' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('reddit')}
                        >
                            Reddit
                        </button>
                    </div>

                    <ul className={styles.trendingList}>
                        {(activeTab === 'twitter' ? trendingSources.twitter : trendingSources.reddit).map((topic, index) => (
                            <li
                                key={index}
                                className={styles.trendingItem}
                                onClick={() => router.push(`/explore?mode=create&topic=${encodeURIComponent(topic.replace(/^#/, ''))}`)}
                            >
                                <div className={styles.rank} style={{ color: index < 3 ? 'var(--accent)' : '#666' }}>{index + 1}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span className={styles.topic}>{topic.replace(/^#/, '')}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                                        {Math.floor(Math.random() * 50 + 10)}K posts • Trending
                                    </span>
                                </div>
                                <div className={styles.trendAction}>
                                    <PenSquare size={14} />
                                </div>
                            </li>
                        ))}
                        {(activeTab === 'twitter' ? trendingSources.twitter : trendingSources.reddit).length === 0 && (
                            <li className={styles.empty}>No trends found.</li>
                        )}
                    </ul>
                </div>
            </aside>
        </div>
    );
}
