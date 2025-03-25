import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
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

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!id) {
          throw new Error("Product ID is missing.");
        }

        const token = localStorage.getItem("token");
        if (!token) {
          alert("Unauthorized! Please log in.");
          navigate("/login");
          return;
        }

        const response = await axios.get(`http://localhost:9000/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProductData(response.data); // Populate form with data
      } catch (error) {
        console.error("Error loading product data:", error);
        alert("Failed to load data. Please try again later.");
      }
    };

    fetchProductData();
  }, [id, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Unauthorized! Please log in.");
        return;
      }

      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("description", productData.description);
      formData.append("price", productData.price);
      formData.append("countInStock", productData.countInStock);
      formData.append("sku", productData.sku);
      formData.append("category", productData.category);
      formData.append("brand", productData.brand);
      formData.append("collections", productData.collections);
      formData.append("material", productData.material);
      formData.append("gender", productData.gender);

      // Convert arrays to JSON strings before appending
      formData.append("sizes", JSON.stringify(productData.sizes));
      formData.append("colors", JSON.stringify(productData.colors));

      // Append images
      productData.images.forEach((image) => formData.append("images", image));

      await axios.put(`http://localhost:9000/api/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Product updated successfully!");
      navigate("/admin/products"); // Navigate to product management page
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Please try again later.");
    }
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
          <label className="block font-semibold mb-2">Sizes</label>
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
          <label className="block font-semibold mb-2">Colors</label>
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
            <input type="file" onChange={handleImageUpload} className="hidden" />
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
