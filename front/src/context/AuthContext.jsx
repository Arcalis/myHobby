import React, { createContext, useContext, useState } from 'react';
import { mockUser } from '../data/mockData';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const login = (email, password) => {
        // Симуляция авторизации
        if (email === 'admin@example.com') {
            setUser({ ...mockUser, role: 'admin', email, name: 'Администратор' });
        }
        else if (email === 'organizer@example.com') {
            setUser({ ...mockUser, role: 'organizer', email, name: 'Организатор' });
        }
        else {
            setUser({ ...mockUser, email });
        }
    };
    const logout = () => {
        setUser(null);
    };
    return (<AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
        }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
