import { Heart, MessageCircle, Send, Hash, Bookmark, Copy, Check, Share2, X } from 'lucide-react';
import styles from './NewsCard.module.css';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function NewsCard({ item }) {
    const [likes, setLikes] = useState(item.likes || 0);
    const [comments, setComments] = useState(item.comments || []);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    // Share & Friends State
    const [showShareModal, setShowShareModal] = useState(false);
    const [friends, setFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(false);
    const [sentTo, setSentTo] = useState({}); // Track sent status per friend

    // Other States
    const [bookmarked, setBookmarked] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const handleSteal = () => {
        const textToSteal = `${item.title}\n\n${item.summary}\n\n🔗 ${item.url}\n\n#Sekilas #News`;
        navigator.clipboard.writeText(textToSteal);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBookmark = async () => {
        if (bookmarked) {
            setBookmarked(false);
            await fetch(`/api/bookmarks?url=${encodeURIComponent(item.url)}`, { method: 'DELETE' });
        } else {
            setBookmarked(true);
            await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: item.url,
                    title: item.title,
                    summary: item.summary,
                    source: item.source,
                    category: item.category,
                    sentiment: item.sentiment,
                    keyword: item.keyword
                })
            });
        }
    };

    const openShareModal = async () => {
        setShowShareModal(true);
        if (friends.length === 0) {
            setLoadingFriends(true);
            try {
                const res = await fetch('/api/friends');
                const data = await res.json();
                setFriends(data.friends || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingFriends(false);
            }
        }
    };

    const handleShareToFriend = async (friendId) => {
        setSentTo(prev => ({ ...prev, [friendId]: 'sending' }));
        try {
            const content = `Check this out:\n\n${item.title}\n${item.url}`;
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: friendId, content })
            });
            setSentTo(prev => ({ ...prev, [friendId]: 'sent' }));
        } catch (e) {
            setSentTo(prev => ({ ...prev, [friendId]: 'error' }));
        }
    };

    const sentimentColor = item.sentiment === 'Positive' ? '#4caf50' :
        item.sentiment === 'Negative' ? '#f44336' : '#777';

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ borderLeft: `4px solid ${sentimentColor}` }}
        >
            <div className={styles.meta}>
                <span className={styles.source}>{item.source}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.keyword}>#{item.keyword ? item.keyword.replace(/^#/, '') : 'News'}</span>
                {item.category && (
                    <span className={styles.categoryBadge}>{item.category}</span>
                )}
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

                <button
                    className={`${styles.actionBtn} ${bookmarked ? styles.activeAction : ''}`}
                    onClick={handleBookmark}
                    title="Bookmark"
                >
                    <Bookmark size={20} fill={bookmarked ? "currentColor" : "none"} />
                </button>

                {/* Share Button */}
                <button onClick={openShareModal} className={styles.actionBtn} title="Share to DM">
                    <Send size={20} />
                </button>

                <button
                    className={styles.stealBtn}
                    onClick={handleSteal}
                    title="Steal this story"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    <span>{copied ? 'Stolen!' : 'Steal'}</span>
                </button>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className={styles.modalOverlay} onClick={() => setShowShareModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Share via DM</h3>
                            <button className={styles.closeBtn} onClick={() => setShowShareModal(false)}>×</button>
                        </div>
                        <div className={styles.friendList}>
                            {loadingFriends && <div className={styles.loading}>Loading friends...</div>}
                            {!loadingFriends && friends.length === 0 && <div className={styles.empty}>No friends yet.</div>}

                            {friends.map(friend => (
                                <div key={friend.friendId} className={styles.friendItem}>
                                    <div className={styles.friendInfo}>
                                        <div className={styles.avatar}>{friend.name[0]}</div>
                                        <span>{friend.name}</span>
                                    </div>
                                    <button
                                        className={`${styles.sendBtn} ${sentTo[friend.friendId] === 'sent' ? styles.sent : ''}`}
                                        onClick={() => handleShareToFriend(friend.friendId)}
                                        disabled={sentTo[friend.friendId] === 'sent' || sentTo[friend.friendId] === 'sending'}
                                    >
                                        {sentTo[friend.friendId] === 'sent' ? 'Sent!' :
                                            sentTo[friend.friendId] === 'sending' ? '...' : 'Send'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
