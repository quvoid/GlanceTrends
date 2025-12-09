'use client';

import { useEffect, useState } from 'react';
import NewsCard from './NewsCard';
import Navigation from './Navigation';
import styles from './Feed.module.css';

export default function Feed() {
    const [items, setItems] = useState([]);
    const [trending, setTrending] = useState([]);
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
                <div className={styles.navContainer}>
                    <Navigation />
                </div>

                <div className={styles.trendingContainer}>
                    <h3 className={styles.sidebarTitle}>Trending Now</h3>
                    <ul className={styles.trendingList}>
                        {trending.map((topic, index) => (
                            <li key={index} className={styles.trendingItem}>
                                <span className={styles.rank}>{index + 1}</span>
                                <span className={styles.topic}>{topic}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </div>
    );
}
