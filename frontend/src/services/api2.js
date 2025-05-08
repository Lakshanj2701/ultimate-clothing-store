import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

export const adService = {
  async getAll() {
    const response = await axios.get(`${BASE_URL}/api/admin/advertisements`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Add token for protected routes
      },
    });
    return response.data;
  },

  async create(adData) {
    const formData = new FormData();
    formData.append('title', adData.title);
    formData.append('description', adData.description);
    formData.append('discountAmount', adData.discountAmount || 0);
    if (adData.image) {
      formData.append('image', adData.image);
    }

    const response = await axios.post(`${BASE_URL}/api/admin/advertisements`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async delete(adId) {
    const response = await axios.delete(`${BASE_URL}/api/admin/advertisements/${adId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  async update(adId, adData) {
    const formData = new FormData();
    formData.append('title', adData.title);
    formData.append('description', adData.description);
    formData.append('discountAmount', adData.discountAmount || 0);
    if (adData.image) {
      formData.append('image', adData.image);
    }

    const response = await axios.put(`${BASE_URL}/api/admin/advertisements/${adId}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};