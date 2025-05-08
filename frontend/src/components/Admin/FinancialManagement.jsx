import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from 'react-modal';
import logo from '../../assets/clothin_logo.jpg'; // Make sure this path is correct

// Set app element for accessibility
Modal.setAppElement('#root');

const FinanceManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [dateRange, setDateRange] = useState('all');
    const [chartData, setChartData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [dateRange]);

    useEffect(() => {
        processChartData();
    }, [transactions]);

    const processChartData = () => {
        const filteredTransactions = filterTransactionsByDateRange(transactions);
        const aggregatedData = aggregateDataByDate(filteredTransactions);
        setChartData(aggregatedData);
    }

    const filterTransactionsByDateRange = (transactions) => {
        const now = new Date();
        return transactions.filter((transaction) => {
            const transactionDate = new Date(transaction.date);
            switch (dateRange) {
                case 'week':
                    const lastWeek = new Date();
                    lastWeek.setDate(now.getDate() - 7);
                    return transactionDate >= lastWeek;
                case 'month':
                    const lastMonth = new Date();
                    lastMonth.setMonth(now.getMonth() - 1);
                    return transactionDate >= lastMonth;
                case 'year':
                    const lastYear = new Date();
                    lastYear.setFullYear(now.getFullYear() - 1);
                    return transactionDate >= lastYear;
                default:
                    return true;
            }
        });
    };

    const aggregateDataByDate = (transactions) => {
        const aggregated = transactions.reduce((acc, transaction) => {
            const date = transaction.date; 
            const amount = transaction.amount;
            if (!acc[date]) {
                acc[date] = { date, amount: 0 };
            }
            acc[date].amount += amount;
            return acc;
        }, {});

        return Object.values(aggregated).map((data) => ({
            date: data.date,
            amount: data.amount
        }));
    };

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token'); 
            if (!token) throw new Error("No authentication token found");

            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/checkout`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const checkoutorders = response.data.map(checkOut => ({
                id: checkOut._id,
                user: { 
                    name: checkOut.user?.name || 'Anonymous',
                    image: checkOut.user?.image || null
                },
                amount: checkOut.totalPrice || 0,
                status: checkOut.paymentStatus || 'pending',
                date: checkOut.createdAt ? new Date(checkOut.createdAt).toISOString().split('T')[0] : '-',
                paymentMethod: checkOut.paymentMethod || '-',
                paidAt: checkOut.paidAt || null,
                bankTransferProof: checkOut.bankTransferProof || null
            }));

            setTransactions(checkoutorders);
            calculateTotalRevenue(checkoutorders);
            setLoading(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch financial data');
            setLoading(false);
        }
    };

    const calculateTotalRevenue = (orders) => {
        const total = orders.reduce((sum, order) => 
            order.status === 'paid' ? sum + order.amount : sum, 0
        );
        setTotalRevenue(total);
    };

    const filteredAndSearchedTransactions = useMemo(() => {
        const filteredByDateRange = filterTransactionsByDateRange(transactions);
        return filteredByDateRange.filter(transaction => 
            Object.values(transaction).some(value => 
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            ) ||
            transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, dateRange, searchTerm]);

    const handleDeleteTransaction = async (transactionId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this transaction deletion!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token'); 
                if (!token) {
                    toast.error('Authentication token missing. Please log in again.');
                    return;
                }
        
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/checkout/${transactionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
        
                setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
        
                Swal.fire(
                    'Deleted!',
                    'The transaction has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error('Error:', error);
                Swal.fire(
                    'Error!',
                    'Failed to delete transaction.',
                    'error'
                );
            }
        }
    };

    const handleStatusChange = async (transactionId, newStatus) => {
        try {
            const token = localStorage.getItem('token'); 
    
            if (!token) {
                toast.error('Authentication token missing. Please log in again.');
                return;
            }
    
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/admin/checkout/${transactionId}`,
                { paymentStatus: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}` 
                    }
                }
            );

            toast.success(`Transaction status updated to ${newStatus}`);
            fetchTransactions();
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update transaction status');
        }
    };

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setModalIsOpen(true);
    };

    const closeImageModal = () => {
        setModalIsOpen(false);
        setSelectedImage('');
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
            doc.text('Financial Management Report', 14, logoHeight + 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, logoHeight + 28);
            doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, logoHeight + 36);
            
            // Company address
            doc.text('E3, Isurupura, Malabe', 14, logoHeight + 44);
            
            // Transaction table
            autoTable(doc, {
                startY: logoHeight + 55,
                head: [['ID', 'Customer', 'Amount ($)', 'Status', 'Date', 'Payment Method', 'Proof']],
                body: filteredAndSearchedTransactions.map(t => [
                    t.id,
                    t.user.name,
                    t.amount.toFixed(2),
                    t.status,
                    t.date,
                    t.paymentMethod,
                    t.paymentMethod === 'BankTransfer' && t.bankTransferProof ? 'Yes' : 'No'
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255
                },
                styles: { fontSize: 8 }
            });
            
            // Signing area
            doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
            doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
            
            // Save the PDF
            doc.save('Financial_Management_Report.pdf');
            toast.success('PDF report generated successfully');
        };

        img.onerror = function() {
            console.error('Failed to load logo');
            // Fallback without logo
            doc.setFontSize(18);
            doc.text('Financial Management Report', 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
            doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 36);
            doc.text('E3, Isurupura, Malabe', 14, 44);
            
            autoTable(doc, {
                startY: 55,
                head: [['ID', 'Customer', 'Amount ($)', 'Status', 'Date', 'Payment Method', 'Proof']],
                body: filteredAndSearchedTransactions.map(t => [
                    t.id,
                    t.user.name,
                    t.amount.toFixed(2),
                    t.status,
                    t.date,
                    t.paymentMethod,
                    t.paymentMethod === 'BankTransfer' && t.bankTransferProof ? 'Yes' : 'No'
                ]),
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: 255
                },
                styles: { fontSize: 8 }
            });
            
            doc.text('Manager Signature: ___________________', 14, doc.lastAutoTable.finalY + 20);
            doc.text('Date: ___________________', 14, doc.lastAutoTable.finalY + 30);
            doc.save('Financial_Management_Report.pdf');
            toast.success('PDF report generated successfully');
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
                        <title>Financial Management Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { color: #333; }
                            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                            .logo { height: 50px; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #2980b9; color: white; }
                            .footer { margin-top: 40px; display: flex; justify-content: space-between; }
                            .total-revenue { font-weight: bold; margin: 10px 0; }
                            @media print {
                                button { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div>
                                <h1>Financial Management Report</h1>
                                <p>Generated on: ${new Date().toLocaleString()}</p>
                                <p class="total-revenue">Total Revenue: $${totalRevenue.toFixed(2)}</p>
                                <p>E3, Isurupura, Malabe</p>
                            </div>
                            <img src="${logoBase64}" alt="Company Logo" class="logo">
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Amount ($)</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Payment Method</th>
                                    <th>Proof</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredAndSearchedTransactions.map(t => `
                                    <tr>
                                        <td>${t.id}</td>
                                        <td>${t.user.name}</td>
                                        <td>$${t.amount.toFixed(2)}</td>
                                        <td>${t.status}</td>
                                        <td>${t.date}</td>
                                        <td>${t.paymentMethod}</td>
                                        <td>${t.paymentMethod === 'BankTransfer' && t.bankTransferProof ? 'Yes' : 'No'}</td>
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
                            <title>Financial Management Report</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                h1 { color: #333; }
                                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                                th { background-color: #2980b9; color: white; }
                                .footer { margin-top: 40px; display: flex; justify-content: space-between; }
                                .total-revenue { font-weight: bold; margin: 10px 0; }
                                @media print {
                                    button { display: none; }
                                }
                            </style>
                        </head>
                        <body>
                            <h1>Financial Management Report</h1>
                            <p>Generated on: ${new Date().toLocaleString()}</p>
                            <p class="total-revenue">Total Revenue: $${totalRevenue.toFixed(2)}</p>
                            <p>E3, Isurupura, Malabe</p>
                            
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Customer</th>
                                        <th>Amount ($)</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Payment Method</th>
                                        <th>Proof</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredAndSearchedTransactions.map(t => `
                                        <tr>
                                            <td>${t.id}</td>
                                            <td>${t.user.name}</td>
                                            <td>$${t.amount.toFixed(2)}</td>
                                            <td>${t.status}</td>
                                            <td>${t.date}</td>
                                            <td>${t.paymentMethod}</td>
                                            <td>${t.paymentMethod === 'BankTransfer' && t.bankTransferProof ? 'Yes' : 'No'}</td>
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

    if (loading) return <div className="text-center py-10">Loading financial data...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Image View Modal */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeImageModal}
                contentLabel="Bank Transfer Proof"
                className="fixed inset-0 flex items-center justify-center p-4"
                overlayClassName="fixed inset-0 bg-black bg-opacity-75"
            >
                <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative">
                    <button 
                        onClick={closeImageModal}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">Bank Transfer Proof</h2>
                        {selectedImage && (
                            <img 
                                src={selectedImage} 
                                alt="Bank Transfer Proof" 
                                className="max-w-full max-h-[70vh] mx-auto"
                            />
                        )}
                    </div>
                </div>
            </Modal>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Finance Management</h2>
                    <p className="text-lg font-semibold text-green-600 mt-2">
                        Total Revenue: ${totalRevenue.toFixed(2)}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                    >
                        <option value="all">All Time</option>
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="year">Last Year</option>
                    </select>
                    <button
                        onClick={generatePDFReport}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                    >
                        PDF Report
                    </button>
                    <button
                        onClick={printReport}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                    >
                        Print Report
                    </button>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Revenue Trend</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip 
                                formatter={(value) => [`$${value}`, 'Amount']}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="amount" 
                                stroke="#8884d8" 
                                strokeWidth={2} 
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                <table className="min-w-full bg-white text-gray-700 rounded-lg">
                    <thead className="bg-gray-200 text-md font-semibold text-gray-700 uppercase">
                        <tr>
                            <th className="py-4 px-6 text-left">ID</th>
                            <th className="py-4 px-6 text-left">Customer</th>
                            <th className="py-4 px-6 text-left">Amount</th>
                            <th className="py-4 px-6 text-left">Status</th>
                            <th className="py-4 px-6 text-left">Date</th>
                            <th className="py-4 px-6 text-left">Payment Method</th>
                            <th className="py-4 px-6 text-left">Proof</th>
                            <th className="py-4 px-6 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSearchedTransactions.length > 0 ? (
                            filteredAndSearchedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{transaction.id}</td>
                                    <td className="p-4">{transaction.user.name}</td>
                                    <td className="p-4 font-semibold text-green-600">${transaction.amount.toFixed(2)}</td>
                                    <td className="p-4">
                                        <select 
                                            value={transaction.status}
                                            onChange={(e) => handleStatusChange(transaction.id, e.target.value)}
                                            className="border rounded px-2 py-1 bg-white text-gray-800"
                                        >
                                            <option value="paid">Paid</option>
                                            <option value="unpaid">Unpaid</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </td>
                                    <td className="p-4">{transaction.date}</td>
                                    <td className="p-4">{transaction.paymentMethod}</td>
                                    <td className="p-4">
                                        {transaction.paymentMethod === 'BankTransfer' && transaction.bankTransferProof ? (
                                            <button 
                                                onClick={() => openImageModal(transaction.bankTransferProof)}
                                                className="text-blue-500 hover:text-blue-700 hover:underline"
                                            >
                                                View Proof
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-4 space-x-2">
                                        <button
                                            onClick={() => handleDeleteTransaction(transaction.id)}
                                            className="inline-block bg-red-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="p-6 text-center text-gray-500 text-lg font-medium">
                                    No Transactions Found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinanceManagement;