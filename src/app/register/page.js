'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                router.push('/login');
            } else {
                const data = await res.json();
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.backgroundGlow} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={styles.card}
            >
                <div style={styles.header}>
                    <h1 style={styles.title}>Join the Grid</h1>
                    <p style={styles.subtitle}>Create your identity to start exploring.</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={styles.error}
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input
                            type="text"
                            placeholder="Display Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        style={styles.button}
                    >
                        {isLoading ? 'Initializing...' : 'Register'}
                    </motion.button>
                </form>

                <p style={styles.footer}>
                    Already have an ID? <Link href="/login" style={styles.link}>Login</Link>
                </p>
            </motion.div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
    },
    backgroundGlow: {
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(0, 149, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#fff',
        marginBottom: '10px',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        color: '#888',
        fontSize: '0.95rem',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        position: 'relative',
    },
    input: {
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid #333',
        borderRadius: '12px',
        color: '#fff',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s',
    },
    button: {
        width: '100%',
        padding: '14px',
        background: '#fff',
        color: '#000',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '10px',
        transition: 'background 0.2s',
    },
    error: {
        background: 'rgba(255, 59, 48, 0.1)',
        color: '#ff3b30',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '0.9rem',
        textAlign: 'center',
    },
    footer: {
        marginTop: '30px',
        textAlign: 'center',
        color: '#666',
        fontSize: '0.9rem',
    },
    link: {
        color: '#fff',
        textDecoration: 'none',
        fontWeight: '500',
        marginLeft: '5px',
    }
};
