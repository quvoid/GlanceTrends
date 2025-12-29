'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Navigation from '@/components/Navigation';
import styles from './friends.module.css';
import { MessageSquare, UserPlus, Users, Search, Smile, Image as ImageIcon, Send, Paperclip, ExternalLink } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';

export default function FriendsPage() {
    const [friends, setFriends] = useState([]);
    const [pendingSent, setPendingSent] = useState([]);
    const [pendingReceived, setPendingReceived] = useState([]);
    const [activeFriend, setActiveFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Resizer State
    const [rightColumnWidth, setRightColumnWidth] = useState(320);
    const [isResizing, setIsResizing] = useState(false);

    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);
    const containerRef = useRef(null);

    // Resizing Logic
    const startResizing = useCallback((mouseDownEvent) => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback((mouseMoveEvent) => {
        if (isResizing) {
            const newWidth = window.innerWidth - mouseMoveEvent.clientX;
            if (newWidth > 200 && newWidth < 600) { // Min/Max constraints
                setRightColumnWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    // Initial Load
    useEffect(() => {
        fetchFriends();
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeFriend]);

    // Poll for messages when chat is open
    useEffect(() => {
        if (activeFriend) {
            fetchMessages(activeFriend.friendId);
            intervalRef.current = setInterval(() => {
                fetchMessages(activeFriend.friendId, true); // true = silent update
            }, 3000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [activeFriend]);

    const fetchFriends = async () => {
        try {
            const res = await fetch('/api/friends');
            const data = await res.json();
            setFriends(data.friends || []);
            setPendingSent(data.pendingSent || []);
            setPendingReceived(data.pendingReceived || []);
        } catch (e) {
            console.error(e);
        }
    };

    const searchUsers = async (q) => {
        setSearchQuery(q);
        if (q.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`/api/users/search?q=${q}`);
            const data = await res.json();
            setSearchResults(data.users || []);
        } catch (e) {
            console.error(e);
        }
    };

    const sendRequest = async (targetId) => {
        await fetch('/api/friends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'request', targetUserId: targetId })
        });
        setSearchQuery('');
        setSearchResults([]);
        fetchFriends();
    };

    const acceptRequest = async (requestId) => {
        await fetch('/api/friends', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'accept', requestId })
        });
        fetchFriends();
    };

    const fetchMessages = async (friendId, silent = false) => {
        try {
            const res = await fetch(`/api/messages?friendId=${friendId}`);
            const data = await res.json();
            if (silent && JSON.stringify(data.messages) === JSON.stringify(messages)) return;
            setMessages(data.messages || []);
        } catch (e) {
            console.error(e);
        }
    };

    const sendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !activeFriend) return;

        const content = newMessage;
        setNewMessage('');
        setShowEmojiPicker(false);

        await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientId: activeFriend.friendId, content, type: 'text' })
        });
        fetchMessages(activeFriend.friendId);
    };

    const handleEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    // News Bubble Component
    const NewsBubble = ({ title, summary, url, source, image }) => (
        <div className={styles.newsBubble} onClick={() => window.open(url, '_blank')}>
            <div className={styles.newsImage}>
                {image ? <img src={image} alt="News" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ExternalLink size={32} />}
            </div>
            <div className={styles.newsContent}>
                <div className={styles.newsTitle}>{title}</div>
                <div className={styles.newsSource}>{source || 'News Source'}</div>
            </div>
        </div>
    );

    return (
        <div
            className={styles.container}
            ref={containerRef}
            style={{
                gridTemplateColumns: `220px 1fr 10px ${rightColumnWidth}px`
            }}
        >
            <div className={styles.navWrapper}>
                <Navigation />
            </div>

            {/* Center: Main Chat Area */}
            <div className={styles.chatArea}>
                {activeFriend ? (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.avatar} style={{ width: 44, height: 44, fontSize: '1.2rem' }}>{activeFriend.name[0]}</div>
                            <span>{activeFriend.name}</span>
                        </div>

                        <div className={styles.messages}>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`${styles.message} ${msg.sender === activeFriend.friendId ? '' : styles.sent}`}
                                >
                                    {msg.type === 'news' ? (
                                        <NewsBubble {...msg.metadata} />
                                    ) : (
                                        <div className={styles.msgContent}>
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className={styles.inputArea}>
                            <div className={styles.inputWrapper}>
                                <button className={styles.iconBtn} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                                    <Smile size={20} />
                                </button>
                                <button className={styles.iconBtn}>
                                    <ImageIcon size={20} />
                                </button>
                                <form onSubmit={sendMessage} style={{ flex: 1, display: 'flex' }}>
                                    <input
                                        className={styles.chatInput}
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onFocus={() => setShowEmojiPicker(false)}
                                    />
                                    <button type="submit" className={styles.iconBtn} style={{ color: 'var(--accent)' }}>
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                            {showEmojiPicker && (
                                <div style={{ position: 'absolute', bottom: '80px', left: '20px', zIndex: 50 }}>
                                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={300} height={400} />
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '50%', marginBottom: '20px' }}>
                            <MessageSquare size={64} style={{ color: 'var(--accent)' }} />
                        </div>
                        <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Select a conversation</h2>
                        <p style={{ color: '#888' }}>Choose a friend from the right sidebar to start chatting.</p>
                    </div>
                )}
            </div>

            {/* Resizer Handle */}
            <div
                className={styles.resizer}
                onMouseDown={startResizing}
                style={{ cursor: 'col-resize', width: '10px', background: 'transparent', zIndex: 100 }}
            />

            {/* Right Sidebar: Friends List */}
            <div className={styles.friendsList}>
                <div className={styles.header}>
                    <span>Chats</span>
                    <button className={styles.addBtn} onClick={() => setActiveFriend(null)} title="Add Friend">
                        <UserPlus size={18} />
                    </button>
                </div>

                <div className={styles.searchBox}>
                    <div style={{ position: 'relative' }}>
                        <input
                            className={styles.searchInput}
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => searchUsers(e.target.value)}
                        />
                        <Search size={16} className={styles.searchIcon} style={{ position: 'absolute', right: '12px', top: '12px', color: '#666' }} />
                    </div>
                </div>

                <div className={styles.list}>
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <>
                            <div className={styles.sectionTitle}>Found Users</div>
                            {searchResults.map(user => (
                                <div key={user._id} className={styles.listItem}>
                                    <div className={styles.avatar}>{user.name[0]}</div>
                                    <div className={styles.name}>{user.name}</div>
                                    <button className={styles.addBtn} onClick={() => sendRequest(user._id)} style={{ marginLeft: 'auto', width: 'auto', padding: '0 10px', borderRadius: '12px', fontSize: '0.8rem' }}>Add</button>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Pending Requests */}
                    {pendingReceived.length > 0 && (
                        <>
                            <div className={styles.sectionTitle}>Requests</div>
                            {pendingReceived.map(p => (
                                <div key={p.requestId} className={styles.listItem}>
                                    <div className={styles.avatar}>{p.name[0]}</div>
                                    <div className={styles.name}>{p.name}</div>
                                    <button className={styles.addBtn} onClick={() => acceptRequest(p.requestId)} style={{ marginLeft: 'auto', width: 'auto', padding: '0 10px', borderRadius: '12px', fontSize: '0.8rem', background: '#4caf50' }}>Accept</button>
                                </div>
                            ))}
                        </>
                    )}

                    {/* Friends */}
                    <div className={styles.sectionTitle}>Direct Messages</div>
                    {friends.map(f => (
                        <div
                            key={f.friendId}
                            className={`${styles.listItem} ${activeFriend?.friendId === f.friendId ? styles.active : ''}`}
                            onClick={() => setActiveFriend(f)}
                        >
                            <div className={styles.avatar}>{f.name[0]}</div>
                            <div className={styles.name}>{f.name}</div>
                        </div>
                    ))}

                    {friends.length === 0 && pendingReceived.length === 0 && searchResults.length === 0 && (
                        <div style={{ padding: '40px 20px', color: '#666', textAlign: 'center', fontSize: '0.9rem' }}>
                            <Users size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                            <br />
                            Find friends to start chatting!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
