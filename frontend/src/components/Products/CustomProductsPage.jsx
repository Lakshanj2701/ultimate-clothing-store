// CustomProductsPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductGrid from "../Products/ProductGrid";
import { toast } from "sonner";
import { getFullImageUrl } from "../../utils/imageHelpers";

const CustomProductsPage = () => {
  const [customProducts, setCustomProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomProducts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000'}/api/products?category=Custom`);
        const productsWithUrls = response.data.map((product) => ({
          ...product,
          images: product.images.map((image) => ({
            ...image,
            url: getFullImageUrl(image.url),
          })),
        }));
        setCustomProducts(productsWithUrls);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching custom products:", error);
        toast.error("Failed to load custom products");
        setLoading(false);
      }
    };

    fetchCustomProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Custom Products</h1>
      {loading ? (
        <div className="text-center py-8">Loading custom products...</div>
      ) : (
        <ProductGrid products={customProducts} />
      )}
    </div>
  );
};

export default CustomProductsPage;
