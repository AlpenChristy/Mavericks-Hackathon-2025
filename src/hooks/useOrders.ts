import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3001/api';

export interface SoldOrder {
  item_id: string;
  item_title: string;
  points_value: number;
  sold_date: string;
  images: string[];
  seller_name: string;
  seller_email: string;
  buyer_name: string;
  buyer_email: string;
}

export interface SwappedOrder {
  item_id: string;
  item_title: string;
  points_value: number;
  swapped_date: string;
  images: string[];
  swap_request_id: string;
  swap_status: string;
  requester_name: string;
  requester_email: string;
  owner_name: string;
  owner_email: string;
}

export const useOrders = () => {
  const [soldOrders, setSoldOrders] = useState<SoldOrder[]>([]);
  const [swappedOrders, setSwappedOrders] = useState<SwappedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/admin/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setSoldOrders(data.soldOrders || []);
        setSwappedOrders(data.swappedOrders || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { soldOrders, swappedOrders, loading, error };
}; 