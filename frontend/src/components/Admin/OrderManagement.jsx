import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedOrder, setEditedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            await orderService.updateOrderStatus(orderId, status);
            fetchOrders();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await orderService.deleteOrder(orderId);
                fetchOrders();
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setEditedOrder({
            totalPrice: order.totalPrice,
            customerName: order.user?.name || ''  // Directly store the name
        });
        setIsModalOpen(true);
        setEditMode(false);
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSave = async () => {
        try {
            if (!selectedOrder || !editedOrder) return;

            const updateData = {
                totalPrice: Number(editedOrder.totalPrice),
                customerName: editedOrder.customerName  // Changed from editedOrder.user?.name
            };

            const response = await orderService.updateOrderDetails(selectedOrder._id, updateData);

            // Update the orders list with the new data
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === selectedOrder._id ? response : order
                )
            );

            setSelectedOrder(response);
            setEditMode(false);
            setIsModalOpen(false); // Close modal after successful update
            
            // Show success message
            alert('Order updated successfully');
        } catch (error) {
            console.error('Save error:', error);
            alert(error.message || 'Failed to update order details');
        }
    };

    if (loading) return <div className="text-center p-4">Loading...</div>;
    if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Order Management</h2>
            <div className="overflow-x-auto shadow-md sm:rounded-lg">
                <table className="min-w-full text-left text-gray-500">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                        <tr>
                            <th className="py-3 px-4">Order ID</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Total Price</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr
                                    key={order._id}
                                    className="border-b hover:bg-gray-50"
                                >
                                    <td className="py-4 px-4 font-medium text-gray-900 whitespace-nowrap">
                                        #{order._id.substring(0, 8)}
                                    </td>
                                    <td className="py-4 px-4">{order.user?.name || 'N/A'}</td>
                                    <td className="py-4 px-4">${order.totalPrice}</td>
                                    <td className="py-4 px-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) =>
                                                handleStatusChange(order._id, e.target.value)
                                            }
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                                                     focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                                        >
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button
                                            onClick={() => handleViewDetails(order)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange(order._id, "Delivered")}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        >
                                            Deliver
                                        </button>
                                        <button
                                            onClick={() => handleDeleteOrder(order._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-gray-500">
                                    No Orders found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Order Details</h3>
                            <div className="flex gap-2">
                                {!editMode ? (
                                    <button
                                        onClick={handleEdit}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        Edit
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        className="text-green-500 hover:text-green-700"
                                    >
                                        Save
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditMode(false);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold">Order Information</h4>
                                <p>Order ID: #{selectedOrder._id}</p>
                                <p>Status: {selectedOrder.status}</p>
                                <p>
                                    Total Price: $
                                    {editMode ? (
                                        <input
                                            type="number"
                                            value={editedOrder.totalPrice}
                                            onChange={(e) =>
                                                setEditedOrder({
                                                    ...editedOrder,
                                                    totalPrice: e.target.value
                                                })
                                            }
                                            className="border rounded px-2 py-1 ml-1"
                                        />
                                    ) : (
                                        selectedOrder.totalPrice
                                    )}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Customer Information</h4>
                                <p>
                                    Name:{' '}
                                    {editMode ? (
                                        <input
                                            type="text"
                                            value={editedOrder.customerName}
                                            onChange={(e) =>
                                                setEditedOrder({
                                                    ...editedOrder,
                                                    customerName: e.target.value
                                                })
                                            }
                                            className="border rounded px-2 py-1 ml-1"
                                        />
                                    ) : (
                                        selectedOrder.user?.name || 'N/A'
                                    )}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Order Items</h4>
                                <div className="space-y-2">
                                    {selectedOrder.orderItems?.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 border-b pb-2">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Quantity: {item.quantity} × ${item.price}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
