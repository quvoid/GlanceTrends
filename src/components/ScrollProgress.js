'use client';
import { useEffect, useState } from 'react';

export default function ScrollProgress() {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (scrollTop / docHeight) * 100;
            setWidth(scrolled);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: `${width}%`,
            height: '4px',
            background: 'var(--accent)',
            boxShadow: '0 0 10px var(--accent)',
            zIndex: 9999,
            transition: 'width 0.1s ease-out'
        }} />
    );
}
