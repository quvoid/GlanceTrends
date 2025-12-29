'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import styles from './friends.module.css';
import { MessageSquare, UserPlus, Users, Search } from 'lucide-react';

export default function FriendsPage() {
    const [friends, setFriends] = useState([]);
    const [pendingSent, setPendingSent] = useState([]);
    const [pendingReceived, setPendingReceived] = useState([]);
    const [activeFriend, setActiveFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const messagesEndRef = useRef(null);

    // Polling refs
    const intervalRef = useRef(null);

    // Initial Load
    useEffect(() => {
        fetchFriends();
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
            // Simple check to avoid re-renders if no change (could be optimized)
            if (silent && JSON.stringify(data.messages) === JSON.stringify(messages)) return;
            setMessages(data.messages || []);
        } catch (e) {
            console.error(e);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeFriend) return;

        const tempMsg = {
            content: newMessage,
            sender: 'me', // Optimistic ID
            createdAt: new Date()
        };
        // setMessages(prev => [...prev, tempMsg]); // Optimistic update
        const content = newMessage;
        setNewMessage('');

        await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientId: activeFriend.friendId, content })
        });
        fetchMessages(activeFriend.friendId);
    };

    return (
        <div className={styles.container}>
            <div className={styles.navWrapper}>
                <Navigation />
            </div>

            {/* Sidebar: Friends List */}
            <div className={styles.friendsList}>
                <div className={styles.header}>
                    <span>Friends</span>
                    <button className={styles.addBtn} onClick={() => setActiveFriend(null)}>
                        <UserPlus size={18} />
                    </button>
                </div>

                <div className={styles.searchBox}>
                    <input
                        className={styles.searchInput}
                        placeholder="Search users to add..."
                        value={searchQuery}
                        onChange={(e) => searchUsers(e.target.value)}
                    />
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
                                    <button className={styles.addBtn} onClick={() => sendRequest(user._id)}>Add</button>
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
                                    <button className={styles.acceptBtn} onClick={() => acceptRequest(p.requestId)}>Accept</button>
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
                        <div style={{ padding: '20px', color: '#777', textAlign: 'center' }}>
                            No friends yet. Search for someone!
                        </div>
                    )}
                </div>
            </div>

            {/* Main: Chat Area */}
            <div className={styles.chatArea}>
                {activeFriend ? (
                    <>
                        <div className={styles.chatHeader}>
                            <div className={styles.avatar}>{activeFriend.name[0]}</div>
                            <span>{activeFriend.name}</span>
                        </div>

                        <div className={styles.messages}>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`${styles.message} ${msg.sender === activeFriend.friendId ? '' : styles.sent}`}
                                >
                                    <div className={styles.msgContent}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className={styles.inputArea}>
                            <form onSubmit={sendMessage}>
                                <input
                                    className={styles.chatInput}
                                    placeholder={`Message @${activeFriend.name}`}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                            </form>
                        </div>
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <Users size={64} opacity={0.5} />
                        <h2>Select a friend to chat</h2>
                        <p>Or use the + button to add new friends</p>
                    </div>
                )}
            </div>
        </div>
    );
}
