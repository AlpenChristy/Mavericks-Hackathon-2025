import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useItems } from '../hooks/useItems';
import ItemCard from '../components/ItemCard';

const Favorites: React.FC = () => {
  const { favorites, loading } = useFavorites();
  const { items, loading: itemsLoading } = useItems();

  const favoriteItems = items.filter(item => favorites.includes(item.id));

  if (loading || itemsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-neutral-500 text-lg">Loading favorites...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-black mb-8 flex items-center">
          <Heart className="h-8 w-8 text-red-500 mr-3" />
          My Favorites
        </h1>
        {favoriteItems.length === 0 ? (
          <div className="bg-white rounded-lg p-16 shadow-sm text-center border border-neutral-200">
            <Heart className="h-16 w-16 text-neutral-400 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-black mb-3">No favorites yet</h3>
            <p className="text-neutral-600">Items you save will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 