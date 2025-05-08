import React from 'react';
import { RiDeleteBin3Line } from 'react-icons/ri';
import { useCart } from './CartContext';
import { toast } from 'sonner';

const CartContents = () => {
  const { cart, updateCartItem, removeFromCart } = useCart();

  /**
   * Handles all image URL formats from the API
   * - String paths ('/uploads/image.png')
   * - Object with url property ({ url: '/uploads/image.png' })
   * - Stringified objects ("{ url: '/uploads/image.png' }")
   */
  // const getImageUrl = (image) => {
  //   try {
  //     // Handle stringified JSON objects
  //     if (typeof image === 'string' && image.trim().startsWith('{')) {
  //       try {
  //         image = JSON.parse(image);
  //       } catch (e) {
  //         console.error('Failed to parse image string:', image);
  //         return '/placeholder-image.jpg';
  //       }
  //     }

      // // Extract URL from object if needed
      // if (image && typeof image === 'object') {
      //   image = image.url || image.path || image.src;
      // }

      // // Return placeholder if no valid image found
      // if (!image || typeof image !== 'string') {
      //   return '/placeholder-image.jpg';
      // }

      // // Handle full URLs
      // if (image.startsWith('http://') || image.startsWith('https://')) {
      //   return image;
      // }

      // Clean and construct full URL for relative paths
      // const cleanPath = image.startsWith('/') ? image : `/${image}`;
      // return `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000'}${cleanPath}`;
  //   } catch (error) {
  //     console.error('Error processing image URL:', error);
  //     return '/placeholder-image.jpg';
  //   }
  // };

  const handleQuantityChange = (productId, currentQuantity, size, color, action) => {
    const newQuantity = action === 'plus' ? currentQuantity + 1 : currentQuantity - 1;
    if (newQuantity < 1) return;
    updateCartItem(productId, newQuantity, size, color);
  };

  const handleRemove = (productId, size, color) => {
    removeFromCart(productId, size, color);
  };

  if (!cart || cart.products.length === 0) {
    return (
      <div className="text-center py-8">
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div>
      {cart.products.map((product, index) => {
        // const imageUrl = getImageUrl(product.image);
        
        return (
          <div key={index} className="flex place-items-start justify-between py-4 border-b">
            <div className="flex items-start">
              {/* <div className="w-20 h-20 mr-4 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                    console.error('Image load failed:', {
                      productId: product.productId,
                      constructedUrl: imageUrl,
                      rawImageData: product.image,
                      backendBaseUrl: import.meta.env.VITE_BACKEND_URL
                    });
                  }}
                />
              </div> */}
              <div className="ml-4 flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-500">
                  Size: {product.size} | Color: {product.color}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <button 
                    onClick={() => handleQuantityChange(
                      product.productId, 
                      product.quantity, 
                      product.size, 
                      product.color, 
                      'minus'
                    )}
                    className="border rounded px-2 py-1 text-xl font-medium"
                  >
                    -
                  </button>
                  <span className="text-sm">{product.quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(
                      product.productId, 
                      product.quantity, 
                      product.size, 
                      product.color, 
                      'plus'
                    )}
                    className="border rounded px-2 py-1 text-xl font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="font-semibold">${(product.price * product.quantity).toFixed(2)}</p>
              <button 
                onClick={() => handleRemove(product.productId, product.size, product.color)}
                className="mt-2 text-red-500 hover:text-red-700"
              >
                <RiDeleteBin3Line size={20} />
              </button>
            </div>
          </div>
        );
      })}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between font-semibold text-lg">
          <span>Subtotal</span>
          <span>${cart.totalPrice?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  );
};

export default CartContents;