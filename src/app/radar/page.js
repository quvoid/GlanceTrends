'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import feedStyles from '@/components/Feed.module.css';
import { Activity, TrendingUp, TrendingDown, Zap, Clock, Hash, ArrowUpRight } from 'lucide-react';

// Simulated real-time data
const MOCK_SIGNALS = [
    { keyword: '#PulwamaAttack', volume: '47K', change: +340, source: 'Twitter', category: 'Politics' },
    { keyword: '#ValentinesDay', volume: '40K', change: +120, source: 'Twitter', category: 'Lifestyle' },
    { keyword: 'AI Models', volume: '33K', change: +89, source: 'Reddit', category: 'Tech' },
    { keyword: '#Bitcoin', volume: '28K', change: -12, source: 'Twitter', category: 'Crypto' },
    { keyword: 'ISRO Launch', volume: '22K', change: +210, source: 'Twitter', category: 'Science' },
    { keyword: '#Budget2026', volume: '19K', change: +55, source: 'Twitter', category: 'Politics' },
    { keyword: 'OpenAI GPT-5', volume: '15K', change: +430, source: 'Reddit', category: 'Tech' },
    { keyword: '#CricketWorldCup', volume: '14K', change: +67, source: 'Twitter', category: 'Sports' },
    { keyword: 'Quantum Computing', volume: '11K', change: +23, source: 'Reddit', category: 'Science' },
    { keyword: '#StockMarket', volume: '9K', change: -8, source: 'Twitter', category: 'Business' },
    { keyword: 'Netflix New Series', volume: '8K', change: +145, source: 'Reddit', category: 'Entertainment' },
    { keyword: '#ClimateAction', volume: '7K', change: +34, source: 'Twitter', category: 'Science' },
];

const CATEGORY_COLORS = {
    'Tech': '#29b6f6',
    'Politics': '#ef5350',
    'Science': '#66bb6a',
    'Crypto': '#ffa726',
    'Sports': '#ab47bc',
    'Business': '#42a5f5',
    'Entertainment': '#ec407a',
    'Lifestyle': '#ff7043',
};

export default function RadarPage() {
    const [signals, setSignals] = useState(MOCK_SIGNALS);
    const [liveTime, setLiveTime] = useState(new Date());
    const [selectedFilter, setSelectedFilter] = useState('All');
    const tickerRef = useRef(null);

    // Simulate live clock
    useEffect(() => {
        const timer = setInterval(() => setLiveTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulate random volume fluctuations
    useEffect(() => {
        const fluctuate = setInterval(() => {
            setSignals(prev => prev.map(s => ({
                ...s,
                change: s.change + Math.floor(Math.random() * 20 - 8),
            })));
        }, 3000);
        return () => clearInterval(fluctuate);
    }, []);

    const filters = ['All', 'Tech', 'Politics', 'Science', 'Crypto', 'Sports'];
    const filteredSignals = selectedFilter === 'All'
        ? signals
        : signals.filter(s => s.category === selectedFilter);

    // Top 3 spiking
    const spiking = [...signals].sort((a, b) => b.change - a.change).slice(0, 3);

    return (
        <div className={feedStyles.layout}>
            <div className={feedStyles.sidebarCol}>
                <Sidebar />
            </div>

            <div className={feedStyles.feedCol}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Activity size={28} style={{ color: '#00e676' }} />
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Radar</h1>
                        <span style={{
                            background: '#00e676',
                            color: '#000',
                            padding: '2px 10px',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            letterSpacing: '1px',
                            animation: 'pulse 2s infinite'
                        }}>LIVE</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                        <Clock size={14} />
                        {liveTime.toLocaleTimeString()}
                    </div>
                </div>

                {/* Scrolling Ticker Bar */}
                <div style={{
                    background: 'rgba(0, 230, 118, 0.06)',
                    border: '1px solid rgba(0, 230, 118, 0.15)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    marginBottom: '24px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}>
                    <div ref={tickerRef} style={{
                        display: 'inline-block',
                        animation: 'ticker 30s linear infinite',
                        fontSize: '0.85rem',
                        fontFamily: 'monospace',
                        color: '#00e676'
                    }}>
                        {signals.map((s, i) => (
                            <span key={i} style={{ marginRight: '32px' }}>
                                <span style={{ fontWeight: '700' }}>{s.keyword}</span>
                                <span style={{ color: s.change >= 0 ? '#00e676' : '#ef5350', marginLeft: '6px' }}>
                                    {s.change >= 0 ? '▲' : '▼'}{Math.abs(s.change)}%
                                </span>
                                <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>{s.volume}</span>
                            </span>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {signals.map((s, i) => (
                            <span key={`dup-${i}`} style={{ marginRight: '32px' }}>
                                <span style={{ fontWeight: '700' }}>{s.keyword}</span>
                                <span style={{ color: s.change >= 0 ? '#00e676' : '#ef5350', marginLeft: '6px' }}>
                                    {s.change >= 0 ? '▲' : '▼'}{Math.abs(s.change)}%
                                </span>
                                <span style={{ color: 'var(--text-secondary)', marginLeft: '6px' }}>{s.volume}</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Category Filters */}
                <div className={feedStyles.categories} style={{ marginBottom: '24px' }}>
                    {filters.map(f => (
                        <button
                            key={f}
                            className={`${feedStyles.categoryBtn} ${selectedFilter === f ? feedStyles.activeCategory : ''}`}
                            onClick={() => setSelectedFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Signal Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {/* Table Header */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1fr 80px 90px 80px',
                        padding: '10px 16px',
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        color: 'var(--text-secondary)',
                        fontWeight: '600',
                        letterSpacing: '0.8px',
                        borderBottom: '1px solid var(--border)'
                    }}>
                        <span>#</span>
                        <span>Keyword</span>
                        <span>Volume</span>
                        <span>Change</span>
                        <span>Source</span>
                    </div>

                    {/* Table Rows */}
                    {filteredSignals.map((signal, i) => (
                        <div key={i} style={{
                            display: 'grid',
                            gridTemplateColumns: '40px 1fr 80px 90px 80px',
                            padding: '14px 16px',
                            alignItems: 'center',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            borderRadius: '8px'
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{i + 1}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Hash size={14} style={{ color: CATEGORY_COLORS[signal.category] || '#888' }} />
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{signal.keyword}</div>
                                    <div style={{ fontSize: '0.75rem', color: CATEGORY_COLORS[signal.category] || 'var(--text-secondary)' }}>{signal.category}</div>
                                </div>
                            </div>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{signal.volume}</span>
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontFamily: 'monospace',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: signal.change >= 0 ? '#00e676' : '#ef5350'
                            }}>
                                {signal.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {signal.change >= 0 ? '+' : ''}{signal.change}%
                            </span>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '3px 8px',
                                borderRadius: '8px',
                                background: signal.source === 'Twitter' ? 'rgba(29,161,242,0.12)' : 'rgba(255,69,0,0.12)',
                                color: signal.source === 'Twitter' ? '#1da1f2' : '#ff4500',
                                fontWeight: '600',
                                textAlign: 'center'
                            }}>
                                {signal.source}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Spiking Now */}
            <div className={feedStyles.panelCol}>
                <div style={{ padding: '24px 16px', position: 'sticky', top: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <Zap size={18} style={{ color: '#ffa726' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Spiking Now</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {spiking.map((s, i) => (
                            <div key={i} style={{
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(255, 167, 38, 0.06)',
                                border: '1px solid rgba(255, 167, 38, 0.15)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{s.keyword}</span>
                                    <ArrowUpRight size={16} style={{ color: '#00e676' }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.volume} posts</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#00e676', fontFamily: 'monospace' }}>
                                        +{s.change}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ marginBottom: '12px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>About Radar</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            Radar tracks real-time keyword velocity across Twitter and Reddit. Spikes indicate sudden surges in discussion volume.
                        </p>
                    </div>
                </div>
            </div>

            {/* Global CSS for animations */}
            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
