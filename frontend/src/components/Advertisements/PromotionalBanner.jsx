// src/components/Advertisements/PromotionalBanner.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PromotionalBanner = () => {
  return (
    <div className="bg-gray-100 py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-2 md:mb-0">
            <span className="font-bold">LIMITED TIME OFFER:</span> Use code <span className="font-bold">ULTIMATE25</span> for 25% off your purchase!
          </div>
          <Link 
            to="/collections/sale" 
            className="inline-block bg-black text-white px-4 py-1 rounded text-sm hover:bg-gray-800 transition duration-300"
          >
            Shop Sale
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;