import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredToken, setAuthToken } from '../api/client';

interface User {
  id: string;
  phone: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const storedToken = await getStoredToken();
        if (storedToken) {
          setToken(storedToken);
          // Parse basic user info from JWT payload if available
          try {
            const payloadBase64 = storedToken.split('.')[1];
            const decodedJson = atob(payloadBase64);
            const decoded = JSON.parse(decodedJson);
            if (decoded.id && decoded.phone) {
              setUser({ id: decoded.id, phone: decoded.phone });
            }
          } catch {
            // Ignore token decoding failure if malformed
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Error loading stored token:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
