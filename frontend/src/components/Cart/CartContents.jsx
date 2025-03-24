import React, { useState, useEffect } from 'react';
import { RiDeleteBin3Line } from 'react-icons/ri';
import axios from 'axios';

const CartContents = () => {
  const [cart, setCart] = useState({ products: [], totalPrice: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get user ID and guest ID from localStorage or context
  const userId = localStorage.getItem('userId');
  const guestId = localStorage.getItem('guestId') || `guest_${Date.now()}`;
  
  // If no guestId exists yet, save it
  useEffect(() => {
    if (!localStorage.getItem('guestId')) {
      localStorage.setItem('guestId', guestId);
    }
  }, []);

  // Get the correct backend URL from .env
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';
  
  console.log("Using backend URL:", BACKEND_URL); // Debugging

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      console.log(`Fetching cart with params: userId=${userId}, guestId=${guestId}`); // Debugging

      const response = await axios.get(`${BACKEND_URL}/api/cart`, {
        params: { userId, guestId },
        withCredentials: true // Include credentials if needed
      });
      
      console.log("Cart response:", response.data); // Debugging
      setCart(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err.response?.data || err.message);
      
      // Handle 404 specially - this is expected for new users
      if (err.response?.status === 404) {
        setCart({ products: [], totalPrice: 0 });
      } else {
        setError('Failed to load cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateQuantity = async (productId, size, color, newQuantity) => {
    try {
      const payload = {
        productId,
        quantity: newQuantity,
        size,
        color,
        userId,
        guestId
      };
      
      console.log("Updating quantity with payload:", payload); // Debugging
      
      const response = await axios.put(`${BACKEND_URL}/api/cart`, payload, {
        withCredentials: true
      });
      
      setCart(response.data);
    } catch (err) {
      console.error('Error updating quantity:', err.response?.data || err.message);
      setError('Failed to update quantity. Please try again.');
    }
  };

  // Remove product from cart
  const removeProduct = async (productId, size, color) => {
    try {
      const payload = {
        productId,
        size,
        color,
        userId,
        guestId
      };
      
      console.log("Removing product with payload:", payload); // Debugging
      
      const response = await axios.delete(`${BACKEND_URL}/api/cart`, {
        data: payload,
        withCredentials: true
      });
      
      setCart(response.data);
    } catch (err) {
      console.error('Error removing product:', err.response?.data || err.message);
      setError('Failed to remove product. Please try again.');
    }
  };

  // Load cart data on component mount
  useEffect(() => {
    fetchCart();
  }, [userId, guestId]);

  // Initialize dummy products if there are none yet
  const handleAddDummyProduct = async () => {
    try {
      const dummyProduct = {
        productId: "65f5a5a5c26219485abcd123", // Replace with a valid MongoDB ID from your products
        quantity: 1,
        size: "M",
        color: "Black",
        userId,
        guestId
      };
      
      const response = await axios.post(`${BACKEND_URL}/api/cart`, dummyProduct, {
        withCredentials: true
      });
      
      setCart(response.data);
    } catch (err) {
      console.error('Error adding product:', err.response?.data || err.message);
      setError('Failed to add product. Please try again.');
    }
  };

  if (loading) {
    return <div className="py-8 text-center">Loading cart...</div>;
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={fetchCart}>
          Try Again
        </button>
      </div>
    );
  }

  if (!cart || cart.products.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4">Your cart is empty.</p>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddDummyProduct}>
          Add Sample Product (Testing)
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {cart.products.map((product, index) => (
        <div key={index} className="flex place-items-start justify-between py-4">
          <div className="flex items-start">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover mr-4 rounded"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200?text=No+Image';
              }}
            />
            <div className="ml-4 flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">
                Size: {product.size} | Color: {product.color}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <button 
                  className="border rounded px-2 py-1 text-xl font-medium"
                  onClick={() => updateQuantity(
                    product.productId, 
                    product.size, 
                    product.color, 
                    Math.max(1, product.quantity - 1)
                  )}
                >
                  -
                </button>
                <span className="text-sm">{product.quantity}</span>
                <button 
                  className="border rounded px-2 py-1 text-xl font-medium"
                  onClick={() => updateQuantity(
                    product.productId, 
                    product.size, 
                    product.color, 
                    product.quantity + 1
                  )}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-semibold">${product.price?.toLocaleString()}</p>
            <button 
              className="mt-2 text-red-500 hover:text-red-700"
              onClick={() => removeProduct(product.productId, product.size, product.color)}
            >
              <RiDeleteBin3Line size={20} />
            </button>
          </div>
        </div>
      ))}
      
      <div className="pt-4 mt-4">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total:</span>
          <span>${cart.totalPrice?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default CartContents;