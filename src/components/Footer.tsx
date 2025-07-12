import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="bg-neutral-900 text-white py-8 mt-16">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
      <div className="mb-4 md:mb-0">
        <span className="font-bold text-lg">ReWear</span> &copy; {new Date().getFullYear()}
      </div>
      <nav className="flex space-x-6">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/browse" className="hover:underline">Browse</Link>
        <a href="#about" className="hover:underline">About</a>
        <a href="#contact" className="hover:underline">Contact</a>
      </nav>
    </div>
  </footer>
);

export default Footer; 