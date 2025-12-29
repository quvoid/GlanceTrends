'use client';

import { useEffect, useState } from 'react';
import NewsCard from './NewsCard';
import Navigation from './Navigation';
import styles from './Feed.module.css';

export default function Feed() {
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

                {loading && <div className={styles.loading}>Loading more...</div>}

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
                            <li key={index} className={styles.trendingItem}>
                                <span className={styles.rank}>{index + 1}</span>
                                <span className={styles.topic}>{topic.replace(/^#/, '')}</span>
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
