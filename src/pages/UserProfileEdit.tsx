import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, User } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3001/api';

const UserProfileEdit: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', bio: '', location: '', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setForm({
          name: data.user.name || '',
          bio: data.user.bio || '',
          location: data.user.location || '',
          avatar_url: data.user.avatar_url || '',
        });
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSuccess(true);
      await refreshProfile?.();
      if (user?.id) {
        setTimeout(() => navigate(`/user/${user.id}`), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-8 w-8 animate-spin text-black" /></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 w-full max-w-lg border border-neutral-200">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-4">Profile updated!</div>}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden mb-2">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-neutral-400" />
            )}
          </div>
          <input
            type="text"
            name="avatar_url"
            value={form.avatar_url}
            onChange={handleChange}
            className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-center"
            placeholder="Avatar image URL"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
            rows={3}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border border-neutral-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UserProfileEdit; 