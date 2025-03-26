import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers([...users, response.data.user]);
            setFormData({ name: "", email: "", password: "", role: "customer" });
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(users.filter((user) => user._id !== userId));
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}`,
                { role: newRole },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            // Update the user's role in the local state
            setUsers(users.map((user) => (user._id === userId ? response.data.user : user)));
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-6 text-center md:text-left">User Management</h2>

            {/* Add New User Form */}
            <div className="p-4 md:p-6 rounded-lg mb-6 bg-white shadow-md">
                <h3 className="text-lg font-bold mb-4 text-center md:text-left">Add New User</h3>
                <form onSubmit={handleAddUser} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1">Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    >
                        Add User
                    </button>
                </form>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="min-w-full text-left text-gray-500">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-900 whitespace-nowrap">
                                    {user.name}
                                </td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        className="p-2 border rounded"
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
