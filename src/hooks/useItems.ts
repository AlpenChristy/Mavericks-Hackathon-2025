import { useState, useEffect, useCallback } from 'react';
import { Item } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const useItems = (filters?: {
  category?: string;
  search?: string;
  status?: string;
  userId?: string;
  approvalStatus?: string;
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'All') {
        params.append('category', filters.category);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }
      if (filters?.userId) {
        params.append('userId', filters.userId);
      }
      if (filters?.approvalStatus !== undefined) {
        params.append('approvalStatus', filters.approvalStatus);
      }

      const url = `${API_BASE_URL}/items?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters?.category, filters?.search, filters?.status, filters?.userId, filters?.approvalStatus]);

  const refetch = useCallback(() => {
    fetchItems();
  }, []);

  return { items, loading, error, refetch };
};

export const useItem = (id: string) => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/items/${id}`);

        if (!response.ok) {
          throw new Error('Item not found');
        }

        const data = await response.json();
        setItem(data.item);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Item not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  return { item, loading, error };
};