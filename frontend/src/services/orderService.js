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
                `${API_URL}/admin/orders/${orderId}`,  // Removed /status
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
            console.error('Error updating order:', error.response?.data);
            throw error.response?.data?.message || 'Failed to update order status';
        }
    }
};