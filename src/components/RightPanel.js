'use client';
import { useState } from 'react';
import { PenSquare, Flame, Swords } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './RightPanel.module.css';

const MOCK_DEBATES = [
    { sideA: 'OpenAI', sideB: 'Open Source', topic: 'AI Safety vs Freedom', heat: 94, posts: '38K' },
    { sideA: 'India', sideB: 'Pakistan', topic: 'Champions Trophy Venue', heat: 88, posts: '52K' },
    { sideA: 'Apple', sideB: 'EU', topic: 'App Store Regulations', heat: 76, posts: '21K' },
    { sideA: 'Gamers', sideB: 'Sony', topic: 'PS6 Pricing Leak', heat: 71, posts: '18K' },
    { sideA: 'Elon Musk', sideB: 'Sam Altman', topic: 'AGI Timeline', heat: 65, posts: '14K' },
];

function getHeatColor(heat) {
    if (heat >= 85) return '#ff1744';
    if (heat >= 70) return '#ff9100';
    if (heat >= 50) return '#ffc400';
    return '#69f0ae';
}

export default function RightPanel({ trendingSources = { twitter: [], reddit: [] } }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('debates');

    const topics = activeTab === 'twitter' ? trendingSources.twitter : trendingSources.reddit;

    return (
        <aside className={styles.panel}>
            <div className={styles.container}>
                {/* Tabs */}
                <div className={styles.tabContainer}>
                    <button
                        className={`${styles.tab} ${activeTab === 'debates' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('debates')}
                    >
                        <Swords size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        Debates
                    </button>
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

                {/* Debates View */}
                {activeTab === 'debates' && (
                    <ul className={styles.trendingList}>
                        {MOCK_DEBATES.map((debate, index) => (
                            <li key={index} className={styles.debateItem}>
                                <div className={styles.debateHeader}>
                                    <div className={styles.debateMatchup}>
                                        <span className={styles.debateSide}>{debate.sideA}</span>
                                        <span className={styles.debateVs}>vs</span>
                                        <span className={styles.debateSide}>{debate.sideB}</span>
                                    </div>
                                    <div className={styles.heatBadge} style={{ background: `${getHeatColor(debate.heat)}20`, color: getHeatColor(debate.heat) }}>
                                        <Flame size={11} />
                                        {debate.heat}
                                    </div>
                                </div>
                                <div className={styles.debateTopic}>{debate.topic}</div>
                                <div className={styles.debateMeta}>{debate.posts} posts discussing</div>
                                {/* Heat Bar */}
                                <div className={styles.heatBarTrack}>
                                    <div className={styles.heatBarFill} style={{ width: `${debate.heat}%`, background: getHeatColor(debate.heat) }} />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Twitter / Reddit Trending List */}
                {(activeTab === 'twitter' || activeTab === 'reddit') && (
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
                )}
            </div>
        </aside>
    );
}
