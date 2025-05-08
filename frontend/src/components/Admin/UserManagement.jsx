import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../../assets/clothin_logo.jpg'; // Make sure this path is correct

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "customer",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter]);

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

    const filterUsers = () => {
        let result = users;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(user => 
                user.name.toLowerCase().includes(term) || 
                user.email.toLowerCase().includes(term)
            );
        }
        
        if (roleFilter !== "all") {
            result = result.filter(user => user.role === roleFilter);
        }
        
        setFilteredUsers(result);
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

            setUsers(users.map((user) => (user._id === userId ? response.data.user : user)));
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    const generatePDFReport = () => {
        const doc = new jsPDF();
        
        // Create a canvas to process the logo
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.src = logo;
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const logoDataURL = canvas.toDataURL('image/jpeg');
            
            // Add logo to PDF (30mm width, maintain aspect ratio)
            const logoWidth = 30;
            const logoHeight = (img.height * logoWidth) / img.width;
            doc.addImage(logoDataURL, 'JPEG', 15, 10, logoWidth, logoHeight);
            
            // Report title and date
            doc.setFontSize(18);
            doc.text('User Management Report', 14, logoHeight + 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, logoHeight + 28);
            
            // Company address
            doc.text('E3, Isurupura, Malabe', 14, logoHeight + 36);
            
            // User table
            autoTable(doc, {
                startY: logoHeight + 45,
                head: [['Name', 'Email', 'Role', 'Created At']],
                body: filteredUsers.map(user => [
                    user.name,
                    user.email,
                    user.role,
                    new Date(user.createdAt).toLocaleDateString()
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255
                }
            });
            
            // Signing area
            doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
            doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
            
            // Save the PDF
            doc.save('User_Management_Report.pdf');
        };

        img.onerror = function() {
            console.error('Failed to load logo');
            // Fallback without logo
            doc.setFontSize(18);
            doc.text('User Management Report', 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
            doc.text('E3, Isurupura, Malabe', 14, 36);
            
            autoTable(doc, {
                startY: 45,
                head: [['Name', 'Email', 'Role', 'Created At']],
                body: filteredUsers.map(user => [
                    user.name,
                    user.email,
                    user.role,
                    new Date(user.createdAt).toLocaleDateString()
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255
                }
            });
            
            doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
            doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
            doc.save('User_Management_Report.pdf');
        };
    };

    const printReport = () => {
        const printWindow = window.open('', '_blank');
        
        // Convert logo to base64 for the print window
        const reader = new FileReader();
        reader.onload = function() {
            const logoBase64 = reader.result;
            
            printWindow.document.write(`
                <html>
                    <head>
                        <title>User Management Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { color: #333; }
                            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                            .logo { height: 50px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #2980b9; color: white; }
                            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
                            @media print {
                                button { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div>
                                <h1>User Management Report</h1>
                                <p>Generated on: ${new Date().toLocaleString()}</p>
                                <p>E3, Isurupura, Malabe</p>
                            </div>
                            <img src="${logoBase64}" alt="Company Logo" class="logo">
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredUsers.map(user => `
                                    <tr>
                                        <td>${user.name}</td>
                                        <td>${user.email}</td>
                                        <td>${user.role}</td>
                                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div class="footer">
                            <div>
                                <p>Manager Signature: ___________________</p>
                            </div>
                            <div>
                                <p>Date: ___________________</p>
                            </div>
                        </div>
                        
                        <button onclick="window.print()">Print Report</button>
                        <button onclick="window.close()">Close</button>
                    </body>
                </html>
            `);
            printWindow.document.close();
        };
        
        // Fetch the logo and convert to base64
        fetch(logo)
            .then(res => res.blob())
            .then(blob => reader.readAsDataURL(blob))
            .catch(error => {
                console.error('Error loading logo:', error);
                // Fallback without logo
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>User Management Report</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                h1 { color: #333; }
                                .header { margin-bottom: 20px; }
                                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                th { background-color: #2980b9; color: white; }
                                .footer { margin-top: 40px; display: flex; justify-content: space-between; }
                                @media print {
                                    button { display: none; }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>User Management Report</h1>
                                <p>Generated on: ${new Date().toLocaleString()}</p>
                                <p>E3, Isurupura, Malabe</p>
                            </div>
                            
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredUsers.map(user => `
                                        <tr>
                                            <td>${user.name}</td>
                                            <td>${user.email}</td>
                                            <td>${user.role}</td>
                                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            
                            <div class="footer">
                                <div>
                                    <p>Manager Signature: ___________________</p>
                                </div>
                                <div>
                                    <p>Date: ___________________</p>
                                </div>
                            </div>
                            
                            <button onclick="window.print()">Print Report</button>
                            <button onclick="window.close()">Close</button>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            });
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-6 text-center md:text-left">User Management</h2>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full p-2 border rounded"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select
                        className="w-full p-2 border rounded"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="customer">Customer</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={generatePDFReport}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        PDF Report
                    </button>
                    <button
                        onClick={printReport}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Print Report
                    </button>
                </div>
            </div>

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
                            <th className="py-3 px-4">Created At</th>
                            <th className="py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
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
                                    {new Date(user.createdAt).toLocaleDateString()}
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