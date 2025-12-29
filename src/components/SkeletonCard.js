import styles from './SkeletonCard.module.css';

export default function SkeletonCard() {
    return (
        <div className={styles.card}>
            <div className={styles.meta}>
                <div className={styles.source}></div>
                <div className={styles.dot}></div>
                <div className={styles.keyword}></div>
            </div>
            <div className={styles.title}></div>
            <div className={styles.title} style={{ width: '80%' }}></div>
            <div className={styles.summary}></div>
            <div className={styles.summary}></div>
            <div className={styles.summary} style={{ width: '60%' }}></div>
            <div className={styles.actions}>
                <div className={styles.btn}></div>
                <div className={styles.btn}></div>
            </div>
        </div>
    );
}
