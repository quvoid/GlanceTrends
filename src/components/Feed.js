'use client';

import { useEffect, useState } from 'react';
import NewsCard from './NewsCard';
import Navigation from './Navigation';
import styles from './Feed.module.css';

export default function Feed() {
    const [items, setItems] = useState([]);
    const [trending, setTrending] = useState([]);
    const [trendingSources, setTrendingSources] = useState({ twitter: [], reddit: [] });
    const [activeTab, setActiveTab] = useState('twitter');
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchFeed = async (pageNum) => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/feed?page=${pageNum}&limit=3`);
            const data = await res.json();

            if (data.feed) {
                setItems(prev => {
                    // Avoid duplicates
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

    // Initial load
    useEffect(() => {
        fetchFeed(1);
    }, []);

    // Infinite scroll listener
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && hasMore && !loading) {
                setPage(prev => {
                    const nextPage = prev + 1;
                    fetchFeed(nextPage);
                    return nextPage;
                });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading]);

    return (
        <div className={styles.layout}>
            <div className={styles.navContainer}>
                <Navigation />
            </div>
            <div className={styles.main}>
                {items.map((item) => (
                    <NewsCard key={item.id} item={item} />
                ))}
                {loading && <div className={styles.loading}>Loading more...</div>}
                {!hasMore && items.length > 0 && (
                    <div className={styles.empty}>You're all caught up!</div>
                )}
                {items.length === 0 && !loading && (
                    <div className={styles.empty}>No trending news found.</div>
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
                                <span className={styles.topic}>{topic}</span>
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
