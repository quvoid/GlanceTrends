import { Heart, MessageCircle, Send, Hash, Bookmark, Copy, Check, Share2, X, Search } from 'lucide-react';
import styles from './NewsCard.module.css';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import ProfileModal from './ProfileModal';

export default function NewsCard({ item }) {
    const { addToast } = useToast();
    const [likes, setLikes] = useState(item.likes || 0);
    const [comments, setComments] = useState(item.comments || []);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);

    // Profile Modal State
    const [selectedUser, setSelectedUser] = useState(null);

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
        addToast('Liked!', 'success');
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
        addToast('Comment added!', 'success');

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
        addToast('Stolen! Copied to clipboard.', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBookmark = async () => {
        if (bookmarked) {
            setBookmarked(false);
            addToast('Removed from saved.', 'info');
            await fetch(`/api/bookmarks?url=${encodeURIComponent(item.url)}`, { method: 'DELETE' });
        } else {
            setBookmarked(true);
            addToast('Saved for later!', 'success');
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

    const handleFactCheck = () => {
        const query = encodeURIComponent(`fact check ${item.title}`);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
        addToast('Opening fact check...', 'info');
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
                addToast('Failed to load friends.', 'error');
            } finally {
                setLoadingFriends(false);
            }
        }
    };

    const handleShareToFriend = async (friendId) => {
        setSentTo(prev => ({ ...prev, [friendId]: 'sending' }));
        try {
            const content = `Shared a story: ${item.title}`;
            await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: friendId,
                    content,
                    type: 'news',
                    metadata: {
                        title: item.title,
                        summary: item.summary,
                        url: item.url,
                        source: item.source,
                        image: item.image // Assuming item might have image later
                    }
                })
            });
            setSentTo(prev => ({ ...prev, [friendId]: 'sent' }));
            addToast('Sent!', 'success');
        } catch (e) {
            setSentTo(prev => ({ ...prev, [friendId]: 'error' }));
            addToast('Failed to send.', 'error');
        }
    };

    const analyzeSentiment = (commentsList) => {
        const positives = ['love', 'great', 'awesome', 'good', 'happy', 'agree', 'amazing', 'cool', 'thanks', 'right', 'nice', 'helpful', 'best', 'useful', 'fantastic', 'excellent', 'liked'];
        const negatives = ['hate', 'bad', 'terrible', 'wrong', 'fake', 'sad', 'angry', 'stupid', 'disagree', 'awful', 'worst', 'useless', 'boring', 'poor', 'trash', 'lies'];

        let score = 0;
        commentsList.forEach(c => {
            const words = c.text.toLowerCase().split(/\s+/);
            words.forEach(w => {
                if (positives.includes(w)) score++;
                if (negatives.includes(w)) score--;
            });
        });

        if (score > 0) return { color: '#4caf50', label: 'Positive Vibe' }; // Green
        if (score < 0) return { color: '#f44336', label: 'Negative Vibe' }; // Red
        return { color: '#29b6f6', label: 'Neutral Vibe' }; // Blue
    };

    const sentimentColor = item.sentiment === 'Positive' ? '#4caf50' :
        item.sentiment === 'Negative' ? '#f44336' : '#777';

    const communitySentiment = analyzeSentiment(comments);

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

                <button onClick={handleFactCheck} className={styles.actionBtn} title="Fact Check">
                    <Search size={20} />
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

            {/* Comment Modal */}
            {showComments && (
                <div className={styles.modalOverlay} onClick={() => setShowComments(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Comments ({comments.length})</h3>
                            <button className={styles.closeBtn} onClick={() => setShowComments(false)}>×</button>
                        </div>

                        <div className={styles.commentList} style={{
                            borderTop: `4px solid ${communitySentiment.color}`,
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <div style={{ color: communitySentiment.color, fontSize: '0.9rem', marginBottom: '10px', fontWeight: 'bold', textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                Community Vibe: {communitySentiment.label}
                            </div>

                            {comments.length === 0 && <div className={styles.empty}>No comments yet. Be the first!</div>}

                            {comments.map((c, i) => (
                                <div key={i} className={styles.comment} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'center' }}>
                                        {c.author && (
                                            <div
                                                style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #666' }}
                                                onClick={() => setSelectedUser(c.author)}
                                            >
                                                {c.author.avatar}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#fff' }} onClick={() => c.author && setSelectedUser(c.author)}>
                                                {c.author ? c.author.name : 'User'}
                                                {c.author?.verified && <Check size={12} fill="#1d9bf0" stroke="none" style={{ background: '#1d9bf0', borderRadius: '50%', padding: '2px', color: 'white' }} />}
                                            </div>
                                            {c.author && <div style={{ fontSize: '0.75rem', color: '#888' }}>{c.author.handle}</div>}
                                        </div>
                                    </div>
                                    <div style={{ color: '#ddd', paddingLeft: '38px' }}>{c.text}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                            <form onSubmit={handleComment} className={styles.commentForm}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        className={styles.input}
                                        autoFocus
                                    />
                                    <button type="submit" className={styles.sendBtn} style={{ background: 'var(--accent)' }}>
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </motion.div>
    );
}
