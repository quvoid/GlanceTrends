import { Share2, MessageCircle, Heart, User } from 'lucide-react';
import styles from './FlashCard.module.css';

export default function FlashCard({ item }) {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.author}>
                    <div className={styles.avatar}>
                        {item.author?.avatar || <User size={16} />}
                    </div>
                    <div className={styles.authorInfo}>
                        <span className={styles.name}>{item.author?.name || 'Anonymous'}</span>
                        <span className={styles.handle}>{item.author?.handle}</span>
                    </div>
                    {item.author?.verified && <span className={styles.verified}>Verified Reporter</span>}
                </div>
                <div className={styles.timestamp}>2h ago</div>
            </div>

            <div className={styles.content}>
                <div className={styles.keyword}>#{item.keyword}</div>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.body}>{item.summary}</p>
            </div>

            <div className={styles.footer}>
                <button className={styles.actionBtn}><Heart size={18} /> {item.likes || 0}</button>
                <button className={styles.actionBtn}><MessageCircle size={18} /> {item.comments || 0}</button>
                <button className={styles.actionBtn}><Share2 size={18} /></button>
            </div>
        </div>
    );
}
