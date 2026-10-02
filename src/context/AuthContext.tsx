import React, { createContext, useContext, useState } from 'react';

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: string;
  profile: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user?: Partial<AuthUser>) => void;
  logout: () => void;
}

const defaultAdminUser: AuthUser = {
  userId: 'usr_admin_001',
  name: 'Sadhu Ashok Kumar',
  email: 'ashok@ascentracoresolutions.com',
  role: 'Administrator',
  profile: '/as_logo.webp',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('as_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultAdminUser;
      }
    }
    return defaultAdminUser;
  });

  const login = (customUser?: Partial<AuthUser>) => {
    const updated = { ...defaultAdminUser, ...customUser };
    setUser(updated);
    localStorage.setItem('as_auth_user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('as_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
