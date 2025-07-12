import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="bg-black text-white pt-12 pb-6 px-4">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
      {/* Shop */}
      <div>
        <h3 className="font-bold mb-4">Shop</h3>
        <ul className="space-y-2">
          <li><Link to="/browse?category=Ladies" className="hover:underline">Ladies</Link></li>
          <li><Link to="/browse?category=Men" className="hover:underline">Men</Link></li>
          <li><Link to="/browse?category=Kids" className="hover:underline">Kids</Link></li>
          <li><Link to="/browse?category=Home" className="hover:underline">Home</Link></li>
          <li><Link to="/magazine" className="hover:underline">Magazine</Link></li>
        </ul>
      </div>
      {/* Corporate Info */}
      <div>
        <h3 className="font-bold mb-4">Corporate Info</h3>
        <ul className="space-y-2">
          <li><a href="#" className="hover:underline">Careers</a></li>
          <li><a href="#" className="hover:underline">About ReWear</a></li>
          <li><a href="#" className="hover:underline">Sustainability</a></li>
          <li><a href="#" className="hover:underline">Press</a></li>
          <li><a href="#" className="hover:underline">Investor Relations</a></li>
          <li><a href="#" className="hover:underline">Corporate Governance</a></li>
        </ul>
      </div>
      {/* Help */}
      <div>
        <h3 className="font-bold mb-4">Help</h3>
        <ul className="space-y-2">
          <li><a href="#" className="hover:underline">Customer Service</a></li>
          <li><a href="#" className="hover:underline">My ReWear</a></li>
          <li><a href="#" className="hover:underline">Find a Store</a></li>
          <li><a href="#" className="hover:underline">Legal & Privacy</a></li>
          <li><a href="#" className="hover:underline">Contact</a></li>
          <li><a href="#" className="hover:underline">Secure Shopping</a></li>
          <li><a href="#" className="hover:underline">Cookie Notice</a></li>
          <li><a href="#" className="hover:underline">Cookie Settings</a></li>
        </ul>
      </div>
      {/* Newsletter/Signup */}
      <div>
        <h3 className="font-bold mb-4">Stay in the Loop</h3>
        <p className="mb-2">Sign up now and be the first to know about exclusive offers, latest fashion news & style tips!</p>
        <a href="#" className="underline font-medium">Read More</a>
      </div>
    </div>
    {/* Bottom bar */}
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mt-12 pt-8 border-t border-neutral-800">
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        <span className="font-extrabold text-2xl tracking-tight">ReWear</span>
      </div>
      <div className="text-sm text-neutral-300 font-bold">
        INDIA (Rs.)
      </div>
    </div>
  </footer>
);

export default Footer; 