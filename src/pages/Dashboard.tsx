import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Plus, Heart, Repeat, Package, Star, Edit, Trash2, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../hooks/useItems';
import { useSwapRequests } from '../hooks/useSwapRequests';
import ItemCard from '../components/ItemCard';

const Dashboard: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'swaps' | 'favorites'>('overview');

  const { items: userItems, loading: itemsLoading, refetch: refetchItems } = useItems({
    userId: user?.id,
    approvalStatus: '' // Show all items for the user (including pending)
  });



  const { swapRequests, loading: swapsLoading } = useSwapRequests(user?.id);



  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" />;
  }

  const stats = [
    { label: 'Points Balance', value: profile.points, icon: Star, color: 'text-yellow-600' },
    { label: 'Items Listed', value: userItems.length, icon: Package, color: 'text-blue-600' },
    { label: 'Active Swaps', value: swapRequests.length, icon: Repeat, color: 'text-green-600' },
    { label: 'Items Saved', value: 0, icon: Heart, color: 'text-red-600' }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-neutral-100 mr-4">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">{stat.label}</p>
                <p className="text-2xl font-bold text-black">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
        <h3 className="text-xl font-semibold text-black mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/add-item"
            className="flex items-center justify-center p-6 border-2 border-dashed border-neutral-300 rounded-lg hover:border-black transition-all duration-200 group"
          >
            <Plus className="h-6 w-6 text-neutral-400 mr-3 group-hover:text-black transition-colors duration-200" />
            <span className="font-medium text-neutral-600 group-hover:text-black transition-colors duration-200">List New Item</span>
          </Link>
          <Link
            to="/browse"
            className="flex items-center justify-center p-6 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors duration-200 font-medium"
          >
            Browse Items
          </Link>
        </div>
      </div>

      {/* Recent Items */}
      {userItems.length > 0 && (
        <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-black">Your Recent Items</h3>
            <button
              onClick={() => setActiveTab('items')}
              className="text-black hover:text-neutral-600 font-medium transition-colors duration-200"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userItems.slice(0, 3).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderItems = () => (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-8 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-black">Your Items</h3>
          <div className="flex space-x-3">
            <button
              onClick={refetchItems}
              disabled={itemsLoading}
              className="bg-neutral-100 text-black px-4 py-3 rounded-lg hover:bg-neutral-200 transition-colors duration-200 inline-flex items-center font-medium disabled:opacity-50"
            >
              {itemsLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Repeat className="h-4 w-4 mr-2" />
              )}
              Refresh
            </button>
            <Link
              to="/add-item"
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors duration-200 inline-flex items-center font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Link>
          </div>
        </div>
      </div>
      {itemsLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-black mx-auto" />
        </div>
      ) : userItems.length > 0 ? (
        <div className="p-8">
          <div className="space-y-4">
            {userItems.map((item) => (
              <div key={item.id} className="flex items-center space-x-6 p-6 border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
                <img
                  src={item.images[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-black text-lg">{item.title}</h4>
                  <p className="text-sm text-neutral-600">{item.category_name} • Size {item.size}</p>
                  <p className="text-sm text-neutral-500">Listed on {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-black">{item.points_value} pts</p>
                  <p className={`text-sm capitalize ${
                    item.status === 'available' ? 'text-green-600' :
                    item.status === 'pending' ? 'text-yellow-600' :
                    'text-neutral-600'
                  }`}>
                    {item.status}
                  </p>
                  <p className={`text-xs capitalize ${
                    item.approval_status === 'approved' ? 'text-green-600' :
                    item.approval_status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {item.approval_status}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/item/${item.id}`}
                    className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button className="p-2 text-neutral-400 hover:text-red-600 transition-colors duration-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center">
          <Package className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
          <h4 className="text-xl font-medium text-black mb-3">No items yet</h4>
          <p className="text-neutral-600 mb-8 text-lg">Start by listing your first item</p>
          <Link
            to="/add-item"
            className="bg-black text-white px-8 py-4 rounded-lg hover:bg-neutral-800 transition-colors duration-200 font-medium"
          >
            List Your First Item
          </Link>
        </div>
      )}
    </div>
  );

  const renderSwaps = () => (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-8 border-b border-neutral-200">
        <h3 className="text-xl font-semibold text-black">Swap Requests</h3>
      </div>
      {swapsLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-black mx-auto" />
        </div>
      ) : swapRequests.length > 0 ? (
        <div className="p-8">
          <div className="space-y-4">
            {swapRequests.map((swap) => (
              <div key={swap.id} className="p-6 border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-black">{swap.item_title || 'Unknown Item'}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    swap.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {swap.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mb-3">{swap.message}</p>
                <p className="text-xs text-neutral-500">Requested on {new Date(swap.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center">
          <Repeat className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
          <h4 className="text-xl font-medium text-black mb-3">No swap requests</h4>
          <p className="text-neutral-600">Your swap requests will appear here</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-3">Welcome back, {profile.name}!</h1>
          <p className="text-neutral-600 text-lg">Manage your items, track your swaps, and discover new pieces</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8 border border-neutral-200">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-neutral-600" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-black">{profile.name}</h2>
              <p className="text-neutral-600">{profile.email}</p>
              <p className="text-sm text-neutral-500">Member since {new Date(profile.joined_date).getFullYear()}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-black">{profile.points}</div>
              <div className="text-sm text-neutral-600">Available Points</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-neutral-200">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'items', label: 'My Items' },
              { id: 'swaps', label: 'Swaps' },
              { id: 'favorites', label: 'Favorites' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'items' && renderItems()}
        {activeTab === 'swaps' && renderSwaps()}
        {activeTab === 'favorites' && (
          <div className="bg-white rounded-lg p-16 shadow-sm text-center border border-neutral-200">
            <Heart className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-black mb-3">No favorites yet</h3>
            <p className="text-neutral-600">Items you save will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;