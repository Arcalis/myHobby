import { useState } from 'react';
import { AuthContext } from './AuthContext';
import { mockUser } from '../data/mockData';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email) => {
    if (email === 'admin@example.com') {
      setUser({ ...mockUser, role: 'admin', email, name: 'Администратор' });
    } else if (email === 'organizer@example.com') {
      setUser({ ...mockUser, role: 'organizer', email, name: 'Организатор' });
    } else {
      setUser({ ...mockUser, email });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}