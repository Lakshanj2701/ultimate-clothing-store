import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchCart = async () => {
    try {
      setLoading(true);
      let response;
      
      if (user) {
        response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
          params: { userId: user._id }
        });
      } else {
        const guestId = localStorage.getItem('guestId') || generateGuestId();
        localStorage.setItem('guestId', guestId);
        response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
          params: { guestId }
        });
      }

      setCart(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cart');
      toast.error('Failed to load your cart');
    } finally {
      setLoading(false);
    }
  };

  const generateGuestId = () => {
    return 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now();
  };

  const addToCart = async (productId, quantity, size, color, description = '', customImage = null) => {
    try {
      setLoading(true);
      
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('quantity', quantity);
      formData.append('size', size);
      formData.append('color', color);
      formData.append('description', description);
      
      if (customImage) {
        formData.append('customImage', customImage);
      }

      // Add user/guest identifier
      if (user) {
        formData.append('userId', user._id);
      } else {
        const guestId = localStorage.getItem('guestId') || generateGuestId();
        localStorage.setItem('guestId', guestId);
        formData.append('guestId', guestId);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setCart(response.data);
      toast.success('Product added to cart!');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add to cart';
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity, size, color) => {
    try {
      setLoading(true);
      const payload = { productId, quantity, size, color };
      
      if (user) {
        payload.userId = user._id;
      } else {
        const guestId = localStorage.getItem('guestId');
        if (!guestId) throw new Error('No guest cart found');
        payload.guestId = guestId;
      }

      const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, payload);
      setCart(response.data);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to update cart';
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId, size, color) => {
    try {
      setLoading(true);
      const payload = { productId, size, color };
      
      if (user) {
        payload.userId = user._id;
      } else {
        const guestId = localStorage.getItem('guestId');
        if (!guestId) throw new Error('No guest cart found');
        payload.guestId = guestId;
      }

      const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, { 
        data: payload 
      });
      setCart(response.data);
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove from cart';
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const mergeCarts = async (guestId) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`,
        { guestId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      setCart(response.data);
      localStorage.removeItem('guestId');
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to merge carts';
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      if (user) {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
          data: { userId: user._id }
        });
      } else {
        const guestId = localStorage.getItem('guestId');
        if (guestId) {
          await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            data: { guestId }
          });
        }
      }
      setCart(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to clear cart';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user?._id]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        mergeCarts,
        fetchCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};