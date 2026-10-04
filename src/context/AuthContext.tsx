import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initiateLogin } from '../auth/pkce';

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
  isLoading: boolean;
  login: (customUser?: any) => void;
  logout: (global?: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('as_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem('as_auth_user');
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');
  const accountsUrl = (import.meta.env.VITE_ACCOUNTS_URL || 'http://localhost:5174').replace(/\/+$/, '');

  // Verify session on mount with silent SSO detection
  useEffect(() => {
    let token = localStorage.getItem('as_access_token');

    const verifyOrDetectSession = async () => {
      // 1. If no local token, check for active central SSO session
      if (!token) {
        try {
          const ssoRes = await fetch(`${apiBase}/api/accounts/sso/check/?client_id=admin`, {
            credentials: 'include',
            headers: { Accept: 'application/json' },
          });
          const ssoData = await ssoRes.json().catch(() => null);
          if (ssoData?.authenticated && ssoData?.access_token) {
            const receivedToken = String(ssoData.access_token);
            token = receivedToken;
            localStorage.setItem('as_access_token', receivedToken);
            const authUser: AuthUser = {
              userId: ssoData.user.user_id,
              name: `${ssoData.user.name} ${ssoData.user.lastname || ''}`.trim(),
              email: ssoData.user.email,
              role: ssoData.user.user_type === 'admin' ? 'Administrator' : 'User',
              profile: ssoData.user.profile || '/as_logo.webp',
            };
            setUser(authUser);
            localStorage.setItem('as_auth_user', JSON.stringify(authUser));
            setIsLoading(false);
            return;
          }
        } catch {
          // Silent SSO check failed
        }
      }

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiBase}/api/accounts/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          // Attempt silent SSO recovery
          try {
            const ssoRes = await fetch(`${apiBase}/api/accounts/sso/check/?client_id=admin`, {
              credentials: 'include',
              headers: { Accept: 'application/json' },
            });
            const ssoData = await ssoRes.json().catch(() => null);
            if (ssoData?.authenticated && ssoData?.access_token) {
              const newToken = String(ssoData.access_token);
              localStorage.setItem('as_access_token', newToken);
              const authUser: AuthUser = {
                userId: ssoData.user.user_id,
                name: `${ssoData.user.name} ${ssoData.user.lastname || ''}`.trim(),
                email: ssoData.user.email,
                role: ssoData.user.user_type === 'admin' ? 'Administrator' : 'User',
                profile: ssoData.user.profile || '/as_logo.webp',
              };
              setUser(authUser);
              localStorage.setItem('as_auth_user', JSON.stringify(authUser));
              setIsLoading(false);
              return;
            }
          } catch {}

          throw new Error('Session expired');
        }

        const data = await res.json();
        if (data.status && data.user) {
          const authUser: AuthUser = {
            userId: data.user.user_id,
            name: `${data.user.name} ${data.user.lastname || ''}`.trim(),
            email: data.user.email,
            role: data.user.user_type === 'admin' ? 'Administrator' : 'User',
            profile: data.user.profile || '/as_logo.webp',
          };
          setUser(authUser);
          localStorage.setItem('as_auth_user', JSON.stringify(authUser));
        } else {
          throw new Error('Session expired');
        }
      } catch {
        setUser(null);
        localStorage.removeItem('as_auth_user');
        localStorage.removeItem('as_access_token');
      } finally {
        setIsLoading(false);
      }
    };

    void verifyOrDetectSession();
  }, [apiBase]);

  const login = useCallback((target?: any) => {
    if (target && typeof target === 'object' && target.email) {
      const updated: AuthUser = {
        userId: target.user_id || target.userId || 'usr_admin_001',
        name: `${target.name || ''} ${target.lastname || ''}`.trim() || 'Admin User',
        email: target.email,
        role: target.user_type === 'admin' ? 'Administrator' : 'User',
        profile: target.profile || '/as_logo.webp',
      };
      setUser(updated);
      localStorage.setItem('as_auth_user', JSON.stringify(updated));
    } else {
      // Trigger PKCE SSO flow
      const returnTo = typeof target === 'string' && target.startsWith('/')
        ? target
        : (window.location.pathname + window.location.search + window.location.hash);
      void initiateLogin({
        clientId: 'admin',
        accountsPortalUrl: accountsUrl,
        apiBaseUrl: apiBase,
        redirectUri: `${window.location.origin}/auth/callback`,
      }, returnTo);
    }
  }, [accountsUrl, apiBase]);

  const logout = useCallback((global: boolean = false) => {
    const token = localStorage.getItem('as_access_token');
    if (token) {
      const endpoint = global ? '/api/accounts/logout-all/' : '/api/accounts/logout/';
      fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    setUser(null);
    localStorage.removeItem('as_auth_user');
    localStorage.removeItem('as_access_token');

    if (global) {
      window.location.assign(`${accountsUrl}/login?logged_out=1`);
    }
  }, [apiBase, accountsUrl]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
