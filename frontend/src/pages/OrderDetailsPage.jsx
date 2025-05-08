import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/api/orders/${id}`);
        setOrderDetails(response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Failed to load order details.');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleRefundRequest = async () => {
    try {
      const response = await api.post('/api/return-refund/create', {
        orderId: id,
        reason: refundReason
      });

      toast.success('Return/Refund request submitted successfully');
      setModalOpen(false);
      setRefundReason('');
    } catch (error) {
      toast.error('Failed to submit return/refund request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-100 text-blue-700';
      case 'Shipped':
        return 'bg-purple-100 text-purple-700';
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg mt-8">
        <h2 className="text-xl font-semibold text-red-600">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Order Details</h2>
      <div className="p-4 sm:p-6 rounded-lg border">
        <div className="flex flex-col sm:flex-row justify-between mb-8">
          <div>
            <h3 className="text-lg md:text-xl font-semibold">Order ID: #{orderDetails._id}</h3>
            <p className="text-gray-600">{new Date(orderDetails.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0 space-y-2">
            <span className={`${getStatusColor(orderDetails.status)} px-3 py-1 rounded-full text-sm font-medium`}>
              {orderDetails.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Shipping Information</h4>
            <p className="text-gray-600">
              {orderDetails.shippingAddress.address}<br />
              {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}<br />
              {orderDetails.shippingAddress.country}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Payment Method</h4>
            <p className="text-gray-600 capitalize">{orderDetails.paymentMethod}</p>
            {orderDetails.isPaid && orderDetails.paidAt && (
              <p className="text-gray-600 mt-2">
                Paid on: {new Date(orderDetails.paidAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto mb-8">
          <h4 className="text-lg font-semibold mb-4">Order Items</h4>
          <table className="min-w-full text-gray-600">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left">Product</th>
                <th className="py-2 px-4 text-left">Price</th>
                <th className="py-2 px-4 text-left">Qty</th>
                <th className="py-2 px-4 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.orderItems.map((item) => (
                <tr key={item.productId} className="border-b">
                  <td className="py-4 px-4">
                    {item.name}
                  </td>
                  <td className="py-4 px-4">${item.price.toFixed(2)}</td>
                  <td className="py-4 px-4">{item.quantity}</td>
                  <td className="py-4 px-4">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-full md:w-1/3 border rounded-lg p-4">
            <h4 className="font-semibold mb-4">Order Summary</h4>
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${orderDetails.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${orderDetails.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Add Return and Refund Buttons */}
        <div className="flex justify-end mt-4 space-x-4">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Request Return
          </button>
        </div>

        {orderDetails.status === 'Delivered' && (
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Request Return/Refund
          </button>
        )}

        {modalOpen && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Request Return/Refund</h3>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                placeholder="Please explain why you're requesting a return/refund"
                rows="4"
                required
              ></textarea>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefundRequest}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  disabled={!refundReason.trim()}
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;