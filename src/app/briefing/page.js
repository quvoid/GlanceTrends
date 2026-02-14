'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import feedStyles from '@/components/Feed.module.css';
import { ScrollText, ChevronDown, ChevronUp, ExternalLink, Clock, Sparkles, Coffee, Moon as MoonIcon, RefreshCw } from 'lucide-react';

const CATEGORY_COLORS = {
    'Tech': '#29b6f6',
    'Politics': '#ef5350',
    'Science': '#66bb6a',
    'Crypto': '#ffa726',
    'Sports': '#ab47bc',
    'Business': '#42a5f5',
    'Entertainment': '#ec407a',
};

export default function BriefingPage() {
    const [briefings, setBriefings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [error, setError] = useState(null);

    const fetchBriefings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/briefing');
            if (res.ok) {
                const data = await res.json();
                // Combine latest + history
                const all = [data.latest, ...data.history].filter(Boolean);
                // Deduplicate by timeSlot just in case
                const unique = Array.from(new Map(all.map(item => [item.timeSlot, item])).values());

                setBriefings(unique);
                if (unique.length > 0) setExpandedId(unique[0]._id);
            } else {
                setError('Failed to load briefings.');
            }
        } catch (e) {
            console.error(e);
            setError('Error connecting to server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBriefings();
    }, []);

    const toggle = (id) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    const latestBriefing = briefings[0];
    const totalStories = briefings.reduce((sum, b) => sum + (b.stories?.length || 0), 0);

    return (
        <div className={feedStyles.layout}>
            <div className={feedStyles.sidebarCol}>
                <Sidebar />
            </div>

            <div className={feedStyles.feedCol}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ScrollText size={28} style={{ color: 'var(--accent)' }} />
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Briefing</h1>
                    </div>
                    {loading && <RefreshCw size={18} className="spin" style={{ color: 'var(--text-secondary)' }} />}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                    Your AI-curated digest. No noise, just signal.
                </p>

                {/* Error Message */}
                {error && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#ef5350', border: '1px solid #ef5350', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                        <button onClick={fetchBriefings} style={{ display: 'block', margin: '10px auto', padding: '6px 12px' }}>Retry</button>
                    </div>
                )}

                {/* Loading State */}
                {loading && briefings.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <Sparkles size={32} style={{ marginBottom: '16px', color: 'var(--accent)' }} />
                        <p>Curating your daily briefing...</p>
                        <p style={{ fontSize: '0.8rem' }}>Scanning top trends, scraping news, and summarizing.</p>
                    </div>
                )}

                {/* Briefing Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {briefings.map(briefing => {
                        const id = briefing._id || briefing.timeSlot;
                        const isExpanded = expandedId === id;
                        const TypeIcon = briefing.type === 'morning' ? Coffee : MoonIcon;

                        return (
                            <div key={id} style={{
                                border: `1px solid ${isExpanded ? 'var(--accent)' : 'var(--border)'}`,
                                borderRadius: '14px',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                background: isExpanded ? 'rgba(29, 155, 240, 0.03)' : 'transparent'
                            }}>
                                {/* Briefing Header (clickable) */}
                                <div
                                    onClick={() => toggle(id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '18px 20px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            background: briefing.type === 'morning'
                                                ? 'linear-gradient(135deg, #ffa726, #ff7043)'
                                                : 'linear-gradient(135deg, #5c6bc0, #7c4dff)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <TypeIcon size={20} style={{ color: 'white' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '1rem' }}>{briefing.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                <Clock size={12} />
                                                {briefing.date} · {briefing.stories?.length || 0} stories
                                            </div>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp size={20} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-secondary)' }} />}
                                </div>

                                {/* Expanded Stories */}
                                {isExpanded && (
                                    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {/* Theme Summary */}
                                        {briefing.theme && (
                                            <div style={{
                                                padding: '12px 16px',
                                                borderRadius: '8px',
                                                background: 'rgba(29, 155, 240, 0.1)',
                                                borderLeft: '3px solid var(--accent)',
                                                fontStyle: 'italic',
                                                color: 'var(--foreground)',
                                                fontSize: '0.9rem',
                                                marginBottom: '6px'
                                            }}>
                                                "{briefing.theme}"
                                            </div>
                                        )}

                                        {briefing.stories?.map((story, si) => (
                                            <div key={si} style={{
                                                padding: '16px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.02)',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                                onClick={() => window.open(story.url, '_blank')}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                                    <span style={{
                                                        fontSize: '0.7rem',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        background: `${CATEGORY_COLORS[story.category] || '#888'}18`,
                                                        color: CATEGORY_COLORS[story.category] || '#888',
                                                        fontWeight: '600'
                                                    }}>{story.category}</span>
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{story.source}</span>
                                                </div>
                                                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '6px', lineHeight: '1.4' }}>{story.headline}</h3>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{story.summary}</p>
                                                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--accent)' }}>
                                                    <ExternalLink size={13} />
                                                    Read full article
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: Info */}
            <div className={feedStyles.panelCol}>
                <div style={{ padding: '24px 16px', position: 'sticky', top: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>AI Summary</h3>
                    </div>

                    <div style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(29, 155, 240, 0.06)',
                        border: '1px solid rgba(29, 155, 240, 0.15)',
                        marginBottom: '20px'
                    }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
                            <strong style={{ color: 'var(--foreground)' }}>Today's Theme:</strong> {latestBriefing?.theme || "Generating insights from global trends..."}
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { label: 'Total Stories', value: totalStories.toString(), icon: ScrollText, color: 'var(--accent)' },
                            { label: 'Briefings', value: briefings.length.toString(), icon: Coffee, color: '#ffa726' },
                        ].map((stat, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.02)'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: `${stat.color}18`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <stat.icon size={16} style={{ color: stat.color }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '10px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>About Briefing</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Briefing delivers AI-curated news digests twice daily — a morning catch-up and an evening wrap. No noise, just the stories that matter.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}
