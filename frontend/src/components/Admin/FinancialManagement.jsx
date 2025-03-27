import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FinanceManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [dateRange, setDateRange] = useState('all');
    const [chartData, setChartData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTransactions();
    }, [dateRange]);

    useEffect(() => {
        // Update chart data when transactions change
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
                    return true; // 'all' or no range selected, include all
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
                    image: checkOut.user?.image || null // Handle null image
                },
                amount: checkOut.totalPrice || 0,
                status: checkOut.paymentStatus || 'pending',
                date: checkOut.createdAt ? new Date(checkOut.createdAt).toISOString().split('T')[0] : '-',
                paymentMethod: checkOut.paymentMethod || '-',
                paidAt: checkOut.paidAt || null
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

    // Filtered and Searched Transactions
    const filteredAndSearchedTransactions = useMemo(() => {
        // First filter by date range
        const filteredByDateRange = filterTransactionsByDateRange(transactions);

        // Then filter by search term
        return filteredByDateRange.filter(transaction => 
            Object.values(transaction).some(value => 
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            ) ||
            transaction.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, dateRange, searchTerm]);

    const handleDeleteTransaction = async (transactionId) => {
        // Show SweetAlert confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You won\'t be able to revert this transaction deletion!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        // If user confirms deletion
        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token'); 
                if (!token) {
                    toast.error('Authentication token missing. Please log in again.');
                    return;
                }
        
                // Make the DELETE request to the backend
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/checkout/${transactionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
        
                // Remove the deleted transaction from the state
                setTransactions(prev => prev.filter(transaction => transaction.id !== transactionId));
        
                // Show success message with SweetAlert
                Swal.fire(
                    'Deleted!',
                    'The transaction has been deleted.',
                    'success'
                );
            } catch (error) {
                console.error('Error:', error);
                
                // Show error message with SweetAlert
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

    const generatePDFReport = () => {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Financial Report', 14, 15);
        
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
        doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 32);

        const columns = [
            'Transaction ID',
            'Customer',
            'Amount ($)',
            'Status',
            'Date',
            'Payment Method'
        ];

        const rows = filteredAndSearchedTransactions.map(t => [
            t.id,
            t.user.name,
            t.amount.toFixed(2),
            t.status,
            t.date,
            t.paymentMethod
        ]);

        autoTable(doc, {
            startY: 40,
            head: [columns],
            body: rows,
            theme: 'striped',
            styles: { fontSize: 8 }
        });

        doc.save('Financial_Report.pdf');
        toast.success('Report generated successfully');
    };

    if (loading) return <div className="text-center">Loading...</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Finance Management</h1>
                <p className="text-gray-600">Total Revenue: ${totalRevenue.toFixed(2)}</p>
            </div>

            <div className="flex gap-4 mb-6">
                <button 
                    onClick={generatePDFReport}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Generate Report (PDF)
                </button>
                
                <select 
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="border rounded px-4 py-2"
                >
                    <option value="all">All Time</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>

                <input 
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border rounded px-4 py-2 flex-grow"
                />
            </div>

            <div className="bg-white p-6 rounded shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={transactions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-6 py-3 border-b">ID</th>
                            <th className="px-6 py-3 border-b">Amount</th>
                            <th className="px-6 py-3 border-b">Status</th>
                            <th className="px-6 py-3 border-b">Date</th>
                            <th className="px-6 py-3 border-b">Payment Method</th>
                            <th className="px-6 py-3 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSearchedTransactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td className="px-6 py-4 border-b">{transaction.id}</td>
                                <td className="px-6 py-4 border-b">${transaction.amount}</td>
                                <td className="px-6 py-4 border-b">
                                    <select 
                                        value={transaction.status}
                                        onChange={(e) => handleStatusChange(transaction.id, e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="paid">Paid</option>
                                        <option value="unpaid">Unpaid</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 border-b">{transaction.date}</td>
                                <td className="px-6 py-4 border-b">{transaction.paymentMethod}</td>
                                <td className="px-6 py-4 border-b">
                                    <button 
                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredAndSearchedTransactions.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        No transactions found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FinanceManagement;