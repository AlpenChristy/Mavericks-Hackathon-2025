import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, User, Profile } from '../lib/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authService.getUserById('current');
      if (userData) {
        setUser(userData);
        setProfile(userData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile();
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await authService.signUp(email, password, name);
      if (result.error) {
        return { error: { message: result.error } };
      }
      
      if (result.user && result.token) {
        setUser(result.user);
        setProfile(result.user);
        localStorage.setItem('authToken', result.token);
      }
      
      return {};
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn(email, password);
      if (result.error) {
        return { error: { message: result.error } };
      }
      
      if (result.user && result.token) {
        setUser(result.user);
        setProfile(result.user);
        localStorage.setItem('authToken', result.token);
      }
      
      return {};
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('authToken');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const result = await authService.updateProfile(user.id, updates);
      if (result.error) {
        return { error: { message: result.error } };
      }

      if (result.user) {
        setUser(result.user);
        setProfile(result.user);
      }

      return {};
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};