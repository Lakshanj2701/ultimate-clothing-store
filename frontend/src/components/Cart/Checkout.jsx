import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Cart/CartContext';
import { useAuth } from '../../Context/AuthContext';
import { toast } from 'sonner';
import PayPalButton from './PayPalButton';
import api from '../../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart } = useCart();
  const { user } = useAuth();
  const [checkoutId, setCheckoutId] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [bankTransferProof, setBankTransferProof] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!cart || !cart.products || cart.products.length === 0) {
      navigate('/');
    }
  }, [cart, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size too large. Maximum 5MB allowed.');
        return;
      }
      
      setBankTransferProof(file);
    }
  };

  const handleCreateCheckout = async (e) => {
    e.preventDefault();

    if (!cart || cart.products.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (paymentMethod === 'BankTransfer' && !bankTransferProof) {
      toast.error('Please upload your bank transfer proof');
      return;
    }

    // Prepare checkout items with custom image URLs if they exist
    const checkoutItemsWithDetails = cart.products.map((product) => ({
      productId: product.productId,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: product.quantity,
      size: product.size,
      color: product.color,
      description: product.description || "",
      customImage: product.customImage || null // Include custom image URL if it exists
    }));

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('checkoutItems', JSON.stringify(checkoutItemsWithDetails));
      formData.append('shippingAddress', JSON.stringify(shippingAddress));
      formData.append('paymentMethod', paymentMethod);
      formData.append('totalPrice', cart.totalPrice);
      
      if (paymentMethod === 'BankTransfer' && bankTransferProof) {
        formData.append('bankTransferProof', bankTransferProof);
      }

      const response = await api.post('/api/checkout', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response && response.data && response.data._id) {
        setCheckoutId(response.data._id);
        toast.success('Checkout created!');
        
        if (paymentMethod === 'BankTransfer') {
          toast.info('Your order will be processed after payment verification');
        }
        
        navigate(`/order-confirmation/${response.data._id}`);
      } else {
        toast.error('Checkout creation failed: No checkout ID received.');
      }
    } catch (error) {
      toast.error('Failed to create checkout session!');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentSuccess = async (details) => {
    try {
      await api.put(`/api/checkout/${checkoutId}/pay`, {
        paymentStatus: 'paid',
        paymentDetails: details,
      });

      const orderResponse = await api.post(`/api/checkout/${checkoutId}/finalize`);

      await removeFromCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${orderResponse.data._id}`);
    } catch (error) {
      toast.error('Payment failed or order placement failed!');
      console.error(error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto py-10 px-6 tracking-tighter">
      {/* Left Section */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl uppercase mb-6">Checkout</h2>
        <form onSubmit={handleCreateCheckout}>
          <h3 className="text-lg mb-4">Contact Details</h3>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={user ? user.email : 'user@example.com'}
              className="w-full p-2 border rounded"
              disabled
            />
          </div>

          {/* Delivery Section */}
          <h3 className="text-lg mb-4">Delivery</h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">First Name</label>
              <input
                type="text"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  setShippingAddress((prevState) => ({
                    ...prevState,
                    firstName: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Last Name</label>
              <input
                type="text"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  setShippingAddress((prevState) => ({
                    ...prevState,
                    lastName: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Shipping Address Fields */}
          <div className="mb-4">
            <label className="block text-gray-700">Address</label>
            <input
              type="text"
              value={shippingAddress.address}
              onChange={(e) =>
                setShippingAddress((prevState) => ({
                  ...prevState,
                  address: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-1 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) =>
                  setShippingAddress((prevState) => ({
                    ...prevState,
                    city: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Postal Code</label>
              <input
                type="text"
                value={shippingAddress.postalCode}
                onChange={(e) =>
                  setShippingAddress((prevState) => ({
                    ...prevState,
                    postalCode: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Country</label>
            <input
              type="text"
              value={shippingAddress.country}
              onChange={(e) =>
                setShippingAddress((prevState) => ({
                  ...prevState,
                  country: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Phone Number</label>
            <input
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) =>
                setShippingAddress((prevState) => ({
                  ...prevState,
                  phone: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {/* Payment Method Selection */}
          <h3 className="text-lg mb-4">Payment Method</h3>
          <div className="mb-4 space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="paypal"
                name="paymentMethod"
                value="PayPal"
                checked={paymentMethod === 'PayPal'}
                onChange={() => setPaymentMethod('PayPal')}
                className="mr-2"
              />
              <label htmlFor="paypal">PayPal</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="cod"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="mr-2"
              />
              <label htmlFor="cod">Cash on Delivery</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="bankTransfer"
                name="paymentMethod"
                value="BankTransfer"
                checked={paymentMethod === 'BankTransfer'}
                onChange={() => setPaymentMethod('BankTransfer')}
                className="mr-2"
              />
              <label htmlFor="bankTransfer">Bank Transfer</label>
            </div>
          </div>

          {/* Bank Transfer Proof Upload */}
          {paymentMethod === 'BankTransfer' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Bank Transfer Proof</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bankTransferProof"
                  required={paymentMethod === 'BankTransfer'}
                />
                <label
                  htmlFor="bankTransferProof"
                  className="cursor-pointer block text-center"
                >
                  {bankTransferProof ? (
                    <div>
                      <p>Selected file: {bankTransferProof.name}</p>
                      <button
                        type="button"
                        onClick={() => setBankTransferProof(null)}
                        className="text-red-500 mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500">
                        Click to upload your bank transfer receipt
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        (JPEG, PNG, or GIF, max 5MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Submit Button for Checkout */}
          <div className="mt-6">
            {!checkoutId ? (
              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded disabled:opacity-50"
                disabled={isUploading}
              >
                {isUploading ? 'Processing...' : 'Continue to Payment'}
              </button>
            ) : (
              <div className="">
                {paymentMethod === 'PayPal' && (
                  <>
                    <h3 className="text-lg mb-4">Pay with PayPal</h3>
                    <PayPalButton
                      amount={cart.totalPrice}
                      onSuccess={handlePaymentSuccess}
                      onError={(err) => alert('Payment failed. Try again.')}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Right Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg mb-4">Order Summary</h3>
        <div className="border-t py-4 mb-4">
          {cart.products.map((product) => (
            <div key={product.productId} className="flex items-start justify-between py-2 border-b">
              <div className="flex items-start">

                <div>
                  <h3 className="text-md">{product.name}</h3>
                  <p className="text-gray-500">Size: {product.size}</p>
                  <p className="text-gray-500">Color: {product.color}</p>
                  {product.description && (
                    <p className="text-gray-500">Description: {product.description}</p>
                  )}
                  <p className="text-gray-500">Quantity: {product.quantity}</p>
                </div>
              </div>
              <p className="text-xl">${(product.price * product.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center text-lg mb-4">
          <p>Subtotal</p>
          <p>${cart.totalPrice.toFixed(2)}</p>
        </div>
        <div className="flex justify-between items-center text-lg">
          <p>Shipping</p>
          <p>Free</p>
        </div>
        <div className="flex justify-between items-center text-lg mt-4 border-t pt-4">
          <p>Total</p>
          <p>${cart.totalPrice.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;