import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

export const orderService = {
    // Get all orders (admin only)
    getAllOrders: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/orders`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch orders';
        }
    },

    // Update order status
    updateOrderStatus: async (orderId, status) => {
        try {
            const response = await axios.put(
                `${API_URL}/admin/orders/${orderId}`,
                { status },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update order status';
        }
    },

    // Update order details
    updateOrderDetails: async (orderId, updateData) => {
        try {
            const response = await axios.put(
                `${API_URL}/admin/orders/${orderId}/details`,
                updateData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update order details';
            console.error('Update order details error:', error);
            throw new Error(errorMessage);
        }
    },

    // Delete order
    deleteOrder: async (orderId) => {
        try {
            const response = await axios.delete(`${API_URL}/admin/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete order';
        }
    },

    // Get single order details
    getOrderDetails: async (orderId) => {
        try {
            const response = await axios.get(`${API_URL}/admin/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch order details';
        }
    }
};