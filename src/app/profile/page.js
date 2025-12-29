'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import styles from '@/components/Feed.module.css'; // Reuse layout styles
import { useUser } from '@/context/UserContext';
import { Camera, Save, Lock, User } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
    const { user, updateUser } = useUser();
    const { addToast } = useToast();

    // Local state for form
    const [name, setName] = useState(user.name);
    const [handle, setHandle] = useState(user.handle);
    const [bio, setBio] = useState(user.bio);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSave = (e) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            addToast('Passwords do not match!', 'error');
            return;
        }

        updateUser({ name, handle, bio });
        addToast('Profile updated successfully!', 'success');

        if (password) {
            // Mock password change
            setPassword('');
            setConfirmPassword('');
            addToast('Password changed!', 'success');
        }
    };

    return (
        <div className={styles.layout}>
            <div className={styles.navContainer}>
                <Navigation />
            </div>

            <div className={styles.main}>
                <div className={styles.controls} style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>My Profile</h1>
                </div>

                <div style={{
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '30px',
                    backdropFilter: 'blur(10px)',
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: '10px',
                            position: 'relative'
                        }}>
                            {user.avatar}
                            <button style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                background: 'white',
                                color: 'black',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}>
                                <Camera size={16} />
                            </button>
                        </div>
                        <h2 style={{ fontSize: '1.4rem' }}>{user.name}</h2>
                        <span style={{ color: 'var(--text-secondary)' }}>{user.handle}</span>
                    </div>

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: '#888' }} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 10px 10px 40px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Display Handle</label>
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Bio</label>
                            <textarea
                                rows={3}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    resize: 'none'
                                }}
                            />
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '10px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Lock size={18} /> Security
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>New Password</label>
                                    <input
                                        type="password"
                                        placeholder="Min 6 chars"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="Repeat password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'white'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                marginTop: '10px',
                                background: 'var(--accent)',
                                color: 'white',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            <Save size={18} />
                            Save Changes
                        </button>
                    </form>
                </div>
            </div>

            <aside className={styles.sidebar}>
                {/* Simplified sidebar for profile page */}
                <div className={styles.trendingContainer}>
                    <h3 style={{ padding: '0 10px' }}>Profile Stats</h3>
                    <div style={{ padding: '10px', color: '#ccc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Reports Filed</span>
                            <strong>12</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Total Likes</span>
                            <strong>1.4K</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Days Active</span>
                            <strong>45</strong>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
