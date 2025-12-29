import { Home, Search, Bell, Mail, Compass, Users, User, MoreHorizontal, PenSquare, Moon, Sun } from 'lucide-react';
import styles from './Navigation.module.css';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
    const { theme, toggleTheme } = useTheme() || {};
    const [unreadCount, setUnreadCount] = useState(0);
    const pathname = usePathname();

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const res = await fetch('/api/messages/unread');
                const data = await res.json();
                setUnreadCount(data.count || 0);
            } catch (e) {
                console.error(e);
            }
        };

        fetchUnread();
        const interval = setInterval(fetchUnread, 10000);
        return () => clearInterval(interval);
    }, []);

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: Bell, label: 'Notifications' },
        { icon: Mail, label: 'Messages', badge: unreadCount > 0 ? unreadCount : null },
        { icon: Compass, label: 'Explore' },
        { icon: Users, label: 'Friends', href: '/friends' },
        { icon: User, label: 'Profile' },
        { icon: MoreHorizontal, label: 'More' },
    ];

    return (
        <nav className={styles.nav}>
            <ul className={styles.navList}>
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                        <li key={index} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
                            {item.href ? (
                                <Link href={item.href} style={{ color: 'inherit', display: 'block' }}>
                                    <item.icon className={styles.icon} size={28} strokeWidth={2.5} />
                                </Link>
                            ) : (
                                <item.icon className={styles.icon} size={28} strokeWidth={2.5} />
                            )}
                            {item.badge && <span className={styles.badge}>{item.badge}</span>}
                        </li>
                    );
                })}
            </ul>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button className={styles.createBtn} onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
                </button>

                <button className={styles.createBtn}>
                    <PenSquare size={24} />
                </button>
            </div>

            <div className={styles.profile}>
                <div className={styles.avatar} />
            </div>
        </nav>
    );
}
