import React, { useState } from 'react';
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import ItemCard from '../components/ItemCard';

const Browse: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { items, loading, error } = useItems({
    category: selectedCategory,
    search: searchTerm,
    status: 'available'
  });

  const categories = ['All', 'Outerwear', 'Tops', 'Bottoms', 'Dresses', 'Footwear', 'Accessories', 'Activewear', 'Formal'];

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'pointsLow':
        return a.points_value - b.points_value;
      case 'pointsHigh':
        return b.points_value - a.points_value;
      case 'alphabetical':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Something went wrong</h2>
          <p className="text-neutral-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">Browse Items</h1>
          <p className="text-neutral-600 text-lg">Discover unique pieces from our community</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-neutral-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search items, brands, or styles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-neutral-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="pointsLow">Price: Low to High</option>
                <option value="pointsHigh">Price: High to Low</option>
                <option value="alphabetical">A-Z</option>
              </select>

              <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-black text-white' 
                      : 'bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-neutral-600">
            {loading ? 'Loading...' : `${sortedItems.length} ${sortedItems.length === 1 ? 'item' : 'items'}`}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse border border-neutral-100">
                <div className="aspect-[3/4] bg-neutral-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-2/3 mb-3"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-neutral-200 rounded w-1/3"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedItems.length > 0 ? (
          <div className={`grid gap-8 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {sortedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-neutral-400 mb-6">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-black mb-3">No items found</h3>
            <p className="text-neutral-600 mb-6">
              {searchTerm 
                ? `No items match your search for "${searchTerm}"`
                : 'No items match your current filters'
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;