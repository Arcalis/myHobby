import { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { apiRequest } from '../api/client';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isAuth, setIsAuth] = useState(false);

useEffect(() => {
  const restoreSession = async () => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      const userData = await apiRequest('/api/users/me');
      setUser(userData);
      setIsAuth(true);
    } catch (e) {
      console.error(e);
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuth(false);
    } finally {
      setLoading(false);
    }
  };

  restoreSession();
}, []);

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
      setIsAuth(true);

      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, first_name, second_name) => {
    return await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { email, password, first_name, second_name },
    });
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
    setIsAuth(false);
  };

  const updateUser = (data) => {
  setUser((prev) => ({ ...prev, ...data }));
};

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUser,
        loading,
        token,
        isAuthenticated: isAuth,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}