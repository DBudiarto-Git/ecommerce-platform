import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from './auth-types';
import { tokenStorage } from './token-storage.service';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginWithToken: (accessToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedToken = tokenStorage.getToken();
    return savedToken ? tokenStorage.decodeUserFromToken(savedToken) : null;
  });

  const loginWithToken = useCallback((accessToken: string) => {
    const decodedUser = tokenStorage.decodeUserFromToken(accessToken);
    if (decodedUser) {
      tokenStorage.setToken(accessToken);
      setUser(decodedUser);
    }
  }, []);

  const logout = useCallback(() => {
    tokenStorage.removeToken();
    setUser(null);
  }, []);

  // Reagiert auf abgelaufene Tokens (401) aus dem Axios-Interceptor
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
  }
  return context;
}
