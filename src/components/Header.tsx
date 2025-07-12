import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Menu, X, Plus, Settings, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" onClick={closeMobileMenu}>
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black tracking-tight">ReWear</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/browse" 
              className="text-neutral-700 hover:text-black transition-colors duration-200 font-medium"
            >
              Browse
            </Link>
            {user && (
              <Link 
                to="/add-item" 
                className="text-neutral-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Sell
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {user && profile ? (
              <div className="flex items-center space-x-6">
                <div className="text-sm">
                  <span className="font-semibold text-black">{profile.points}</span>
                  <span className="text-neutral-600 ml-1">points</span>
                </div>
                <div className="relative group">
                  <button className="flex items-center space-x-3 text-neutral-700 hover:text-black transition-colors duration-200">
                    <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-neutral-600" />
                      )}
                    </div>
                    <span className="font-medium">{profile.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {/* Desktop Dropdown */}
                    {location.pathname !== '/admin' && (
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                      >
                        My Account
                      </Link>
                    )}
                    {location.pathname !== '/admin' && (
                      <Link 
                        to="/favorites" 
                        className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                      >
                        <Heart className="inline h-4 w-4 mr-2" />
                        Favorites
                      </Link>
                    )}
                    {profile.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                      >
                        <Settings className="inline h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-2 border-neutral-200" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                    >
                      <LogOut className="inline h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-neutral-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-black text-white px-6 py-2 rounded-full hover:bg-neutral-800 transition-colors duration-200 font-medium"
                >
                  Join
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-black" />
            ) : (
              <Menu className="h-6 w-6 text-black" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="px-2 pt-4 pb-6 space-y-2">
              <Link
                to="/browse"
                className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                onClick={closeMobileMenu}
              >
                Browse
              </Link>
              {user && (
                <Link
                  to="/add-item"
                  className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                  onClick={closeMobileMenu}
                >
                  <Plus className="inline h-4 w-4 mr-2" />
                  Sell
                </Link>
              )}
              {user && profile ? (
                <div className="border-t border-neutral-200 pt-4 mt-4">
                  <div className="px-3 py-3">
                    <div className="text-sm font-semibold text-black">{profile.name}</div>
                    <div className="text-sm text-neutral-600">{profile.points} points</div>
                  </div>
                  {/* Mobile Dropdown */}
                  {location.pathname !== '/admin' && (
                    <Link
                      to="/dashboard"
                      className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      My Account
                    </Link>
                  )}
                  {location.pathname !== '/admin' && (
                    <Link
                      to="/favorites"
                      className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      Favorites
                    </Link>
                  )}
                  {profile.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                      onClick={closeMobileMenu}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-neutral-200 pt-4 mt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block mx-3 py-3 bg-black text-white rounded-lg text-center font-medium hover:bg-neutral-800 transition-colors duration-200"
                    onClick={closeMobileMenu}
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;