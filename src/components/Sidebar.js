'use client';
import { Home, Search, Bell, Mail, Compass, Users, User, MoreHorizontal, PenSquare, Moon, Sun } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme() || {};
    const { user, loading } = useUser();
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await fetch('/api/messages/unread');
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.count || 0);
                }
            } catch (e) {
                // silent
            }
        };
        if (user) fetchUnread();
        const interval = setInterval(fetchUnread, 10000);
        return () => clearInterval(interval);
    }, [user]);

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: Bell, label: 'Notifications' },
        { icon: Mail, label: 'Messages', badge: unreadCount > 0 ? unreadCount : null },
        { icon: Compass, label: 'Explore', href: '/explore' },
        { icon: Users, label: 'Friends', href: '/friends' },
        { icon: User, label: 'Profile', href: '/profile' },
        { icon: MoreHorizontal, label: 'More' },
    ];

    const userInitial = user?.name ? user.name[0].toUpperCase() : '?';

    return (
        <aside className={styles.sidebar}>
            {/* Branding */}
            <Link href="/" className={styles.brand}>
                <span className={styles.brandText}>Sekilas Glance</span>
            </Link>

            {/* Navigation Links */}
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {navItems.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={index} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                                {item.href ? (
                                    <Link href={item.href} className={styles.link}>
                                        <item.icon className={styles.icon} size={22} strokeWidth={2} />
                                        <span className={styles.label}>{item.label}</span>
                                    </Link>
                                ) : (
                                    <div className={styles.link}>
                                        <item.icon className={styles.icon} size={22} strokeWidth={2} />
                                        <span className={styles.label}>{item.label}</span>
                                    </div>
                                )}
                                {item.badge && <span className={styles.badge}>{item.badge}</span>}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom Actions */}
            <div className={styles.bottomActions}>
                <button className={styles.actionBtn} onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <button className={styles.actionBtn} title="Create Post">
                    <PenSquare size={20} />
                </button>

                <Link href="/profile" className={styles.profileLink}>
                    <div className={styles.avatar}>
                        {loading ? '...' : userInitial}
                    </div>
                </Link>
            </div>
        </aside>
    );
}
