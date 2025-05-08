import React, { useState, useEffect } from 'react';
import { FaBars, FaBox, FaUsers, FaShoppingCart, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import AdminSidebar from '../components/Admin/AdminSidebar';
import { Outlet } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminHomePage = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        salesData: []
    });
    const [loading, setLoading] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [
                    usersRes, 
                    productsRes, 
                    ordersRes, 
                    checkoutRes
                ] = await Promise.all([
                    axios.get('http://localhost:9000/api/admin/users', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:9000/api/products'),
                    axios.get('http://localhost:9000/api/admin/orders', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:9000/api/admin/checkout', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                // Calculate total revenue from paid checkouts
                const totalRevenue = checkoutRes.data.reduce((sum, order) => 
                    order.paymentStatus === 'paid' ? sum + order.totalPrice : sum, 0
                );

                // Get recent 5 orders
                const recentOrders = ordersRes.data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5);

                // Process sales data for chart (group by month)
                const salesByMonth = {};
                checkoutRes.data.forEach(order => {
                    if (order.paymentStatus === 'paid') {
                        const month = new Date(order.createdAt).toLocaleString('default', { month: 'short' });
                        salesByMonth[month] = (salesByMonth[month] || 0) + order.totalPrice;
                    }
                });

                setDashboardData({
                    totalUsers: usersRes.data.length,
                    totalProducts: productsRes.data.length,
                    totalOrders: ordersRes.data.length,
                    totalRevenue,
                    recentOrders,
                    salesData: Object.entries(salesByMonth)
                });
                setLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Sales chart data
    const salesChartData = {
        labels: dashboardData.salesData.map(([month]) => month),
        datasets: [
            {
                label: 'Sales (Rs)',
                data: dashboardData.salesData.map(([_, amount]) => amount),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
            {/* Mobile Toggle Button */}
            <div className="flex md:hidden p-4 bg-indigo-800 text-white z-20 shadow-md">
                <button 
                    onClick={toggleSidebar}
                    className="flex items-center focus:outline-none"
                >
                    <FaBars size={24} />
                </button>
                <h1 className="ml-4 text-xl font-medium">Admin Dashboard</h1> 
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}



            {/* Main content */}
            <div className="flex-grow p-6 overflow-auto">
                {/* Dashboard Overview (shown only on dashboard route) */}
                {window.location.pathname === '/admin' && (
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                        <FaUsers size={24} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total Users</p>
                                        <h3 className="text-2xl font-bold">{dashboardData.totalUsers}</h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                        <FaBox size={24} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total Products</p>
                                        <h3 className="text-2xl font-bold">{dashboardData.totalProducts}</h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                                        <FaShoppingCart size={24} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total Orders</p>
                                        <h3 className="text-2xl font-bold">{dashboardData.totalOrders}</h3>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                        <FaMoneyBillWave size={24} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Total Revenue</p>
                                        <h3 className="text-2xl font-bold">Rs {dashboardData.totalRevenue.toFixed(2)}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Sales Chart */}
                        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Monthly Sales</h3>
                                <FaChartLine className="text-blue-500" size={20} />
                            </div>
                            <div className="h-64">
                                <Bar 
                                    data={salesChartData} 
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                            },
                                        },
                                    }} 
                                />
                            </div>
                        </div>
                        
                        {/* Recent Orders Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {dashboardData.recentOrders.map(order => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{order._id.slice(0, 8)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {order.user?.name || 'Guest'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    Rs {order.totalPrice.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Nested routes content */}
                <Outlet />
            </div>
        </div>
    );
};

export default AdminHomePage;