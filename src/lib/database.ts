// API configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Database types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  points: number;
  role: 'user' | 'admin';
  bio?: string;
  location?: string;
  joined_date: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  points: number;
  role: 'user' | 'admin';
  bio?: string;
  location?: string;
  joined_date: string;
}

// Authentication functions
export const authService = {
  // Sign up user
  signUp: async (email: string, password: string, name: string): Promise<{ user?: User; token?: string; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error };
      }

      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'Failed to create account' };
    }
  },

  // Sign in user
  signIn: async (email: string, password: string): Promise<{ user?: User; token?: string; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error };
      }

      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Failed to sign in' };
    }
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<Profile>): Promise<{ user?: User; error?: string }> => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error };
      }

      return { user: data.user };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'Failed to update profile' };
    }
  },

  // Verify JWT token
  verifyToken: (token: string): { userId: string } | null => {
    try {
      // For now, we'll just check if the token exists
      // In a real app, you'd verify the JWT signature
      if (!token) return null;
      
      // This is a simplified check - in production you'd verify the JWT
      return { userId: 'temp' };
    } catch (error) {
      return null;
    }
  }
}; 