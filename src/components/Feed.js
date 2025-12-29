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
    const [feedCache, setFeedCache] = useState({});

    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const categories = ['All', 'Tech', 'Politics', 'Business', 'Entertainment', 'Sports', 'Science'];

    const fetchFeed = async (pageNum, cat = 'All') => {
        // Cache Check for Page 1
        if (pageNum === 1 && feedCache[cat] && feedCache[cat].length > 0) {
            setItems(feedCache[cat]);
            setLoading(false);
            return;
        }

        if (loading) return;
        setLoading(true);
        try {
            let url = `/api/feed?page=${pageNum}&limit=3`;
            if (cat !== 'All') {
                url += `&q=${encodeURIComponent(cat)}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.feed) {
                setItems(prev => {
                    // Reset if page 1
                    if (pageNum === 1) return data.feed;

                    const newItems = data.feed.filter(item => !prev.some(p => p.id === item.id));
                    return [...prev, ...newItems];
                });
            }
            // ... (rest of logic handles trending/hasMore)
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

    // Initial Load & Tab Change
    useEffect(() => {
        if (feedTab === 'trending') {
            if (feedCache[selectedCategory]) {
                setItems(feedCache[selectedCategory]);
                setLoading(false);
                setPage(1);
                setHasMore(true);
            } else {
                setItems([]);
                setPage(1);
                setHasMore(true);
                fetchFeed(1, selectedCategory);
            }
        } else {
            fetchSaved();
        }
    }, [feedTab, selectedCategory]);

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (feedTab === 'trending' && window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !loading) {
                setPage(prev => {
                    const nextPage = prev + 1;
                    fetchFeed(nextPage, selectedCategory);
                    return nextPage;
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading, feedTab, selectedCategory]);

    // Display Logic
    const displayedItems = feedTab === 'trending' ? items : savedItems;
    // No more client-side filtering for 'trending' as API handles it. 
    // For 'saved', we might want to filter, but let's keep it simple for now or filter if needed.
    const finalItems = feedTab === 'saved' && selectedCategory !== 'All'
        ? displayedItems.filter(i => i.category === selectedCategory)
        : displayedItems;

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
