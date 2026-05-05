import { useState } from 'react';
import { AuthContext } from './AuthContext';
import { apiRequest } from '../api/client';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('accessToken');

  const login = async (email, password) => {
    try {
      setLoading(true);

      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      localStorage.setItem('accessToken', data.accessToken);
      setUser(data.user);

      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, first_name, second_name) => {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { email, password, first_name, second_name },
    });

    return data;
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (e) {
      console.log(e);
    }

    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}