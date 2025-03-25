import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FinanceManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, [dateRange]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`);
            const orders = response.data.map(order => ({
                id: order._id,
                user: { 
                    name: order.user?.name || 'Anonymous',
                    image: order.user?.image || null // Handle null image
                },
                amount: order.totalPrice || 0,
                status: order.paymentStatus || 'pending',
                date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : '-',
                paymentMethod: order.paymentMethod || '-',
                paidAt: order.paidAt || null
            }));

            setTransactions(orders);
            calculateTotalRevenue(orders);
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

    const handleStatusChange = async (transactionId, newStatus) => {
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/checkout/${transactionId}/pay`, 
                { paymentStatus: newStatus }
            );

            setTransactions(prev =>
                prev.map(transaction =>
                    transaction.id === transactionId
                        ? { ...transaction, status: newStatus }
                        : transaction
                )
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

        const rows = transactions.map(t => [
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

    if (loading) return <div>Loading...</div>;

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
                            <th className="px-6 py-3 border-b">Customer</th>
                            <th className="px-6 py-3 border-b">Amount</th>
                            <th className="px-6 py-3 border-b">Status</th>
                            <th className="px-6 py-3 border-b">Date</th>
                            <th className="px-6 py-3 border-b">Payment Method</th>
                            <th className="px-6 py-3 border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td className="px-6 py-4 border-b">{transaction.id}</td>
                                <td className="px-6 py-4 border-b flex items-center gap-2">
                                    {transaction.user.image && (
                                        <img 
                                            src={transaction.user.image} 
                                            alt={transaction.user.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/default-avatar.png'; // Provide a default image
                                            }}
                                        />
                                    )}
                                    <span>{transaction.user.name}</span>
                                </td>
                                <td className="px-6 py-4 border-b">${transaction.amount}</td>
                                <td className="px-6 py-4 border-b">
                                    <span className={`px-2 py-1 rounded ${
                                        transaction.status === 'paid' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {transaction.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 border-b">{transaction.date}</td>
                                <td className="px-6 py-4 border-b">{transaction.paymentMethod}</td>
                                <td className="px-6 py-4 border-b">
                                    {transaction.status !== 'paid' && (
                                        <button 
                                            onClick={() => handleStatusChange(transaction.id, 'paid')}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        >
                                            Mark as Paid
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinanceManagement;
