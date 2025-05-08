import React from 'react';
import { IoMdClose } from 'react-icons/io';
import { FiPlus, FiMinus } from 'react-icons/fi'; // Import for quantity update buttons
import { RiDeleteBin6Line } from 'react-icons/ri'; // Import for delete button
import { useNavigate } from 'react-router-dom';
import { useCart } from '../Cart/CartContext';
import { useAuth } from '../../Context/AuthContext';

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart, loading } = useCart(); // Fetch cart data and functions
  const { user } = useAuth();  // Get user from AuthContext

  const handleCheckout = () => {
    if (!user) {
      // If user is not logged in, redirect to login page
      navigate('/login');
    } else {
      // If user is logged in, proceed to checkout page
      toggleCartDrawer(); // Close the drawer
      navigate('/checkout');
    }
  };

  // Handle quantity update
  const handleQuantityChange = async (productId, currentQuantity, size, color, action) => {
    const newQuantity = action === 'plus' ? currentQuantity + 1 : currentQuantity - 1;
    if (newQuantity < 1) return; // Avoid negative or zero quantity
    await updateCartItem(productId, newQuantity, size, color);
  };

  // Handle remove product from cart
  const handleRemove = async (productId, size, color) => {
    await removeFromCart(productId, size, color);
  };

  return (
    <div
      className={`fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-[30rem] h-full bg-white
        shadow-lg transform transition-transform duration-300 flex flex-col z-50 ${
        drawerOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Close Button */}
      <div className="flex justify-end p-4">
        <button onClick={toggleCartDrawer}>
          <IoMdClose className="h-6 w-6 text-gray-600" />
        </button>
      </div>

      {/* Cart content with scrollable */}
      <div className="flex-grow p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
        {!cart || cart.products.length === 0 ? (
          <div className="text-center py-8">Your cart is empty</div>
        ) : (
          cart.products.map((product) => (
            <div key={product.productId} className="flex justify-between py-4 border-b">
              {/* Product Info */}
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-sm">Size: {product.size}</p>
                  <p className="text-sm">Color: {product.color}</p>

                  {/* Conditionally display the description if it exists */}
                  {product.description && (
                    <p className="text-sm text-gray-500">Description: {product.description}</p>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex flex-col items-end gap-2">
                <p className="font-semibold">
                  ${product.price * product.quantity}
                </p>
                
                {/* Quantity Update Buttons */}
                <div className="flex items-center gap-3">
                  {/* Minus Button */}
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        product.productId,
                        product.quantity,
                        product.size,
                        product.color,
                        'minus'
                      )
                    }
                    className="p-1 rounded border hover:bg-gray-100"
                    disabled={loading}
                  >
                    <FiMinus size={16} />
                  </button>

                  {/* Quantity Display */}
                  <span className="w-6 text-center">{product.quantity}</span>

                  {/* Plus Button */}
                  <button
                    onClick={() =>
                      handleQuantityChange(
                        product.productId,
                        product.quantity,
                        product.size,
                        product.color,
                        'plus'
                      )
                    }
                    className="p-1 rounded border hover:bg-gray-100"
                    disabled={loading}
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() =>
                    handleRemove(product.productId, product.size, product.color)
                  }
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm"
                  disabled={loading}
                >
                  <RiDeleteBin6Line size={16} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Checkout button fixed at the bottom */}
      <div className="p-4 bg-white sticky bottom-0">
        <button
          onClick={handleCheckout}
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Checkout
        </button>
        <p className="text-sm tracking-tighter text-gray-500 mt-2 text-center">
          Shipping, taxes, and discount codes calculated at checkout.
        </p>
      </div>
    </div>
  );
};

export default CartDrawer;
