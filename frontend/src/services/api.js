import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000/api',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for adding auth token and handling requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response.data; // Return only the data part of the response
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    
    // Handle specific error statuses
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Forbidden: You don\'t have permission to access this resource');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error occurred');
          break;
        default:
          console.error('An error occurred:', error.message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Advertisement service
export const adService = {
  async getAll() {
    try {
      const response = await api.get('/admin/advertisements');
      return response;
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      throw error;
    }
  },

  async create(adData) {
    try {
      const formData = new FormData();
      formData.append('title', adData.title);
      formData.append('description', adData.description);
      formData.append('discountAmount', adData.discountAmount || 0);
      if (adData.image) {
        formData.append('image', adData.image);
      }

      const response = await api.post('/admin/advertisements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error creating advertisement:', error);
      throw error;
    }
  },

  async delete(adId) {
    try {
      const response = await api.delete(`/admin/advertisements/${adId}`);
      return response;
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      throw error;
    }
  },

  async update(adId, adData) {
    try {
      const formData = new FormData();
      formData.append('title', adData.title);
      formData.append('description', adData.description);
      formData.append('discountAmount', adData.discountAmount || 0);
      if (adData.image) {
        formData.append('image', adData.image);
      }

      const response = await api.put(`/admin/advertisements/${adId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error updating advertisement:', error);
      throw error;
    }
  },
};

export const reviewService = {
  async getProductReviews(productId) {
    try {
      const response = await api.get(`/api/reviews/product/${productId}`);
      return response;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  async createReview(productId, reviewData) {
    try {
      const response = await api.post(`/api/reviews/${productId}`, reviewData);
      return response;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  async updateReview(reviewId, reviewData) {
    try {
      const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
      return response;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  async deleteReview(reviewId) {
    try {
      const response = await api.delete(`/api/reviews/${reviewId}`);
      return response;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }
};

// Export the configured axios instance as default
export default api;