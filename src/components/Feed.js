'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import NewsCard from './NewsCard';
import SkeletonCard from './SkeletonCard';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import styles from './Feed.module.css';
import { useFeedCache } from '@/context/FeedCacheContext';

export default function Feed() {
    const {
        getCached, setCached, appendCached,
        trendingSources, setTrendingSources,
        savedItems, setSavedItems,
        savedLoaded, setSavedLoaded
    } = useFeedCache();

    // Local UI states
    const [feedTab, setFeedTab] = useState('trending');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Items displayed from cache
    const [items, setItems] = useState([]);

    const categories = ['All', 'Tech', 'Politics', 'Business', 'Entertainment', 'Sports', 'Science'];

    const fetchFeed = useCallback(async (pageNum, cat = 'All') => {
        if (loading) return;
        setLoading(true);
        try {
            let url = `/api/feed?page=${pageNum}&limit=10`;
            if (cat !== 'All') {
                url += `&q=${encodeURIComponent(cat)}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.feed) {
                if (pageNum === 1) {
                    setCached(cat, data.feed);
                    setItems(data.feed);
                } else {
                    appendCached(cat, data.feed);
                    setItems(prev => {
                        const newItems = data.feed.filter(item => !prev.some(p => p.id === item.id));
                        return [...prev, ...newItems];
                    });
                }
            }
            if (data.trending && pageNum === 1) {
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
    }, [loading, setCached, appendCached, setTrendingSources]);

    const fetchSaved = async () => {
        try {
            const res = await fetch('/api/bookmarks');
            const data = await res.json();
            if (data.bookmarks) {
                setSavedItems(data.bookmarks);
                setSavedLoaded(true);
            }
        } catch (e) {
            console.error('Failed to fetch bookmarks');
        }
    };

    // On mount / tab+category change: use cache if available, else fetch
    useEffect(() => {
        if (feedTab === 'trending') {
            const cached = getCached(selectedCategory);
            if (cached && cached.length > 0) {
                // Instantly show cached data — no loading spinner
                setItems(cached);
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
            if (savedLoaded) {
                // Already loaded saved items — show instantly
            } else {
                fetchSaved();
            }
        }
    }, [feedTab, selectedCategory]);

    // Infinite scroll
    useEffect(() => {
        const handleScroll = () => {
            if (feedTab === 'trending' && window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 && hasMore && !loading) {
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
    const finalItems = feedTab === 'saved' && selectedCategory !== 'All'
        ? displayedItems.filter(i => i.category === selectedCategory)
        : displayedItems;

    return (
        <div className={styles.layout}>
            {/* Left Column: Sidebar */}
            <div className={styles.sidebarCol}>
                <Sidebar />
            </div>

            {/* Middle Column: Feed */}
            <div className={styles.feedCol}>
                {/* Controls: Tabs + Categories */}
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

                {/* News Cards */}
                {finalItems.map((item, index) => (
                    <NewsCard key={`${item.id || item._id}-${index}`} item={item} />
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

            {/* Right Column: Trending Panel */}
            <div className={styles.panelCol}>
                <RightPanel trendingSources={trendingSources} />
            </div>
        </div>
    );
}
