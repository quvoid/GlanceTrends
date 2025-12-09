import { Home, Search, Bell, Mail, Compass, Users, User, MoreHorizontal, PenSquare } from 'lucide-react';
import styles from './Navigation.module.css';

export default function Navigation() {
    const navItems = [
        { icon: Home, label: 'Home', active: true },
        { icon: Search, label: 'Search' },
        { icon: Bell, label: 'Notifications', badge: 1 },
        { icon: Mail, label: 'Messages' },
        { icon: Compass, label: 'Explore' },
        { icon: Users, label: 'Communities' },
        { icon: User, label: 'Profile' },
        { icon: MoreHorizontal, label: 'More' },
    ];

    return (
        <nav className={styles.nav}>
            <ul className={styles.navList}>
                {navItems.map((item, index) => (
                    <li key={index} className={`${styles.navItem} ${item.active ? styles.active : ''}`}>
                        <item.icon className={styles.icon} size={28} strokeWidth={2.5} />
                        {item.badge && <span className={styles.badge}>{item.badge}</span>}
                    </li>
                ))}
            </ul>

            <button className={styles.createBtn}>
                <PenSquare size={24} />
            </button>

            <div className={styles.profile}>
                <div className={styles.avatar} />
            </div>
        </nav>
    );
}
