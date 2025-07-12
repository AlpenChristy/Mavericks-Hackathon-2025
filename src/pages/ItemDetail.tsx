import React, { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Heart, Share2, ArrowLeft, Star, MessageCircle, Repeat, Coins, Loader2, User } from 'lucide-react';
import { useItem } from '../hooks/useItems';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

const API_BASE_URL = 'http://localhost:3001/api';

const ItemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, refreshProfile } = useAuth();
  const { item, loading, error } = useItem(id!);
  const { favorites, toggleFavorite } = useFavorites();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [swapMessage, setSwapMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (error || !item) {
    return <Navigate to="/browse" />;
  }

  const isOwner = user?.id === item.uploader_id;
  const canAfford = profile && profile.points >= item.points_value;
  const isFavorited = favorites.includes(item.id);

  const handleSwapRequest = async () => {
    if (!user) {
      alert('Please login to make swap requests');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/swap-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: item.id,
          message: swapMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send swap request');
      }

      alert('Swap request sent successfully!');
      setShowSwapModal(false);
      setSwapMessage('');
    } catch (error) {
      console.error('Error sending swap request:', error);
      alert('Failed to send swap request. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!user || !profile) {
      alert('Please login to redeem items');
      return;
    }
    if (!canAfford) {
      alert('Insufficient points');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/items/${item.id}/redeem`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to redeem item');
      }

      alert('Item redeemed successfully!');
      await refreshProfile();
      setShowRedeemModal(false);
    } catch (error) {
      console.error('Error redeeming item:', error);
      alert('Failed to redeem item. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/browse"
          className="inline-flex items-center text-neutral-600 hover:text-black mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Browse
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
              <img
                src={item.images[selectedImageIndex] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            {item.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index ? 'border-black' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-black mb-4">{item.title}</h1>
              <div className="flex items-center space-x-4 text-neutral-600 mb-6">
                <span className="font-medium">{item.category_name}</span>
                <span>•</span>
                <span>Size {item.size}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                  <span>{item.condition}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-8">
                <div className="text-3xl font-bold text-black">
                  {item.points_value} Points
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => toggleFavorite(item.id)}
                    className="p-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200"
                  >
                    <Heart className={`h-5 w-5 transition-colors duration-200 ${
                      isFavorited ? 'text-red-500 fill-red-500' : 'text-neutral-600'
                    }`} />
                  </button>
                  <button className="p-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-all duration-200">
                    <Share2 className="h-5 w-5 text-neutral-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-black mb-4">Description</h3>
              <p className="text-neutral-700 leading-relaxed text-lg">{item.description}</p>
            </div>

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-black mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm hover:bg-neutral-200 transition-colors duration-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Uploader Info */}
            <div className="border-t border-neutral-200 pt-8">
              <h3 className="text-xl font-semibold text-black mb-4">Listed by</h3>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center">
                  {item.uploader_avatar ? (
                    <img 
                      src={item.uploader_avatar} 
                      alt={item.uploader_name || 'User'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-neutral-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-black text-lg">{item.uploader_name || 'Anonymous'}</p>
                  <p className="text-sm text-neutral-600">Member since {new Date(item.created_at).getFullYear()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isOwner && user && (
              <div className="space-y-4 pt-8">
                <button
                  onClick={() => setShowSwapModal(true)}
                  className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-neutral-800 transition-all duration-200 font-medium flex items-center justify-center"
                >
                  <Repeat className="h-5 w-5 mr-2" />
                  Request Swap
                </button>
                <button
                  onClick={() => setShowRedeemModal(true)}
                  disabled={!canAfford}
                  className={`w-full py-4 px-6 rounded-lg transition-all duration-200 font-medium flex items-center justify-center ${
                    canAfford
                      ? 'border-2 border-black text-black hover:bg-black hover:text-white'
                      : 'border-2 border-neutral-300 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Coins className="h-5 w-5 mr-2" />
                  Buy with Points
                  {!canAfford && profile && ` (Need ${item.points_value - profile.points} more points)`}
                </button>
              </div>
            )}

            {/* Swap Modal */}
            {showSwapModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold text-black mb-4">Request Swap</h3>
                  <textarea
                    value={swapMessage}
                    onChange={(e) => setSwapMessage(e.target.value)}
                    placeholder="Add a message to your swap request..."
                    className="w-full border border-neutral-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    rows={4}
                  />
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowSwapModal(false)}
                      className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSwapRequest}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {actionLoading ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Redeem Modal */}
            {showRedeemModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold text-black mb-4">Redeem Item</h3>
                  <p className="text-neutral-600 mb-6">
                    Are you sure you want to redeem this item for {item.points_value} points?
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowRedeemModal(false)}
                      className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRedeem}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {actionLoading ? 'Redeeming...' : 'Redeem Item'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;