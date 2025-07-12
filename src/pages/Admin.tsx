import React, { useState } from 'react';
import { Shield, Check, X, Eye, Trash2, Users, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useItems } from '../hooks/useItems';

const API_BASE_URL = 'http://localhost:3001/api';

const Admin: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'users' | 'reports'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { items: pendingItems, loading: pendingLoading, refetch: refetchPending } = useItems({
    approvalStatus: 'pending'
  });

  const { items: approvedItems, loading: approvedLoading } = useItems({
    approvalStatus: 'approved'
  });

  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-20 w-20 text-neutral-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-black mb-3">Access Denied</h1>
          <p className="text-neutral-600 text-lg">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/items/${itemId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve item');
      }

      await refetchPending();
    } catch (error) {
      console.error('Error approving item:', error);
      alert('Failed to approve item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (itemId: string) => {
    setActionLoading(itemId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/items/${itemId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject item');
      }

      await refetchPending();
    } catch (error) {
      console.error('Error rejecting item:', error);
      alert('Failed to reject item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    if (!confirm('Are you sure you want to remove this item?')) return;

    setActionLoading(itemId);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      await refetchPending();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item');
    } finally {
      setActionLoading(null);
    }
  };

  const renderPendingItems = () => (
    <div className="space-y-8">
      {pendingLoading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-black mx-auto" />
        </div>
      ) : pendingItems.length > 0 ? (
        pendingItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm p-8 border border-neutral-200">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-1/3">
                <img
                  src={item.images[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt={item.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-black">{item.title}</h3>
                    <p className="text-neutral-600">{item.category_name} • Size {item.size} • {item.condition}</p>
                    <p className="text-sm text-neutral-500">Listed by {item.uploader_name || 'Anonymous'}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Review
                    </span>
                  </div>
                </div>
                <p className="text-neutral-700 mb-6 leading-relaxed">{item.description}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-xl font-semibold text-black">
                    {item.points_value} Points
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={actionLoading === item.id}
                      className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {actionLoading === item.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={actionLoading === item.id}
                      className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                    <button className="flex items-center px-6 py-3 border-2 border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg p-16 text-center border border-neutral-200">
          <Package className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
          <h3 className="text-xl font-medium text-black mb-3">No pending items</h3>
          <p className="text-neutral-600">All items have been reviewed</p>
        </div>
      )}
    </div>
  );

  const renderApprovedItems = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
      {approvedLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-black mx-auto" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {approvedItems.slice(0, 10).map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        className="h-12 w-12 rounded-lg object-cover"
                        src={item.images[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'}
                        alt={item.title}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-black">{item.title}</div>
                        <div className="text-sm text-neutral-500">by {item.uploader_name || 'Anonymous'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {item.points_value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'available' ? 'bg-green-100 text-green-800' :
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-neutral-100 text-neutral-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-black hover:text-neutral-600 transition-colors duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={actionLoading === item.id}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 disabled:opacity-50"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
      <div className="p-8">
        <div className="flex items-center mb-6">
          <Users className="h-6 w-6 text-neutral-600 mr-3" />
          <h3 className="text-xl font-semibold text-black">User Management</h3>
        </div>
        <p className="text-neutral-600">User management features coming soon...</p>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-neutral-200">
      <div className="p-8">
        <div className="flex items-center mb-6">
          <AlertTriangle className="h-6 w-6 text-neutral-600 mr-3" />
          <h3 className="text-xl font-semibold text-black">Reports</h3>
        </div>
        <p className="text-neutral-600">Report management features coming soon...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Admin Dashboard</h1>
          <p className="text-neutral-600">Manage items, users, and platform content</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'pending', label: 'Pending Items', count: pendingItems.length },
              { id: 'approved', label: 'Approved Items', count: approvedItems.length },
              { id: 'users', label: 'Users' },
              { id: 'reports', label: 'Reports' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-neutral-100 text-neutral-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'pending' && renderPendingItems()}
        {activeTab === 'approved' && renderApprovedItems()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'reports' && renderReports()}
      </div>
    </div>
  );
};

export default Admin;