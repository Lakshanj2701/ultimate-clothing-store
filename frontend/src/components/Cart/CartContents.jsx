import React from 'react';
import { RiDeleteBin3Line } from 'react-icons/ri'; // ✅ Import Delete Icon

const CartContents = () => {
  const cartProducts = [
    {
      productId: 1,
      name: "T-shirt",
      size: "M",
      color: "Red",
      quantity: 1,
      price: 15,
      image: "https://picsum.photos/200?random=1",
    },
    {
      productId: 2,
      name: "Jeans",
      size: "L",
      color: "Blue",
      quantity: 1,
      price: 25,
      image: "https://picsum.photos/200?random=2",
    },
  ];

  return (
    <div>
      {cartProducts.map((product, index) => (
        <div key={index} className="flex place-items-start justify-between py-4 border-b">
          <div className="flex items-start">
            <img
              src={product.image}
              alt={product.name}
              className="w-20 h-20 object-cover mr-4 rounded"
            />
            <div className="ml-4 flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">
                Size: {product.size} | Color: {product.color}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <button className="border rounded px-2 py-1 text-xl font-medium">-</button>
                <span className="text-sm">{product.quantity}</span>
                <button className="border rounded px-2 py-1 text-xl font-medium">+</button>
              </div>
            </div>
          </div>
          {/* Price & Delete Button */}
          <div className="flex flex-col items-end">
            <p className="font-semibold">${product.price.toLocaleString()}</p>
            <button className="mt-2 text-red-500 hover:text-red-700">
              <RiDeleteBin3Line size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CartContents;
