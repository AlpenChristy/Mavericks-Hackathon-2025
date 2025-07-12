import { useState, useEffect } from 'react';
import { SwapRequest } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const useSwapRequests = (userId?: string) => {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSwapRequests = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/swap-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch swap requests');
        }

        const data = await response.json();
        setSwapRequests(data.swapRequests || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSwapRequests();
  }, [userId]);

  return { swapRequests, loading, error };
};