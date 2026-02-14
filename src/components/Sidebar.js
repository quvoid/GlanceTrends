'use client';
import { Home, Search, Activity, ScrollText, Compass, Users, User, PenSquare, Moon, Sun } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const { theme, toggleTheme } = useTheme() || {};
    const { user, loading } = useUser();
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: Activity, label: 'Radar', href: '/radar' },
        { icon: ScrollText, label: 'Briefing', href: '/briefing' },
        { icon: Compass, label: 'Explore', href: '/explore' },
        { icon: Users, label: 'Friends', href: '/friends' },
        { icon: User, label: 'Profile', href: '/profile' },
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
