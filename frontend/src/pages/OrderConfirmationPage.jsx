import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCheckoutDetails = async () => {
      try {
        console.log(`Fetching checkout ${orderId}...`);
        const response = await api.get(`/api/checkout/${orderId}`);
        console.log('API Response:', response);

        if (!response) {
          throw new Error('No data received from server');
        }

        setCheckout(response);
        setError(null);
      } catch (error) {
        console.error('Fetch error:', error);
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to load order details';
        setError(errorMessage);
        setCheckout(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutDetails();
  }, [orderId]);

  const handleFinalizeOrder = async () => {
    setIsFinalizing(true);
    try {
      const { data } = await api.post(`/api/checkout/${orderId}/finalize`);
      console.log('Finalization response:', data);
      
      if (data?._id) {
        // Show success message before navigating
        setCheckout(prev => ({ ...prev, isFinalized: true }));
        
        // Add a slight delay for better UX
        setTimeout(() => {
          navigate('/profile', {
            state: { 
              orderSuccess: true,
              orderId: data._id 
            }
          });
        }, 1500);
      } else {
        throw new Error('Invalid response after finalizing');
      }
    } catch (error) {
      console.error('Finalization error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to finalize order');
    } finally {
      setIsFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
        <div className="text-lg">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg mt-8">
        <h2 className="text-xl font-semibold text-red-600">Error</h2>
        <p className="mt-2 text-red-700">{error}</p>
        <p className="mt-4 text-gray-600">Order ID: {orderId}</p>
        <div className="flex space-x-3 mt-4">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!checkout) {
    return (
      <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg mt-8">
        <h2 className="text-xl font-semibold">No Order Found</h2>
        <p className="mt-2">We couldn't find an order with ID: {orderId}</p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-6">
        {checkout.isFinalized ? 'Order Confirmed!' : 'Order Confirmation'}
      </h1>
      
      {checkout.isFinalized && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-800">Your order has been successfully confirmed!</span>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-lg font-semibold">Order #{checkout._id}</h2>
            <p className="text-gray-500">
              {checkout.isFinalized 
                ? `Confirmed: ${new Date(checkout.updatedAt).toLocaleString()}`
                : `Created: ${new Date(checkout.createdAt).toLocaleString()}`
              }
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              checkout.isFinalized 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {checkout.isFinalized ? 'Completed' : 'Pending Confirmation'}
            </span>
            <p className="text-gray-500 mt-1">
              Total: ${checkout.totalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Order Items</h3>
          <div className="space-y-4">
            {checkout.checkoutItems.map((item, index) => (
              <div key={index} className="flex justify-between pb-4 border-b">
                <div className="flex">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded mr-4"
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      {item.color && `${item.color} `}
                      {item.size && `| ${item.size}`}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p>${item.price.toFixed(2)} × {item.quantity}</p>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="text-lg font-semibold mb-2">Payment Information</h4>
            <div className="bg-gray-50 p-3 rounded">
              <p className="capitalize">{checkout.paymentMethod}</p>
              <p className="text-sm text-gray-500 mt-1">
                Status: <span className="capitalize">{checkout.paymentStatus}</span>
              </p>
              {checkout.paymentMethod === 'credit_card' && checkout.cardLast4 && (
                <p className="text-sm text-gray-500 mt-1">
                  Card ending in •••• {checkout.cardLast4}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">Shipping Information</h4>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">{checkout.shippingAddress.fullName}</p>
              <p>{checkout.shippingAddress.address}</p>
              <p>
                {checkout.shippingAddress.city}, {checkout.shippingAddress.state} {checkout.shippingAddress.postalCode}
              </p>
              <p>{checkout.shippingAddress.country}</p>
              <p className="text-sm text-gray-500 mt-2">
                Phone: {checkout.shippingAddress.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition mb-3 sm:mb-0 w-full sm:w-auto"
          >
            Continue Shopping
          </button>
          
          {!checkout.isFinalized ? (
            <button
              onClick={handleFinalizeOrder}
              disabled={isFinalizing}
              className={`px-6 py-2 text-white rounded transition w-full sm:w-auto ${
                isFinalizing 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isFinalizing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Confirm Order'}
            </button>
          ) : (
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition w-full sm:w-auto"
            >
              View Order in Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;