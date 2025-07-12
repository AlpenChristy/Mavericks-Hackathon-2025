import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';

import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  showPoints?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, showPoints = true }) => {
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const isFavorited = favorites.includes(item.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite(item.id);
    }
  };

  return (
    <div className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 border border-neutral-100">
      <Link to={`/item/${item.id}`}>
        <div className="relative overflow-hidden aspect-[3/4]">
          <img
            src={item.images[0] || 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600'}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <button 
              onClick={handleFavoriteClick}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-sm"
            >
              <Heart 
                className={`h-4 w-4 transition-colors duration-200 ${
                  isFavorited ? 'text-red-500 fill-red-500' : 'text-neutral-600 hover:text-red-500'
                }`} 
              />
            </button>
          </div>
          {item.condition === 'Excellent' && (
            <div className="absolute top-3 left-3">
              <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <Star className="h-3 w-3 mr-1 fill-white" />
                Excellent
              </div>
            </div>
          )}
          {item.status !== 'available' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
                {item.status === 'redeemed' ? 'Sold' : item.status}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-neutral-900 mb-1 line-clamp-1 group-hover:text-black transition-colors duration-200">
            {item.title}
          </h3>
          <p className="text-sm text-neutral-600 mb-3">{item.category_name} • Size {item.size}</p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-500">
              by {item.uploader_name || 'Unknown'}
            </div>
            {showPoints && (
              <div className="text-sm font-semibold text-black">
                {item.points_value} pts
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ItemCard;