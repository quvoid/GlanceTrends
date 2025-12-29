'use client';

import styles from './Background.module.css';

export default function Background() {
    return (
        <div className={styles.background}>
            <div className={styles.blob + ' ' + styles.blob1}></div>
            <div className={styles.blob + ' ' + styles.blob2}></div>
            <div className={styles.blob + ' ' + styles.blob3}></div>
            <div className={styles.grid}></div>
        </div>
    );
}
