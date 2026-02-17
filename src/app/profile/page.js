'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import feedStyles from '@/components/Feed.module.css';
import { useUser } from '@/context/UserContext';
import { Camera, Save, Lock, User as UserIcon, Mail, Calendar, Award, Heart, FileText, LogOut } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, updateUser, loading } = useUser();
    const { addToast } = useToast();
    const router = useRouter();

    const [name, setName] = useState('');
    const [handle, setHandle] = useState('');
    const [bio, setBio] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('general'); // 'general' | 'security'

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user) {
            setName(user.name || '');
            setHandle(user.handle || '');
            setBio(user.bio || '');
        }
    }, [user, loading, router]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (password && password !== confirmPassword) {
            addToast('Passwords do not match!', 'error');
            return;
        }

        setIsSaving(true);
        const updates = { name, handle, bio };
        if (password) updates.password = password;

        const result = await updateUser(updates);

        if (result.success) {
            addToast('Profile updated successfully!', 'success');
            setPassword('');
            setConfirmPassword('');
        } else {
            addToast(result.error || 'Failed to update profile', 'error');
        }
        setIsSaving(false);
    };

    if (loading) {
        return (
            <div className={feedStyles.layout}>
                <div className={feedStyles.sidebarCol}>
                    <Sidebar />
                </div>
                <div className={feedStyles.feedCol} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Loading profile...</div>
                </div>
                <div className={feedStyles.panelCol}></div>
            </div>
        );
    }

    if (!user) return null;

    const userInitial = user.name ? user.name[0].toUpperCase() : 'U';

    return (
        <div className={feedStyles.layout}>
            {/* Left Column: Sidebar (consistent) */}
            <div className={feedStyles.sidebarCol}>
                <Sidebar />
            </div>

            {/* Middle Column: Profile Content */}
            <div className={feedStyles.feedCol}>
                {/* Profile Header / Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                    borderRadius: '16px',
                    padding: '40px 30px 30px',
                    marginBottom: '24px',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                        <div style={{
                            width: '90px',
                            height: '90px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: 'white',
                            border: '3px solid rgba(255,255,255,0.4)',
                            position: 'relative',
                            flexShrink: 0
                        }}>
                            {userInitial}
                            <button style={{
                                position: 'absolute',
                                bottom: '-2px',
                                right: '-2px',
                                background: 'white',
                                color: '#333',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}>
                                <Camera size={14} />
                            </button>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'white', marginBottom: '2px' }}>{user.name}</h1>
                            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{user.handle}</p>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginTop: '2px' }}>{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Section Tabs */}
                <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
                    {[
                        { id: 'general', label: 'General', icon: UserIcon },
                        { id: 'security', label: 'Security', icon: Lock }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: activeSection === tab.id ? 'var(--foreground)' : 'var(--text-secondary)',
                                fontWeight: activeSection === tab.id ? '600' : '400',
                                padding: '12px 20px',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                borderBottom: activeSection === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSave}>
                    {activeSection === 'general' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'var(--foreground)',
                                        fontSize: '0.95rem',
                                        transition: 'border-color 0.2s',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Display Handle</label>
                                <input
                                    type="text"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'var(--foreground)',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Bio</label>
                                <textarea
                                    rows={3}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'var(--foreground)',
                                        fontSize: '0.95rem',
                                        resize: 'none',
                                        outline: 'none',
                                        lineHeight: '1.5'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                style={{
                                    marginTop: '8px',
                                    background: isSaving ? '#555' : 'var(--accent)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    fontSize: '0.95rem',
                                    width: 'fit-content'
                                }}
                            >
                                {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                            </button>
                        </div>
                    )}

                    {activeSection === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>New Password</label>
                                <input
                                    type="password"
                                    placeholder="Min 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'var(--foreground)',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="Repeat password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: 'var(--foreground)',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                style={{
                                    marginTop: '8px',
                                    background: isSaving ? '#555' : 'var(--accent)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: isSaving ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s',
                                    fontSize: '0.95rem',
                                    width: 'fit-content'
                                }}
                            >
                                {isSaving ? 'Saving...' : <><Lock size={16} /> Update Password</>}
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {/* Right Column: Profile Stats */}
            <div className={feedStyles.panelCol}>
                <div style={{ padding: '24px 16px', position: 'sticky', top: 0 }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '700' }}>Profile Stats</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { icon: FileText, label: 'Reports Filed', value: '0', color: '#667eea' },
                            { icon: Heart, label: 'Total Likes', value: '0', color: '#ff6b6b' },
                            { icon: Calendar, label: 'Joined', value: new Date(user.createdAt || Date.now()).toLocaleDateString(), color: '#4ecdc4' }
                        ].map((stat, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border)',
                                transition: 'background 0.2s'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: `${stat.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <stat.icon size={18} style={{ color: stat.color }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Quick Actions</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                background: 'none',
                                border: '1px solid var(--border)',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                width: '100%',
                                textAlign: 'left'
                            }}>
                                <Award size={16} />
                                View Achievements
                            </button>
                            <button
                                onClick={async () => {
                                    await fetch('/api/auth/logout', { method: 'POST' });
                                    router.push('/login');
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 14px',
                                    borderRadius: '10px',
                                    background: 'none',
                                    border: '1px solid rgba(255,59,48,0.3)',
                                    color: '#ff3b30',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    transition: 'all 0.2s',
                                    width: '100%',
                                    textAlign: 'left'
                                }}
                            >
                                <LogOut size={16} />
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
