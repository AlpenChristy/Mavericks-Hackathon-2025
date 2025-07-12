import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001/api';

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user info
        const userRes = await fetch(`${API_BASE_URL}/users/${id}`);
        if (!userRes.ok) throw new Error('Failed to fetch user');
        const userData = await userRes.json();
        setUser(userData.user || userData);

        // Fetch user's items
        const itemsRes = await fetch(`${API_BASE_URL}/items?userId=${id}`);
        if (!itemsRes.ok) throw new Error('Failed to fetch items');
        const itemsData = await itemsRes.json();
        setItems(itemsData.items || []);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <User className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-neutral-600">{error || 'This user does not exist.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center space-x-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-neutral-400" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-black mb-1">{user.name}</h1>
            <p className="text-neutral-600 mb-2">{user.email}</p>
            {user.bio && <p className="text-neutral-700 mb-2">{user.bio}</p>}
            {user.location && <p className="text-neutral-500">{user.location}</p>}
          </div>
        </div>
        {currentUser && currentUser.id === user.id && (
          <div className="mb-8 flex justify-end">
            <a
              href="/profile/edit"
              className="inline-block bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-neutral-800 transition-all duration-200"
            >
              Edit Profile
            </a>
          </div>
        )}
        <h2 className="text-2xl font-semibold text-black mb-6">Products</h2>
        {items.length === 0 ? (
          <div className="text-neutral-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow p-4 border border-neutral-200">
                <img
                  src={item.images && item.images[0] ? item.images[0] : 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded mb-3"
                />
                <h3 className="text-lg font-semibold text-black mb-1">{item.title}</h3>
                <p className="text-neutral-600 mb-1">{item.category_name}</p>
                <p className="text-neutral-500 text-sm">{item.points_value} Points</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 