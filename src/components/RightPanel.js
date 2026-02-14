'use client';
import { useState } from 'react';
import { PenSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './RightPanel.module.css';

export default function RightPanel({ trendingSources = { twitter: [], reddit: [] } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('twitter');

    const topics = activeTab === 'twitter' ? trendingSources.twitter : trendingSources.reddit;

    return (
        <aside className={styles.panel}>
            <div className={styles.container}>
                {/* Tabs */}
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

                {/* Trending List */}
                <ul className={styles.trendingList}>
                    {topics.map((topic, index) => (
                        <li
                            key={index}
                            className={styles.trendingItem}
                            onClick={() => router.push(`/explore?mode=create&topic=${encodeURIComponent(topic.replace(/^#/, ''))}`)}
                        >
                            <div className={styles.rank} style={{ color: index < 3 ? 'var(--accent)' : '#666' }}>
                                {index + 1}
                            </div>
                            <div className={styles.topicInfo}>
                                <span className={styles.topicName}>{topic.replace(/^#/, '')}</span>
                                <span className={styles.topicMeta}>
                                    {Math.floor(Math.random() * 50 + 10)}K posts • Trending
                                </span>
                            </div>
                            <div className={styles.trendAction}>
                                <PenSquare size={14} />
                            </div>
                        </li>
                    ))}
                    {topics.length === 0 && (
                        <li className={styles.empty}>No trends found.</li>
                    )}
                </ul>
            </div>
        </aside>
    );
}
