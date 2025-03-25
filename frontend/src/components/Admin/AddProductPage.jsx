import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProductPage = () => {
    const navigate = useNavigate();
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
        images: []
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
        // Add image upload logic here
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(productData);
        // Add product creation logic here
        // After successful creation:
        // navigate('/admin/products');
    };

    return (
        <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
            <h2 className="text-3xl font-bold mb-6">Add New Product</h2>
            <form onSubmit={handleSubmit}>
                {/* Same form fields as EditProductPage */}
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
                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors"
                    >
                        Create Product
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProductPage;