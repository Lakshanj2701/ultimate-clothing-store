import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

export const userService = {
    // Get all users
    getAllUsers: async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/users`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to fetch users';
        }
    },

    // Add new user
    addUser: async (userData) => {
        try {
            const response = await axios.post(
                `${API_URL}/admin/users`,
                userData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to add user';
        }
    },

    // Update user role
    updateUserRole: async (userId, role) => {
        try {
            const response = await axios.put(
                `${API_URL}/admin/users/${userId}`,
                { role },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data?.message || 'Failed to update user role';
        }
    },

    // Delete user
    deleteUser: async (userId) => {
        try {
            await axios.delete(`${API_URL}/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            throw error.response?.data?.message || 'Failed to delete user';
        }
    }
};