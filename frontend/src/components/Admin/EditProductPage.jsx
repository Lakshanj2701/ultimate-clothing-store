import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: 0,
    discountPrice: 0,
    countInStock: 0,
    sku: "",
    category: "",
    brand: "",
    sizes: [],
    colors: [],
    collections: "",
    material: "",
    gender: "",
    images: [],
    isFeatured: false,
    isPublished: false,
    tags: [],
    dimensions: { length: 0, width: 0, height: 0 },
    weight: 0,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replaceImages, setReplaceImages] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        if (!id) {
          throw new Error("Product ID is missing.");
        }

        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Unauthorized! Please log in.");
          navigate("/login");
          return;
        }

        const response = await axios.get(`http://localhost:9000/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProductData(response.data);
      } catch (error) {
        console.error("Error loading product data:", error);
        toast.error("Failed to load data. Please try again later.");
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

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(',').map(item => item.trim());
    setProductData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Unauthorized! Please log in.");
        return;
      }

      const formData = new FormData();
      
      // Append product data
      Object.keys(productData).forEach(key => {
        if (key !== 'images') {
          formData.append(key, productData[key]);
        }
      });

      // Append images
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      // Specify whether to replace or append images
      formData.append('replaceImages', replaceImages);

      // Convert complex arrays to JSON strings
      formData.set('sizes', JSON.stringify(productData.sizes));
      formData.set('colors', JSON.stringify(productData.colors));

      const response = await axios.put(`http://localhost:9000/api/admin/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product. Please try again later.");
    }
  };

  // Render method remains largely the same, with some adjustments
  return (
    <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Basic Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">SKU</label>
            <input
              type="text"
              name="sku"
              value={productData.sku}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Description</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={4}
            required
          />
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-3 gap-4">
          <div className="mb-4">
            <label className="block mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              step="0.01"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Discount Price</label>
            <input
              type="number"
              name="discountPrice"
              value={productData.discountPrice}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              step="0.01"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Stock Count</label>
            <input
              type="number"
              name="countInStock"
              value={productData.countInStock}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
        </div>

        {/* Categorical Fields */}
        <div className="grid grid-cols-3 gap-4">
          <div className="mb-4">
            <label className="block mb-2">Category</label>
            <input
              type="text"
              name="category"
              value={productData.category}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={productData.brand}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          
          <div className="mb-4">
  <label className="block mb-2">Gender</label>
  <select
    name="gender"
    value={productData.gender}
    onChange={handleChange}
    className="w-full border p-2 rounded"
    required
  >
    <option value="">Select Gender</option>
    <option value="Men">Men</option>
    <option value="Women">Women</option>
    <option value="Unisex">Unisex</option>
  </select>
</div>
        </div>

        {/* Arrays */}
        <div className="grid grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block mb-2">Sizes (comma-separated)</label>
            <input
              type="text"
              value={productData.sizes.join(', ')}
              onChange={(e) => handleArrayChange(e, 'sizes')}
              className="w-full border p-2 rounded"
              placeholder="S, M, L, XL"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Colors (comma-separated)</label>
            <input
              type="text"
              value={productData.colors.join(', ')}
              onChange={(e) => handleArrayChange(e, 'colors')}
              className="w-full border p-2 rounded"
              placeholder="Red, Blue, Green"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="mb-4">
          <label className="block mb-2">Upload Images</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
            accept="image/jpeg,image/png,image/gif"
          />
          
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={replaceImages}
                onChange={() => setReplaceImages(!replaceImages)}
                className="mr-2"
              />
              <span>Replace existing images</span>
            </label>
          </div>

          {/* Existing Images */}
          <div className="flex gap-4 mt-4">
            {productData.images.map((image, index) => (
              <div key={index} className="w-24 h-24 border rounded overflow-hidden">
                <img
                  src={image.url}
                  alt={`Product Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;