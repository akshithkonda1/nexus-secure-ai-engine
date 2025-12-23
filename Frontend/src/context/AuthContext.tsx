import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { testAccountManager } from '../utils/testAccounts';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider?: 'google' | 'apple' | 'facebook' | 'microsoft' | 'email';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithProvider: (provider: 'google' | 'apple' | 'facebook' | 'microsoft') => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);

          // Validate test account if it's a test user
          if (import.meta.env.VITE_ENABLE_TEST_MODE === 'true' &&
              parsedUser.email?.endsWith('@ryuzen.test')) {
            // Test accounts expire, so we don't restore them
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            setUser(null);
          } else {
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);

      // Check if test mode and test email
      if (import.meta.env.VITE_ENABLE_TEST_MODE === 'true' &&
          email.endsWith('@ryuzen.test')) {

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: Date.now().toString(),
          email,
          name,
          provider: 'email',
          createdAt: new Date().toISOString(),
        };

        const mockToken = 'test_token_' + Date.now();

        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }

      // Real API call would go here
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Check test account
      if (import.meta.env.VITE_ENABLE_TEST_MODE === 'true' &&
          email.endsWith('@ryuzen.test')) {

        if (!testAccountManager.validate(email, password)) {
          throw new Error('Invalid test credentials or account expired');
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockUser: User = {
          id: '1',
          email,
          name: email.split('@')[0].replace('test.', 'Test User '),
          provider: 'email',
          createdAt: new Date().toISOString(),
        };

        const mockToken = 'test_token_' + Date.now();

        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        setUser(mockUser);
        return;
      }

      // Real API call would go here
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithProvider = async (provider: 'google' | 'apple' | 'facebook' | 'microsoft') => {
    try {
      setLoading(true);

      // In production, this would redirect to OAuth flow
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      // For now, we'll simulate the OAuth flow
      console.log(`[AUTH] Initiating ${provider} OAuth flow...`);

      // Real implementation would be:
      // window.location.href = `${apiUrl}/auth/${provider}`;

      // Mock implementation for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockUser: User = {
        id: Date.now().toString(),
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        provider,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        createdAt: new Date().toISOString(),
      };

      const mockToken = `${provider}_token_` + Date.now();

      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Call logout endpoint if needed
      // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      // await fetch(`${apiUrl}/auth/logout`, { method: 'POST' });

      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    loginWithProvider,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
