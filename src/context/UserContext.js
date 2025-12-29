'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({
        name: 'Omkar', // Default mock user
        handle: '@omkar_dev',
        bio: 'Full Stack Developer | AI Enthusiast',
        avatar: 'O',
        verified: true,
        email: 'omkar@example.com'
    });

    const updateUser = (updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
