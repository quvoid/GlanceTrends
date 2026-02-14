'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const FeedCacheContext = createContext();

export function FeedCacheProvider({ children }) {
    const [cache, setCache] = useState({});           // { [category]: items[] }
    const [trendingSources, setTrendingSources] = useState({ twitter: [], reddit: [] });
    const [savedItems, setSavedItems] = useState([]);
    const [savedLoaded, setSavedLoaded] = useState(false);

    const getCached = useCallback((category) => cache[category] || null, [cache]);

    const setCached = useCallback((category, items) => {
        setCache(prev => ({ ...prev, [category]: items }));
    }, []);

    const appendCached = useCallback((category, newItems) => {
        setCache(prev => {
            const existing = prev[category] || [];
            const deduped = newItems.filter(item => !existing.some(e => e.id === item.id));
            return { ...prev, [category]: [...existing, ...deduped] };
        });
    }, []);

    return (
        <FeedCacheContext.Provider value={{
            getCached, setCached, appendCached,
            trendingSources, setTrendingSources,
            savedItems, setSavedItems,
            savedLoaded, setSavedLoaded
        }}>
            {children}
        </FeedCacheContext.Provider>
    );
}

export function useFeedCache() {
    const ctx = useContext(FeedCacheContext);
    if (!ctx) throw new Error('useFeedCache must be used within FeedCacheProvider');
    return ctx;
}
