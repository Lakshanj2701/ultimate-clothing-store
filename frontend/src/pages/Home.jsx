// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import Hero from '../components/Layout/Hero';
import GenderCollectionSection from '../components/Products/GenderCollectionSection';
import NewArrivals from '../components/Products/NewArrivals';
import ProductDetails from '../components/Products/ProductDetails';
import ProductGrid from '../components/Products/ProductGrid';
import FeaturedCollection from '../components/Products/FeaturedCollection';
import FeaturesSection from '../components/Products/FeaturesSection';

// Import advertisement components
import PromotionalBanner from '../components/Advertisements/PromotionalBanner';
import DiscountAds from '../components/Advertisements/DiscountAds'; // Keep this
import FeaturedDeals from '../components/Advertisements/FeaturedDeals'; // Add this import

const Home = () => {
  const [products, setProducts] = useState([]);

  // Placeholder data for products
  const placeholderProducts = [
    {
      _id: 1,
      name: "Product 1",
      price: 100,
      images: [{ url: "https://picsum.photos/500/500?random=7" }],
    },
    // Other products...
  ];

  useEffect(() => {
    setProducts(placeholderProducts);
  }, []);

  return (
    <div>
      {/* Top promotional banner */}
      <PromotionalBanner />

      {/* Hero Section */}
      <Hero />

      {/* Gender Collection Section */}
      <GenderCollectionSection />

      {/* Discount Ads Section (only the ads and not the form) */}
      <DiscountAds />

      {/* New Arrivals Section */}
      <NewArrivals />

      {/* Best Seller Section */}
      <h2 className="text-3xl text-center font-bold mb-4">Best Seller</h2>
      <ProductDetails />

      {/* Featured Deals Section */}
      <FeaturedDeals /> {/* This will now render correctly */}

      {/* Featured Collection Section */}
      <FeaturedCollection />

      {/* Features Section */}
      <FeaturesSection />
    </div>
  );
};

export default Home;
