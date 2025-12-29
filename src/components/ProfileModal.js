'use client';
import styles from './ProfileModal.module.css';
import { X, MapPin, Calendar, Link as LinkIcon, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileModal({ user, onClose }) {
    if (!user) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <motion.div
                className={styles.modal}
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <div className={styles.banner}>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className={styles.avatar}>
                            {user.avatar || user.name[0]}
                        </div>
                        <button className={styles.followBtn}>Follow</button>
                    </div>

                    <div className={styles.info}>
                        <h2 className={styles.name}>
                            {user.name}
                            {user.verified && <span className={styles.verifiedBadge}><Check size={12} strokeWidth={4} /></span>}
                        </h2>
                        <div className={styles.handle}>{user.handle}</div>
                    </div>

                    <p className={styles.bio}>{user.bio || "Just another news junkie on Sekilas."}</p>

                    <div className={styles.meta}>
                        <div className={styles.metaItem}>
                            <MapPin size={14} />
                            <span>{user.location || "Global"}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <Calendar size={14} />
                            <span>Joined {user.joined || "December 2025"}</span>
                        </div>
                    </div>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <strong>{user.following || '142'}</strong> <span>Following</span>
                        </div>
                        <div className={styles.stat}>
                            <strong>{user.followers || '1.2K'}</strong> <span>Followers</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
