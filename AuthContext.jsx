import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../services/contentService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const handleExpiredSession = () => setUser(null);
    window.addEventListener('ism:session-expired', handleExpiredSession);
    getCurrentUser()
      .then((response) => { if (active) setUser(response.data.user); })
      .catch((error) => {
        if (active && error.status !== 401) {
          console.error('Unable to restore the current user session:', error.message);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      window.removeEventListener('ism:session-expired', handleExpiredSession);
    };
  }, []);

  async function login(credentials) {
    const response = await loginUser(credentials);
    setUser(response.data.user);
    return response.data.user;
  }

  async function register(details) {
    const response = await registerUser(details);
    setUser(response.data.user);
    return response.data.user;
  }

  async function logout() {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    setUser,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
