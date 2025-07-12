import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Recycle, Users, Star, TrendingUp, ShoppingBag } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import ItemCard from '../components/ItemCard';
import bgLanding from '../assets/pexels-anastasia-shuraeva-8074606.jpg';
import dfBg from '../assets/df.jpg';

const Landing: React.FC = () => {
  const { items: featuredItems, loading } = useItems();
  const displayItems = featuredItems.slice(0, 4);

  const fixedCategories = [
    'Outerwear',
    'Tops',
    'Bottoms',
    'Dresses',
    'Footwear',
    'Accessories',
    'Activewear',
    'Formal',
  ];

  const categoryEmojis: Record<string, string> = {
    Outerwear: '🧥',
    Tops: '👕',
    Bottoms: '👖',
    Dresses: '👗',
    Footwear: '👟',
    Accessories: '👜',
    Activewear: '🏃',
    Formal: '��',
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section with background image */}
      <section
        className="relative pt-20 pb-32 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgLanding})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30 z-0" />
        <div className="relative z-10">
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
                Fashion that <br />
                <span className="font-extrabold" style={{ color: '#d2c2a5' }}>never goes out of style</span>
              </h1>
              <p className="text-lg md:text-2xl mb-10 text-neutral-100">
                Join our community of conscious fashion lovers. Swap, sell, and discover unique pieces <br />
                while making sustainable choices that matter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/browse"
                  className="bg-black text-white px-8 py-4 rounded-full hover:bg-neutral-800 transition-all duration-300 font-medium inline-flex items-center justify-center group"
                >
                  Start Shopping
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link
                  to="/signup"
                  className="inline-block px-8 py-4 rounded-full border-2 bg-white text-black font-semibold text-lg transition-all duration-200 ml-4 hover:bg-neutral-100"
                >
                  Join Community
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Stats Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="group">
                <div className="bg-neutral-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black transition-colors duration-300">
                  <Recycle className="h-10 w-10 text-neutral-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-3">2,500+</h3>
                <p className="text-neutral-600 text-lg">Items Exchanged</p>
              </div>
              <div className="group">
                <div className="bg-neutral-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black transition-colors duration-300">
                  <Users className="h-10 w-10 text-neutral-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-3">850+</h3>
                <p className="text-neutral-600 text-lg">Active Members</p>
              </div>
              <div className="group">
                <div className="bg-neutral-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black transition-colors duration-300">
                  <TrendingUp className="h-10 w-10 text-neutral-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-3xl font-bold text-black mb-3">95%</h3>
                <p className="text-neutral-600 text-lg">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Items */}
        <section className="py-20 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-6">Trending Now</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
                Discover unique pieces from our community. Each item is carefully curated and ready for its next chapter.
              </p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden animate-pulse">
                    <div className="aspect-[3/4] bg-neutral-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {displayItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
            <div className="text-center">
              <Link
                to="/browse"
                className="inline-flex items-center text-black hover:text-neutral-600 font-medium text-lg group"
              >
                View All Items
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="relative max-w-6xl mx-auto py-16 px-4 mt-12 mb-16 rounded-3xl overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${dfBg})` }} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-10 drop-shadow-lg">Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {fixedCategories.map(category => (
                <a
                  key={category}
                  href={`/browse?category=${encodeURIComponent(category)}`}
                  className="flex items-center justify-center h-32 rounded-2xl bg-gradient-to-br from-white/90 via-neutral-50/80 to-neutral-100/80 border border-neutral-200 shadow-md hover:shadow-xl hover:border-[#d2c2a5] hover:bg-white/80 transition-all duration-200 font-bold text-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#d2c2a5] px-6 py-4 tracking-wide hover:scale-105 backdrop-blur-sm"
                  style={{ textDecoration: 'none' }}
                >
                  {category}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-6">How ReWear Works</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
                Simple, sustainable, and rewarding. Join our community in three easy steps.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center group">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">List Your Items</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Upload photos and details of clothes you no longer wear. Our community will appreciate them!
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Swap or Buy</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Exchange items directly with other users or use points to purchase pieces you love.
                </p>
              </div>
              <div className="text-center group">
                <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">Enjoy & Repeat</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Refresh your wardrobe sustainably while earning points for future purchases.
                </p>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
};

export default Landing;