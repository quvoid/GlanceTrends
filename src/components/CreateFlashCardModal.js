'use client';
import { useState } from 'react';
import styles from './NewsCard.module.css'; // Reuse Modal styles from NewsCard for consistency
import { X, Send } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function CreateFlashCardModal({ onClose, onCreate, initialKeyword }) {
    const { user } = useUser();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [keyword, setKeyword] = useState(initialKeyword || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !content) return;

        onCreate({
            title,
            summary: content,
            keyword: keyword.startsWith('#') ? keyword : `#${keyword}`,
            author: user,
            likes: 0,
            comments: 0
        });
        onClose();
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '500px' }}>
                <div className={styles.modalHeader}>
                    <h3>Create Flash Card</h3>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#888' }}>Trending Keyword</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="#Crypto, #AI, etc."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#888' }}>Headline</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="What's happening?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#888' }}>Report Details</label>
                        <textarea
                            className={styles.input}
                            rows={5}
                            placeholder="Share your insights..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{ resize: 'none', borderRadius: '12px' }}
                        />
                    </div>

                    <button type="submit" className={styles.sendBtn} style={{ marginTop: '10px', fontSize: '1rem', padding: '12px', justifyContent: 'center', width: '100%' }}>
                        <Send size={18} style={{ marginRight: '8px' }} />
                        Publish Report
                    </button>
                </form>
            </div>
        </div>
    );
}
