import React, { useState } from 'react';

const EditProductPage = () => {
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    countInStock: 0,
    sku: "",
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    collections: "",
    material: "",
    gender: "",
    images: [
      {
        url: "https://picsum.photos/150?random=1",
      },
      {
        url: "https://picsum.photos/150?random=2",
      },
    ],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    console.log(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(productData);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Product Name</label>
          <input
            type="text"
            name="name"
            value={productData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            required
          />
        </div>

        {/* Price */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Price</label>
          <input
            type="number"
            name="price"
            value={productData.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Count In Stock */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">Count in Stock</label>
          <input
            type="number"
            name="countInStock"
            value={productData.countInStock}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* SKU */}
        <div className="mb-6">
          <label className="block font-semibold mb-2">SKU</label>
          <input
            type="text"
            name="sku"
            value={productData.sku}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        {/* Sizes */}
        <div className="mb-6">
            <label className="block font-semibold mb-2">Sizes <span className="text-gray-500 text-sm">(comma-separated)</span></label>
            <input
                type="text"
                name="sizes"
                value={productData.sizes.join(",")}
                onChange={(e) =>
                setProductData({
                    ...productData,
                    sizes: e.target.value.split(",").map((size) => size.trim()),
                })
                }
                placeholder="e.g., S, M, L, XL"
                className="w-full border border-gray-300 rounded-md p-2"
            />
        </div>

        {/* Colors */}
        <div className="mb-6">
            <label className="block font-semibold mb-2">Colors <span className="text-gray-500 text-sm">(comma-separated)</span></label>
            <input
                type="text"
                name="colors"
                value={productData.colors.join(",")}
                onChange={(e) =>
                setProductData({
                    ...productData,
                    colors: e.target.value.split(",").map((color) => color.trim()),
                })
                }
                placeholder="e.g., Red, Blue, Green"
                className="w-full border border-gray-300 rounded-md p-2"
            />
        </div>


        {/* Image upload */}
        <div className="mb-6">
            <label className="block font-semibold mb-2">Upload Image</label>
            
            <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-200">
                Choose File
                    <input
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    />
            </label>
            <div className="flex gap-4 mt-4">
                {productData.images.map((image, index) => (
                    <div key={index} className="w-24 h-24 border rounded-md overflow-hidden">
                        <img
                            src={image.url}
                            alt={image.altText || "Product Image"}
                            className="w-full h-full object-cover"
            />
                    </div>
                ))}
            </div>
        </div>
        <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"    
        >
            Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
