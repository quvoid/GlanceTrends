'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import NewsCard from '@/components/NewsCard';
import feedStyles from '@/components/Feed.module.css';
import styles from './search.module.css';
import { Search as SearchIcon, Loader } from 'lucide-react';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        setResults([]);

        try {
            const res = await fetch(`/api/feed?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(data.feed || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={feedStyles.layout}>
            {/* Left Column: Sidebar (consistent) */}
            <div className={feedStyles.sidebarCol}>
                <Sidebar />
            </div>

            {/* Middle Column: Search */}
            <div className={feedStyles.feedCol}>
                <div className={styles.searchHeader}>
                    <form onSubmit={handleSearch} className={styles.searchForm}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search news by topic (e.g., Bitcoin, AI, Marvel)..."
                            className={styles.searchInput}
                            autoFocus
                        />
                        <button type="submit" className={styles.searchBtn} disabled={loading}>
                            {loading ? <Loader className={styles.spin} /> : <SearchIcon />}
                        </button>
                    </form>
                </div>

                <div className={styles.results}>
                    {loading && <div className={styles.message}>Searching the web for "{query}"...</div>}

                    {!loading && searched && results.length === 0 && (
                        <div className={styles.message}>No stories found for "{query}". Try another topic.</div>
                    )}

                    {!loading && !searched && (
                        <div className={styles.emptyState}>
                            <SearchIcon size={64} opacity={0.2} />
                            <h2>Explore the world</h2>
                            <p>Type a keyword above to find the latest stories.</p>
                        </div>
                    )}

                    {results.map((item, index) => (
                        <NewsCard key={item.id} item={item} />
                    ))}
                </div>
            </div>

            {/* Right Column: Empty for search */}
            <div className={feedStyles.panelCol}></div>
        </div>
    );
}
