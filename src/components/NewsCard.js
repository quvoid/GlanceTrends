'use client';

import { useState } from 'react';
import styles from './NewsCard.module.css';

import { motion } from 'framer-motion';

export default function NewsCard({ item }) {
    const [likes, setLikes] = useState(item.likes);
    const [comments, setComments] = useState(item.comments);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    const handleLike = async () => {
        setLikes(prev => prev + 1);
        await fetch('/api/feed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'like', url: item.url })
        });
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        const newComment = { text: commentText, timestamp: new Date().toISOString() };
        setComments(prev => [...prev, newComment]);
        setCommentText('');

        await fetch('/api/feed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'comment', url: item.url, comment: commentText })
        });
    };

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.meta}>
                <span className={styles.source}>{item.source}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.keyword}>#{item.keyword}</span>
            </div>

            <h2 className={styles.title}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
            </h2>

            <p className={styles.summary}>{item.summary}</p>

            <div className={styles.actions}>
                <button onClick={handleLike} className={styles.actionBtn}>
                    ❤️ {likes}
                </button>
                <button onClick={() => setShowComments(!showComments)} className={styles.actionBtn}>
                    💬 {comments.length}
                </button>
                <button className={styles.actionBtn} onClick={() => navigator.clipboard.writeText(item.url)}>
                    🚀 Share
                </button>
            </div>

            {showComments && (
                <div className={styles.commentsSection}>
                    {comments.map((c, i) => (
                        <div key={i} className={styles.comment}>
                            {c.text}
                        </div>
                    ))}
                    <form onSubmit={handleComment} className={styles.commentForm}>
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className={styles.input}
                        />
                    </form>
                </div>
            )}
        </motion.div>
    );
}
