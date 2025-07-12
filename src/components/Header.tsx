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
          <Link to="/" className="flex items-center space-x-3 group" onClick={closeMobileMenu} aria-label="Home">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-black tracking-tight group-hover:text-neutral-700 transition-colors duration-200">ReWear</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10 ml-8">
            <Link 
              to="/browse" 
              className="text-neutral-700 hover:text-black transition-colors duration-200 font-semibold px-2 py-1 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-black"
            >
              Browse
            </Link>
            {user && (
              <Link 
                to="/add-item" 
                className="text-neutral-700 hover:text-black transition-colors duration-200 font-semibold px-2 py-1 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Sell
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-8">
            {user && profile ? (
              <>
                <div className="text-sm">
                  <span className="font-bold text-black bg-neutral-100 px-3 py-1 rounded-full shadow-sm mr-2">{profile.points} pts</span>
                </div>
                <div className="relative group" tabIndex={0} aria-haspopup="true" aria-expanded="false">
                  <button className="flex items-center space-x-3 text-neutral-700 hover:text-black transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black" aria-label="User menu">
                    <div className="w-9 h-9 bg-neutral-100 rounded-full flex items-center justify-center border border-neutral-200">
                      {profile.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-neutral-600" />
                      )}
                    </div>
                    <span className="font-semibold">{profile.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-20">
                    {location.pathname !== '/admin' && (
                      <Link 
                        to="/dashboard" 
                        className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200" tabIndex={0}
                      >
                        <User className="inline h-4 w-4 mr-2" /> My Account
                      </Link>
                    )}
                    {location.pathname !== '/admin' && (
                      <Link 
                        to="/favorites" 
                        className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200" tabIndex={0}
                      >
                        <Heart className="inline h-4 w-4 mr-2" /> Favorites
                      </Link>
                    )}
                    {profile.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200" tabIndex={0}
                      >
                        <Settings className="inline h-4 w-4 mr-2" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-2 border-neutral-200" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors duration-200"
                      tabIndex={0}
                    >
                      <LogOut className="inline h-4 w-4 mr-2" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-neutral-700 hover:text-black transition-colors duration-200 font-semibold px-4 py-2 rounded-lg hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-black"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-black text-white px-6 py-2 rounded-full hover:bg-neutral-800 transition-colors duration-200 font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-black"
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
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
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
          <div className="md:hidden border-t border-neutral-200 bg-white animate-slide-down rounded-b-xl shadow-lg">
            <div className="px-2 pt-4 pb-6 space-y-2">
              <Link
                to="/browse"
                className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200 font-semibold"
                onClick={closeMobileMenu}
              >
                Browse
              </Link>
              {user && (
                <Link
                  to="/add-item"
                  className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200 font-semibold"
                  onClick={closeMobileMenu}
                >
                  <Plus className="inline h-4 w-4 mr-2" /> Sell
                </Link>
              )}
              {user && profile ? (
                <div className="border-t border-neutral-200 pt-4 mt-4">
                  <div className="px-3 py-3">
                    <div className="text-sm font-semibold text-black">{profile.name}</div>
                    <div className="text-sm text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full inline-block mt-1">{profile.points} pts</div>
                  </div>
                  {location.pathname !== '/admin' && (
                    <Link
                      to="/dashboard"
                      className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200 font-semibold"
                      onClick={closeMobileMenu}
                    >
                      My Account
                    </Link>
                  )}
                  {location.pathname !== '/admin' && (
                    <Link
                      to="/favorites"
                      className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200 font-semibold"
                      onClick={closeMobileMenu}
                    >
                      Favorites
                    </Link>
                  )}
                  {profile.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200 font-semibold"
                      onClick={closeMobileMenu}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors duration-200 font-semibold"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-neutral-200 pt-4 mt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-3 text-neutral-700 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors duration-200 font-semibold"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block mx-3 py-3 bg-black text-white rounded-lg text-center font-semibold hover:bg-neutral-800 transition-colors duration-200 shadow-md"
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