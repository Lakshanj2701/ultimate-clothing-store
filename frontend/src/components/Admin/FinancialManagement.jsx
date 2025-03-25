import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FinanceManagement = () => {
    const [transactions, setTransactions] = useState([
        { id: 1, user: { name: "Alice Johnson" }, amount: 200, status: "Pending", date: "2024-03-10" },
        { id: 2, user: { name: "Bob Smith" }, amount: 450, status: "Completed", date: "2024-03-11" },
        { id: 3, user: { name: "Charlie Brown" }, amount: 120, status: "Pending", date: "2024-03-12" },
        { id: 4, user: { name: "David Lee" }, amount: 300, status: "Completed", date: "2024-03-13" },
    ]);

    // ✅ Function to change transaction status
    const handleStatusChange = (transactionId, newStatus) => {
        setTransactions(transactions.map(transaction => 
            transaction.id === transactionId ? { ...transaction, status: newStatus } : transaction
        ));
    };

    // ✅ Function to delete a transaction
    const handleDelete = (transactionId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
        if (confirmDelete) {
            setTransactions(transactions.filter(transaction => transaction.id !== transactionId));
        }
    };

    // ✅ Generate PDF Report
    const generatePDFReport = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Finance Report", 14, 15);

        const columns = ["Transaction ID", "Customer", "Amount ($)", "Status", "Date"];
        const rows = transactions.map(t => [t.id, t.user.name, t.amount, t.status, t.date]);

        autoTable(doc, {
            startY: 25,
            head: [columns],
            body: rows,
        });

        doc.save("Finance_Report.pdf");
    };

    // ✅ Prepare Data for Sales Chart
    const salesData = transactions.map(transaction => ({
        date: transaction.date,
        sales: transaction.amount,
    }));

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Finance Management</h1>

            {/* ✅ Generate Report Button */}
            <button 
                onClick={generatePDFReport}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Generate Report (PDF)
            </button>

            {/* ✅ Sales Trend Graph */}
            <div className="bg-white p-6 rounded shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* ✅ Transaction Table */}
            {transactions.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border">Transaction ID</th>
                            <th className="py-2 px-4 border">Customer</th>
                            <th className="py-2 px-4 border">Amount</th>
                            <th className="py-2 px-4 border">Status</th>
                            <th className="py-2 px-4 border">Actions</th>
                            <th className="py-2 px-4 border">Delete</th> {/* ✅ New Delete Column */}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(transaction => (
                            <tr key={transaction.id} className="text-center">
                                <td className="py-2 px-4 border">#{transaction.id}</td>
                                <td className="py-2 px-4 border">{transaction.user.name}</td>
                                <td className="py-2 px-4 border">${transaction.amount}</td>
                                <td className="py-2 px-4 border">{transaction.status}</td>
                                <td className="py-2 px-4 border">
                                    <select
                                        value={transaction.status}
                                        onChange={(e) => handleStatusChange(transaction.id, e.target.value)}
                                        className="border p-2 rounded"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Failed">Failed</option>
                                    </select>
                                    {transaction.status !== "Completed" && (
                                        <button 
                                            onClick={() => handleStatusChange(transaction.id, "Completed")}
                                            className="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        >
                                            Mark as Completed
                                        </button>
                                    )}
                                </td>
                                <td className="py-2 px-4 border">
                                    <button 
                                        onClick={() => handleDelete(transaction.id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-gray-600 text-center">No transactions found.</p>
            )}
        </div>
    );
};

export default FinanceManagement;
