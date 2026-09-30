import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, privateApi } from '@/services/authApi';
import type { User, AuthContextType } from '@/shared/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function trySsoAutoLogin(): Promise<{ accessToken: string; user: User } | null> {
  try {
    const response = await privateApi.get('/v1/auth/sso-login');
    if (response.data?.success && response.data?.data?.accessToken) {
      return {
        accessToken: response.data.data.accessToken,
        user: response.data.data.user,
      };
    }
  } catch {
    // SSO not available or not authenticated via Authelia
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage, fallback to SSO auto-login
  useEffect(() => {
    const initAuth = async () => {
      try {
        // SSO first — Authelia session is the source of truth behind the gateway
        const ssoResult = await trySsoAutoLogin();
        if (ssoResult) {
          localStorage.setItem('accessToken', ssoResult.accessToken);
          localStorage.setItem('user', JSON.stringify(ssoResult.user));
          setAccessToken(ssoResult.accessToken);
          setUser(ssoResult.user);
          return;
        }

        // No live SSO session -> stored credentials belong to a PREVIOUS user on this
        // device. Drop them instead of resurrecting that user (shared-device bug).
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ponytail: sync SSO identity on tab focus/visibility — fixes stale-session bug
  // when user logs out of Authelia and a different user logs in on the same device.
  const syncSsoIdentity = useCallback(async () => {
    const stored = localStorage.getItem('user');
    const storedEmail = stored ? (JSON.parse(stored)?.email || '').toLowerCase() : '';
    try {
      const response = await privateApi.get('/v1/auth/sso-login');
      const ssoData = response.data?.data;
      if (ssoData?.user?.email) {
        const liveEmail = (ssoData.user.email || '').toLowerCase();
        if (storedEmail && liveEmail !== storedEmail) {
          // Different SSO user now active: hard swap, no leftover state
          localStorage.setItem('accessToken', ssoData.accessToken);
          localStorage.setItem('user', JSON.stringify(ssoData.user));
          setAccessToken(ssoData.accessToken);
          setUser(ssoData.user);
          return;
        }
        if (!storedEmail) {
          localStorage.setItem('accessToken', ssoData.accessToken);
          localStorage.setItem('user', JSON.stringify(ssoData.user));
          setAccessToken(ssoData.accessToken);
          setUser(ssoData.user);
        }
      } else if (storedEmail) {
        // SSO session gone: user logged out of Authelia
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setAccessToken(null);
        setUser(null);
      }
    } catch {
      // No live SSO session; leave state as-is
    }
  }, []);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncSsoIdentity();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', syncSsoIdentity);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', syncSsoIdentity);
    };
  }, [syncSsoIdentity]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      setAccessToken(accessToken);
      setUser(user);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; phone?: string; inviteCode?: string }) => {
    // Get device location if available
    let deviceId: string | undefined;
    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      deviceId = localStorage.getItem('deviceId') || undefined;
      
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 60000,
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }
    } catch (error) {
      console.warn('Could not get device location:', error);
    }

    const response = await authApi.register({
      ...data,
      deviceId,
      latitude,
      longitude,
    });

    const { accessToken, refreshToken, user } = response.data;

    // Store tokens and user
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(user));

    // Update state
    setAccessToken(accessToken);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    try {
      // Destroy the Authelia SSO session so stale auto-login can't resurrect another user
      await fetch('/sso-logout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    } catch (error) {
      console.error('SSO logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...updatedUser };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
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
