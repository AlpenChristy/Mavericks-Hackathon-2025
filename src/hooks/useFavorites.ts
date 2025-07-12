import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001/api';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }

      const data = await response.json();
      setFavorites(data.favorites?.map((f: any) => f.item_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (itemId: string) => {
    if (!user) return;

    const isFavorited = favorites.includes(itemId);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/favorites/${itemId}`, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      if (isFavorited) {
        setFavorites(prev => prev.filter(id => id !== itemId));
      } else {
        setFavorites(prev => [...prev, itemId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return { favorites, loading, toggleFavorite };
};