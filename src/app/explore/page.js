'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import FlashCard from '@/components/FlashCard';
import CreateFlashCardModal from '@/components/CreateFlashCardModal';
import styles from '@/components/Feed.module.css'; // Reusing Feed styles for layout
import { PenSquare, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useSearchParams } from 'next/navigation';

export default function ExplorePage() {
    const { user } = useUser() || { user: { name: 'You', handle: '@you' } };
    const searchParams = useSearchParams();

    // States
    const [selectedKeyword, setSelectedKeyword] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Auto-open modal if came from trending click
    useEffect(() => {
        const mode = searchParams.get('mode');
        const topic = searchParams.get('topic');

        if (mode === 'create' && topic) {
            setSelectedKeyword(topic);
            setShowCreateModal(true);
        }
    }, [searchParams]);

    // Mock Data for Flash Cards
    const [flashCards, setFlashCards] = useState([
        {
            id: 1,
            author: { name: "Tech Insider", handle: "@techinsider", avatar: "T", verified: true },
            keyword: "Tech",
            title: "AI Models are getting faster",
            summary: "New benchmarks show a 2x increase in inference speed for LLMs on consumer hardware.",
            likes: 120,
            comments: 45
        },
        {
            id: 2,
            author: { name: "Sarah Connor", handle: "@skynet_hater", avatar: "S", verified: true },
            keyword: "Future",
            title: "Robots playing soccer?",
            summary: "Saw a demo of robots playing soccer today. It's both impressive and terrifying.",
            likes: 842,
            comments: 102
        }
    ]);

    const keywords = ['All', 'Tech', 'Crypto', 'Politics', 'Future', 'Science', 'Design'];

    const handleCreateCard = (newCard) => {
        setFlashCards(prev => [
            { id: Date.now(), ...newCard },
            ...prev
        ]);
    };

    const filteredCards = selectedKeyword === 'All'
        ? flashCards
        : flashCards.filter(c => c.keyword.toLowerCase().includes(selectedKeyword.toLowerCase()));

    return (
        <div className={styles.layout}>
            <div className={styles.navContainer}>
                <Navigation />
            </div>

            <div className={styles.main}>
                <div className={styles.controls} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Compass size={32} color="var(--accent)" />
                            Explore Reports
                        </h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                background: 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                boxShadow: '0 4px 15px rgba(29, 155, 240, 0.4)'
                            }}
                        >
                            <PenSquare size={18} />
                            Write Application
                        </button>
                    </div>

                    <div className={styles.categories}>
                        {keywords.map(k => (
                            <button
                                key={k}
                                className={`${styles.categoryBtn} ${selectedKeyword === k ? styles.activeCategory : ''}`}
                                onClick={() => setSelectedKeyword(k)}
                            >
                                {k}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.feed}>
                    {filteredCards.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            No reports in #{selectedKeyword} yet. Be the first to write one!
                        </div>
                    )}

                    {filteredCards.map(card => (
                        <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <FlashCard item={card} />
                        </motion.div>
                    ))}
                </div>
            </div>

            <aside className={styles.sidebar}>
                <div className={styles.trendingContainer}>
                    <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', padding: '0 10px' }}>Trending Reporters</h3>
                    <ul className={styles.trendingList}>
                        <li className={styles.trendingItem} style={{ alignItems: 'center', gap: '10px' }}>
                            <div className={styles.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>T</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>Tech Insider</span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>@techinsider</span>
                            </div>
                        </li>
                        <li className={styles.trendingItem} style={{ alignItems: 'center', gap: '10px' }}>
                            <div className={styles.avatar} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ff6b6b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>S</div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold' }}>Sarah Connor</span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>@skynet_hater</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </aside>

            {showCreateModal && (
                <CreateFlashCardModal
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateCard}
                    initialKeyword={selectedKeyword === 'All' ? '' : selectedKeyword}
                />
            )}
        </div>
    );
}
