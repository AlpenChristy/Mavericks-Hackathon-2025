import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Plus, Heart, Repeat, Package, Star, Edit, Trash2, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../hooks/useItems';
import { useSwapRequests } from '../hooks/useSwapRequests';
import { useFavorites } from '../hooks/useFavorites';
import ItemCard from '../components/ItemCard';

const API_BASE_URL = 'http://localhost:3001/api';

const Dashboard: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'swaps' | 'purchases'>('overview');

  const { items: userItems, loading: itemsLoading, refetch: refetchItems } = useItems({
    userId: user?.id,
    approvalStatus: '' // Show all items for the user (including pending)
  });

  const { items: myItems } = useItems({ userId: user?.id, status: 'available', approvalStatus: 'approved' });
  const [swapModal, setSwapModal] = useState<{ open: boolean; swapId: string | null }>({ open: false, swapId: null });
  const [swapSelected, setSwapSelected] = useState<string[]>([]);
  const [swapLoading, setSwapLoading] = useState(false);

  const { swapRequests, loading: swapsLoading } = useSwapRequests(user?.id);
  const { favorites } = useFavorites();

  // Use all items for purchases, not just userItems
  const { items: allItems } = useItems();


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

  const handleAcceptSwap = async (swapId: string) => {
    if (!window.confirm('Are you sure you want to accept this swap? This will mark all involved items as swapped.')) return;
    try {
      const token = localStorage.getItem('authToken');
      setSwapLoading(true);
      const res = await fetch(`${API_BASE_URL}/swap-requests/${swapId}/accept`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to accept swap');
      window.location.reload();
    } catch (e) {
      alert('Failed to accept swap.');
    } finally {
      setSwapLoading(false);
    }
  };
  const handleDeclineSwap = async (swapId: string) => {
    if (!window.confirm('Decline this swap request?')) return;
    try {
      const token = localStorage.getItem('authToken');
      setSwapLoading(true);
      const res = await fetch(`${API_BASE_URL}/swap-requests/${swapId}/decline`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to decline swap');
      window.location.reload();
    } catch (e) {
      alert('Failed to decline swap.');
    } finally {
      setSwapLoading(false);
    }
  };

  const renderSwaps = () => {
    const incoming = swapRequests.filter(swap => swap.item_uploader_id === user?.id);
    const outgoing = swapRequests.filter(swap => swap.requester_id === user?.id);
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
        <div className="p-8 border-b border-neutral-200">
          <h3 className="text-xl font-semibold text-black">Swap Requests</h3>
        </div>
        <div className="p-8">
          <h4 className="text-lg font-bold mb-4">Incoming Requests</h4>
          {incoming.length === 0 ? (
            <div className="text-neutral-500 mb-8">No incoming swap requests.</div>
          ) : (
            <div className="space-y-4 mb-8">
              {incoming.map((swap) => (
                <div key={swap.id} className="p-6 border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{swap.requester_name}</span> wants to swap for <span className="font-medium">{swap.item_title}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      swap.status === 'completed' ? 'bg-green-100 text-green-800' :
                      swap.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-neutral-200 text-neutral-600'
                    }`}>
                      {swap.status}
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-neutral-700">Message: {swap.message || <span className="italic text-neutral-400">No message</span>}</div>
                  <div className="mb-2 text-sm">
                    <span className="font-medium">Requested Item:</span>
                    <div className="flex items-center space-x-4 mt-2">
                      <img src={(swap.item_images && swap.item_images[0]) || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'} alt={swap.item_title} className="w-16 h-16 object-cover rounded-lg" />
                      <div>
                        <div className="font-medium">{swap.item_title}</div>
                        <div className="text-neutral-500">0 pts</div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-2 text-sm">
                    <span className="font-medium">Offered Items:</span>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {swap.offered_items && swap.offered_items.length > 0 ? (
                        swap.offered_items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 border rounded-lg p-2">
                            <img src={item.images?.[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'} alt={item.title} className="w-12 h-12 object-cover rounded" />
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-neutral-500">{item.points_value} pts</div>
                            </div>
                          </div>
                        ))
                      ) : <div className="italic text-neutral-400">None</div>}
                    </div>
                  </div>
                  {/* Points Difference Display */}
                  {swap.offered_items && swap.offered_items.length > 0 && (
                    <div className="mb-2 text-sm">
                      <span className="font-medium">Points Difference:</span>
                      <div className="mt-1">
                        {(() => {
                          const requestedPoints = swap.item_points_value ?? 0;
                          const offeredPoints = swap.offered_items.reduce((sum, item) => sum + item.points_value, 0);
                          const difference = requestedPoints - offeredPoints;
                          
                          if (difference === 0) {
                            return <span className="text-green-600">Equal value swap - no points transfer needed</span>;
                          } else if (difference > 0) {
                            return <span className="text-red-600">Requester needs to pay {difference} points to owner</span>;
                          } else {
                            return <span className="text-blue-600">Owner needs to pay {Math.abs(difference)} points to requester</span>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                  {swap.status === 'pending' && (
                    <div className="flex space-x-2 mt-4">
                      <button onClick={() => handleAcceptSwap(swap.id)} disabled={swapLoading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Accept</button>
                      <button onClick={() => handleDeclineSwap(swap.id)} disabled={swapLoading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <h4 className="text-lg font-bold mb-4">Outgoing Requests</h4>
          {outgoing.length === 0 ? (
            <div className="text-neutral-500">No outgoing swap requests.</div>
          ) : (
            <div className="space-y-4">
              {outgoing.map((swap) => (
                <div key={swap.id} className="p-6 border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      You offered swap for <span className="font-medium">{swap.item_title}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      swap.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      swap.status === 'completed' ? 'bg-green-100 text-green-800' :
                      swap.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-neutral-200 text-neutral-600'
                    }`}>
                      {swap.status}
                    </span>
                  </div>
                  <div className="mb-2 text-sm text-neutral-700">Message: {swap.message || <span className="italic text-neutral-400">No message</span>}</div>
                  <div className="mb-2 text-sm">
                    <span className="font-medium">Requested Item:</span>
                    <div className="flex items-center space-x-4 mt-2">
                      <img src={'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'} alt={swap.item_title} className="w-16 h-16 object-cover rounded-lg" />
                      <div>
                        <div className="font-medium">{swap.item_title}</div>
                        <div className="text-neutral-500">{swap.item_points_value ?? 0} pts</div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-2 text-sm">
                    <span className="font-medium">You offered:</span>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {swap.offered_items && swap.offered_items.length > 0 ? (
                        swap.offered_items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-2 border rounded-lg p-2">
                            <img src={item.images?.[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'} alt={item.title} className="w-12 h-12 object-cover rounded" />
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-neutral-500">{item.points_value} pts</div>
                            </div>
                          </div>
                        ))
                      ) : <div className="italic text-neutral-400">None</div>}
                    </div>
                  </div>
                  {/* Points Difference Display for Outgoing */}
                  {swap.offered_items && swap.offered_items.length > 0 && (
                    <div className="mb-2 text-sm">
                      <span className="font-medium">Points Difference:</span>
                      <div className="mt-1">
                        {(() => {
                          const requestedPoints = swap.item_points_value ?? 0;
                          const offeredPoints = swap.offered_items.reduce((sum, item) => sum + item.points_value, 0);
                          const difference = requestedPoints - offeredPoints;
                          
                          if (difference === 0) {
                            return <span className="text-green-600">Equal value swap - no points transfer needed</span>;
                          } else if (difference > 0) {
                            return <span className="text-red-600">You would need to pay {difference} points to owner</span>;
                          } else {
                            return <span className="text-blue-600">Owner would need to pay {Math.abs(difference)} points to you</span>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPurchases = () => {
    // Purchases: items where user is the requester in a completed swap, or items with status 'redeemed' and not uploaded by user
    const purchasedItemIds = swapRequests
      .filter(swap => swap.status === 'completed' && swap.requester_id === user?.id)
      .map(swap => swap.item_id);
    const redeemedItems = allItems.filter(item => item.status === 'redeemed' && item.uploader_id !== user?.id);
    const swappedItems = allItems.filter(item => purchasedItemIds.includes(item.id));
    const purchasedItems = [...swappedItems, ...redeemedItems];
    const uniquePurchasedItems = Array.from(new Map(purchasedItems.map(item => [item.id, item])).values());
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200">
        {uniquePurchasedItems.length === 0 ? (
          <div className="text-center">
            <Package className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-black mb-3">No purchases yet</h3>
            <p className="text-neutral-600">Items you buy or receive via swap will appear here</p>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold text-black mb-6">My Purchases</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {uniquePurchasedItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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
              { id: 'purchases', label: 'My Purchases' }
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
        {activeTab === 'purchases' && renderPurchases()}
      </div>
    </div>
  );
};

export default Dashboard;