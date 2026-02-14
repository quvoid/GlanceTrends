'use client';

import { useState, useEffect, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import FlashCard from '@/components/FlashCard';
import CreateFlashCardModal from '@/components/CreateFlashCardModal';
import styles from '@/components/Feed.module.css';
import { PenSquare, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useSearchParams } from 'next/navigation';

function ExploreContent() {
    const { user } = useUser();
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
            {/* Left Column: Sidebar (consistent) */}
            <div className={styles.sidebarCol}>
                <Sidebar />
            </div>

            {/* Middle Column: Explore Content */}
            <div className={styles.feedCol}>
                <div className={styles.controls} style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Compass size={28} color="var(--accent)" />
                            Explore Reports
                        </h1>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                background: 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 18px',
                                borderRadius: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                boxShadow: '0 4px 15px rgba(29, 155, 240, 0.4)'
                            }}
                        >
                            <PenSquare size={16} />
                            Write
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

                {filteredCards.length === 0 && (
                    <div className={styles.empty}>
                        No reports in #{selectedKeyword} yet. Be the first to write one!
                    </div>
                )}

                {filteredCards.map(card => (
                    <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <FlashCard item={card} />
                    </motion.div>
                ))}
            </div>

            {/* Right Column: Trending Reporters */}
            <div className={styles.panelCol}>
                <div style={{ padding: '24px 16px', position: 'sticky', top: 0 }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '700' }}>Trending Reporters</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { name: "Tech Insider", handle: "@techinsider", avatar: "T", color: "#667eea" },
                            { name: "Sarah Connor", handle: "@skynet_hater", avatar: "S", color: "#ff6b6b" }
                        ].map((reporter, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: reporter.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', fontSize: '1rem' }}>
                                    {reporter.avatar}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{reporter.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{reporter.handle}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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

export default function ExplorePage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading...</div>}>
            <ExploreContent />
        </Suspense>
    );
}
