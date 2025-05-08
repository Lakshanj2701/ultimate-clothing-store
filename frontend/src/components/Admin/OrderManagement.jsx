import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import Swal from "sweetalert2";
import logo from '../../assets/clothin_logo.jpg'; // Make sure this path is correct

// Set app element for accessibility
Modal.setAppElement('#root');

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OrderManagement = () => {
    // State declarations
    const [activeTab, setActiveTab] = useState('sales');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [salesData, setSalesData] = useState({
        daily: [],
        weekly: [],
        monthly: []
    });
    const [chartView, setChartView] = useState('daily');

    useEffect(() => {
        fetchOrders();
    }, []);

    // Process and format sales data for different time periods
    const processSalesData = (orders) => {
        const now = new Date();
        const daily = {};
        const weekly = {};
        const monthly = {};

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dayKey = date.toISOString().split('T')[0];
            daily[dayKey] = 0;
        }

        // Initialize last 4 weeks
        for (let i = 3; i >= 0; i--) {
            const weekKey = `Week ${i + 1}`;
            weekly[weekKey] = 0;
        }

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toLocaleString('default', { month: 'short' });
            monthly[monthKey] = 0;
        }

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            
            // Daily data
            const dayKey = orderDate.toISOString().split('T')[0];
            if (daily.hasOwnProperty(dayKey)) {
                daily[dayKey] += order.totalPrice;
            }

            // Weekly data
            const weekDiff = Math.floor((now - orderDate) / (7 * 24 * 60 * 60 * 1000));
            if (weekDiff < 4) {
                const weekKey = `Week ${4 - weekDiff}`;
                weekly[weekKey] += order.totalPrice;
            }

            // Monthly data
            const monthKey = orderDate.toLocaleString('default', { month: 'short' });
            if (monthly.hasOwnProperty(monthKey)) {
                monthly[monthKey] += order.totalPrice;
            }
        });

        setSalesData({
            daily: Object.entries(daily),
            weekly: Object.entries(weekly),
            monthly: Object.entries(monthly)
        });
    };

    // Fetch orders from the API
    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setOrders(response.data);
            processSalesData(response.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to fetch orders');
            setError('Failed to fetch orders');
            setLoading(false);
        }
    };

    // Handle order status updates
    const handleStatusChange = async (orderId, status) => {
        try {
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${orderId}`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            fetchOrders();
            toast.success('Order status updated successfully');
        } catch (err) {
            toast.error('Failed to update order status');
        }
    };

    // Handle order deletion with confirmation
    const handleDeleteOrder = (orderId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${orderId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    setOrders(orders.filter((order) => order._id !== orderId));
                    Swal.fire("Deleted!", "The order has been deleted.", "success");
                } catch (error) {
                    Swal.fire("Error!", "There was an issue deleting the order.", "error");
                }
            }
        });
    };

    // Get appropriate color classes for status badges
    const getStatusBadgeColor = (status) => {
        const colors = {
            'Processing': 'bg-yellow-100 text-yellow-800',
            'Shipped': 'bg-blue-100 text-blue-800',
            'Delivered': 'bg-green-100 text-green-800',
            'Cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Filter orders based on search term and status
    const filteredOrders = orders.filter(order => {
        const matchesSearch = (
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress?.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Chart configuration options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Sales Overview',
                font: {
                    size: 16
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value) => `Rs ${value.toFixed(2)}`
                }
            }
        }
    };

    const getChartData = () => {
        const data = salesData[chartView];
        return {
            labels: data.map(([label]) => label),
            datasets: [
                {
                    label: 'Sales Amount',
                    data: data.map(([_, value]) => value),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                }
            ]
        };
    };

    // Generate PDF report for orders with logo
    const generatePDF = () => {
        const doc = new jsPDF();
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        
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
            doc.text('Order Management Report', 14, logoHeight + 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, logoHeight + 28);
            doc.text(`Total Revenue: Rs ${totalRevenue.toFixed(2)}`, 14, logoHeight + 36);
            
            // Order table
            autoTable(doc, {
                startY: logoHeight + 45,
                head: [['Order ID', 'Customer', 'Total Price', 'Status', 'Shipping Address', 'Quantity']],
                body: filteredOrders.map(order => [
                    order._id,
                    order.user?.name || 'N/A',
                    `Rs.${order.totalPrice.toFixed(2)}`,
                    order.status,
                    order.shippingAddress?.address || 'N/A',
                    order.orderItems?.map(item => item.quantity).join(', ') || '0'
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3
                }
            });
            
            // Signing area
            doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
            doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
            
            // Save the PDF
            doc.save('Order_Management_Report.pdf');
            toast.success('Report generated successfully');
        };

        img.onerror = function() {
            console.error('Failed to load logo');
            // Fallback without logo
            doc.setFontSize(18);
            doc.text('Order Management Report', 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
            doc.text(`Total Revenue: Rs ${totalRevenue.toFixed(2)}`, 14, 36);
            
            autoTable(doc, {
                startY: 45,
                head: [['Order ID', 'Customer', 'Total Price', 'Status', 'Shipping Address', 'Quantity']],
                body: filteredOrders.map(order => [
                    order._id,
                    order.user?.name || 'N/A',
                    `Rs.${order.totalPrice.toFixed(2)}`,
                    order.status,
                    order.shippingAddress?.address || 'N/A',
                    order.orderItems?.map(item => item.quantity).join(', ') || '0'
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 3
                }
            });
            
            doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
            doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
            doc.save('Order_Management_Report.pdf');
            toast.success('Report generated successfully');
        };
    };

    // Print report function with logo
    const printReport = () => {
        const printWindow = window.open('', '_blank');
        
        // Convert logo to base64 for the print window
        const reader = new FileReader();
        reader.onload = function() {
            const logoBase64 = reader.result;
            
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Order Management Report</title>
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
                                <h1>Order Management Report</h1>
                                <p>Generated on: ${new Date().toLocaleString()}</p>
                                <p>E3, Isurupura, Malabe</p>
                            </div>
                            <img src="${logoBase64}" alt="Company Logo" class="logo">
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Total Price</th>
                                    <th>Status</th>
                                    <th>Shipping Address</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredOrders.map(order => `
                                    <tr>
                                        <td>${order._id}</td>
                                        <td>${order.user?.name || 'N/A'}</td>
                                        <td>Rs.${order.totalPrice.toFixed(2)}</td>
                                        <td>${order.status}</td>
                                        <td>${order.shippingAddress?.address || 'N/A'}</td>
                                        <td>${order.orderItems?.map(item => item.quantity).join(', ') || '0'}</td>
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
                            <title>Order Management Report</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                h1 { color: #333; }
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
                            <h1>Order Management Report</h1>
                            <p>Generated on: ${new Date().toLocaleString()}</p>
                            <p>E3, Isurupura, Malabe</p>
                            
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Total Price</th>
                                        <th>Status</th>
                                        <th>Shipping Address</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredOrders.map(order => `
                                        <tr>
                                            <td>${order._id}</td>
                                            <td>${order.user?.name || 'N/A'}</td>
                                            <td>Rs.${order.totalPrice.toFixed(2)}</td>
                                            <td>${order.status}</td>
                                            <td>${order.shippingAddress?.address || 'N/A'}</td>
                                            <td>${order.orderItems?.map(item => item.quantity).join(', ') || '0'}</td>
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

    // Sales Overview Component
    const SalesOverview = () => {
        const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const completedOrders = orders.filter(order => order.status === 'Delivered').length;
        const pendingOrders = orders.filter(order => order.status === 'Processing').length;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">Rs {totalSales.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Completed Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-green-600">{completedOrders}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
                    <p className="mt-2 text-3xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>
            </div>
        );
    };

    // Order Details Modal Component
    const OrderModal = () => (
        <Transition appear show={isModalOpen} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-10 overflow-y-auto"
                onClose={() => setIsModalOpen(false)}
            >
                <div className="min-h-screen px-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
                    </Transition.Child>

                    <span className="inline-block h-screen align-middle" aria-hidden="true">
                        &#8203;
                    </span>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <Dialog.Title
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900"
                            >
                                Order Details
                            </Dialog.Title>
                            {selectedOrder && (
                                <div className="mt-4">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Order ID</p>
                                                <p className="mt-1">{selectedOrder._id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Customer</p>
                                                <p className="mt-1">{selectedOrder.user?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Total Price</p>
                                                <p className="mt-1">Rs.{selectedOrder.totalPrice}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Status</p>
                                                <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                                                    {selectedOrder.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );

    // Loading and Error States
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="text-center p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
        </div>
    );

    // Main Component Render
    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Manage and track all customer orders
                </p>
            </div>
            <Modal
            isOpen={isImageModalOpen}
            onRequestClose={() => setIsImageModalOpen(false)}
            contentLabel="Custom Product Image"
            className="fixed inset-0 flex items-center justify-center p-4"
            overlayClassName="fixed inset-0 bg-black bg-opacity-75"
        >
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative">
                <button 
                    onClick={() => setIsImageModalOpen(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <XMarkIcon className="h-8 w-8" />
                </button>
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Custom Product Image</h2>
                    {selectedImage && (
                        <img 
                            src={selectedImage} 
                            alt="Custom Product" 
                            className="max-w-full max-h-[70vh] mx-auto"
                        />
                    )}
                </div>
            </div>
        </Modal>
            {/* Tabbed Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`py-4 px-1 text-sm font-medium ${
                            activeTab === 'sales' 
                                ? 'text-blue-600 border-blue-600 border-b-2' 
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent border-b-2'
                        }`}
                    >
                        Sales Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`py-4 px-1 text-sm font-medium ${
                            activeTab === 'orders' 
                                ? 'text-blue-600 border-blue-600 border-b-2' 
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-transparent border-b-2'
                        }`}
                    >
                        Order Details
                    </button>
                </nav>
            </div>

            {/* Sales Analytics Tab */}
            {activeTab === 'sales' && (
                <>
                    <SalesOverview />

                    <div className="mb-8 bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Sales Overview</h3>
                            <div className="flex space-x-2">
                                {['daily', 'weekly', 'monthly'].map((view) => (
                                    <button
                                        key={view}
                                        onClick={() => setChartView(view)}
                                        className={`px-3 py-1 rounded capitalize ${
                                            chartView === view 
                                                ? 'bg-blue-500 text-white' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {view}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-[300px]">
                            <Bar options={chartOptions} data={getChartData()} />
                        </div>
                    </div>
                </>
            )}

            {/* Order Management Tab */}
            {activeTab === 'orders' && (
                <>
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={generatePDF}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                            >
                                <DocumentTextIcon className="h-5 w-5 flex-shrink-0" />
                                <span className="sm:inline">PDF Report</span>
                            </button>
                            <button
                                onClick={printReport}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
                            >
                                <DocumentTextIcon className="h-5 w-5 flex-shrink-0" />
                                <span className="sm:inline">Print Report</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile/Tablet View */}
                    <div className="lg:hidden">
                        {filteredOrders.map((order) => (
                            <div 
                                key={order._id} 
                                className="bg-white shadow rounded-lg p-4 hover:shadow-md transition-shadow duration-300 mb-4"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <div className="font-semibold text-gray-900">
                                        Order #{order._id}
                                    </div>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className={`text-xs rounded-full px-2 py-1 font-semibold ${getStatusBadgeColor(order.status)}`}
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Price:</span>
                                        <span className="font-medium">Rs. {order.totalPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping Address:</span>
                                        <span className="text-right">{order.shippingAddress?.address}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span>{order.orderItems?.map(item => item.quantity).join(', ')}</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => handleDeleteOrder(order._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shipping Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Custom Image</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order._id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.shippingAddress?.address}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs.{order.totalPrice.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderItems?.map(item => item.quantity).join(', ')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
  {order.orderItems?.map((item, index) => (
    item.customImage && (
      <button 
        key={index}
        onClick={() => {
          setSelectedImage(`${import.meta.env.VITE_BACKEND_URL}${item.customImage}`);
          setIsImageModalOpen(true);
        }}
        className="hover:opacity-75 transition-opacity"
      >
        <img 
          src={`${import.meta.env.VITE_BACKEND_URL}${item.customImage}`}
          alt="Custom product"
          className="h-10 w-10 rounded-full object-cover"
        />
      </button>
    )
  ))}
</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`text-sm rounded-full px-3 py-1 font-semibold ${getStatusBadgeColor(order.status)}`}>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleDeleteOrder(order._id)} className="text-red-600 hover:text-red-900">
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
            
            <OrderModal />
        </div>
    );
};

export default OrderManagement;