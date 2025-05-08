import React, { useEffect, useState } from 'react';
import Hero from '../components/Layout/Hero';
import GenderCollectionSection from '../components/Products/GenderCollectoinSection';
import NewArrivals from '../components/Products/NewArrivals';
import ProductDetails from '../components/Products/ProductDetails';
import ProductGrid from '../components/Products/ProductGrid';
import FeaturedCollection from '../components/Products/FeaturedCollection';
import FeaturesSection from '../components/Products/FeaturesSection';
import PromotionalBanner from '../components/Advertisements/PromotionalBanner';
import DiscountAds from '../components/Advertisements/DiscountAds';
import axios from 'axios';
import { toast } from 'sonner';
import { getFullImageUrl } from '../utils/imageHelpers';

const Home = () => {
  const [bestSeller, setBestSeller] = useState(null);
  const [womenProducts, setWomenProducts] = useState([]);
  const [loading, setLoading] = useState({
    bestSeller: true,
    womenProducts: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch best seller
        const bestSellerRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000'}/api/products/best-seller`);
        const bestSellerWithUrls = {
          ...bestSellerRes.data,
          images: bestSellerRes.data.images.map(image => ({
            ...image,
            url: getFullImageUrl(image.url)
          }))
        };
        setBestSeller(bestSellerWithUrls);
        setLoading(prev => ({ ...prev, bestSeller: false }));

        // Fetch women's products
        const womenRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000'}/api/products?gender=Women&limit=8`);
        const womenProductsWithUrls = womenRes.data.map(product => ({
          ...product,
          images: product.images.map(image => ({
            ...image,
            url: getFullImageUrl(image.url)
          }))
        }));
        setWomenProducts(womenProductsWithUrls);
        setLoading(prev => ({ ...prev, womenProducts: false }));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load products");
        setLoading({ bestSeller: false, womenProducts: false });
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <PromotionalBanner />
      <Hero/>
      <GenderCollectionSection/>
      <DiscountAds />
      <NewArrivals/>
      
      {/* Best Seller Section */}
      <div className="container mx-auto">
        <h2 className="text-3xl text-center font-bold mb-4">
          Best seller
        </h2>
        {loading.bestSeller ? (
          <div className="text-center py-8">Loading best seller...</div>
        ) : bestSeller ? (
          <ProductGrid products={[bestSeller]} />
        ) : (
          <div className="text-center py-8">No best seller found</div>
        )}
      </div>

      {/* Women's Products Section */}
      <div className="container mx-auto">
        <h2 className="text-3xl text-center font-bold mb-4">
          Top Wears For Women
        </h2>
        {loading.womenProducts ? (
          <div className="text-center py-8">Loading products...</div>
        ) : (
          <ProductGrid products={womenProducts} />
        )}
      </div>

      <FeaturedCollection />
      <FeaturesSection />
    </div>
  );
};

export default Home;