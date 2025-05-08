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
    gender: "Unisex",
    images: [],
    isFeatured: false,
    isPublished: false,
    tags: [],
    weight: 0,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: ""
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [replaceImages, setReplaceImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to parse stringified arrays from API
  const parseStringArray = (arr) => {
    if (!arr) return [];
    return arr.flatMap(item => {
      try {
        const parsed = JSON.parse(item);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [item];
      }
    });
  };

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

        // Parse the stringified arrays from the API
        const parsedData = {
          ...response.data,
          sizes: parseStringArray(response.data.sizes),
          colors: parseStringArray(response.data.colors),
          tags: parseStringArray(response.data.tags),
          images: response.data.images || []
        };

        // Ensure image URLs are complete (add base URL if needed)
        const imagesWithCompleteUrls = parsedData.images.map(image => ({
          ...image,
          url: image.url.startsWith('http') ? image.url : `http://localhost:9000${image.url}`
        }));

        setProductData({
          ...parsedData,
          images: imagesWithCompleteUrls
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading product data:", error);
        toast.error("Failed to load data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [id, navigate]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setProductData(prev => ({ ...prev, [name]: checked }));
    } else if (name.startsWith("dimensions.")) {
      const dimensionField = name.split(".")[1];
      setProductData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionField]: value
        }
      }));
    } else {
      setProductData(prev => ({ ...prev, [name]: value }));
    }
  };

// Replace the current handleArrayInput with this version
const handleArrayInput = (e, field, value) => {
  e.preventDefault();
  if (value.trim() === "") return;
  
  // Split by comma if multiple values are entered
  const newItems = value.split(',').map(item => item.trim()).filter(item => item);
  
  setProductData(prev => ({
    ...prev,
    [field]: [...new Set([...prev[field], ...newItems])] // Remove duplicates
  }));
};

// Add this new function to handle direct array updates
const updateArray = (field, newArray) => {
  setProductData(prev => ({
    ...prev,
    [field]: [...new Set(newArray)] // Remove duplicates
  }));
};
  const removeArrayItem = (field, index) => {
    const updatedArray = [...productData[field]];
    updatedArray.splice(index, 1);
    setProductData(prev => ({ ...prev, [field]: updatedArray }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (indexToRemove, isNew = false) => {
    if (isNew) {
      const updatedFiles = [...selectedFiles];
      updatedFiles.splice(indexToRemove, 1);
      setSelectedFiles(updatedFiles);

      const updatedPreviews = [...imagePreviews];
      URL.revokeObjectURL(updatedPreviews[indexToRemove]);
      updatedPreviews.splice(indexToRemove, 1);
      setImagePreviews(updatedPreviews);
    } else {
      const updatedImages = [...productData.images];
      updatedImages.splice(indexToRemove, 1);
      setProductData(prev => ({ ...prev, images: updatedImages }));
    }
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
      
      // Append all product data
      Object.entries(productData).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'dimensions' && !Array.isArray(value)) {
          formData.append(key, value);
        }
      });
  
      // Handle dimensions
      formData.append("dimensions", JSON.stringify(productData.dimensions));
  
      // Append new images
      selectedFiles.forEach(file => {
        formData.append("images", file);
      });
  
      // Append arrays as JSON strings
      formData.append("sizes", JSON.stringify(productData.sizes));
      formData.append("colors", JSON.stringify(productData.colors));
      formData.append("tags", JSON.stringify(productData.tags));
  
      // Image replacement option
      formData.append("replaceImages", replaceImages);
  
      await axios.put(`http://localhost:9000/api/admin/products/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product.");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading product data...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6">Edit Product</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold mb-2">Product Name*</label>
            <input
              type="text"
              name="name"
              value={productData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">SKU*</label>
            <input
              type="text"
              name="sku"
              value={productData.sku}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Category*</label>
            <input
              type="text"
              name="category"
              value={productData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Brand*</label>
            <input
              type="text"
              name="brand"
              value={productData.brand}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Price*</label>
            <input
              type="number"
              name="price"
              value={productData.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Discount Price</label>
            <input
              type="number"
              name="discountPrice"
              value={productData.discountPrice}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Stock Quantity*</label>
            <input
              type="number"
              name="countInStock"
              value={productData.countInStock}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Weight (g)</label>
            <input
              type="number"
              name="weight"
              value={productData.weight}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
              min="0"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Collection</label>
            <input
              type="text"
              name="collections"
              value={productData.collections}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Material</label>
            <input
              type="text"
              name="material"
              value={productData.material}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Gender</label>
            <select
              name="gender"
              value={productData.gender}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="Men">Men</option>
              <option value="Women">Women</option>
              <option value="Unisex">Unisex</option>
            </select>
          </div>
        </div>

        {/* Description Section */}
        <div>
          <label className="block font-semibold mb-2">Description*</label>
          <textarea
            name="description"
            value={productData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            required
          />
        </div>
        {/* Arrays Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
  <label className="block font-semibold mb-2">Sizes</label>
  <div className="flex gap-2">
    <input
      type="text"
      value={productData.sizes.join(', ')}
      onChange={(e) => updateArray('sizes', e.target.value.split(',').map(s => s.trim()))}
      className="flex-1 border border-gray-300 rounded-md p-2"
      placeholder="Enter sizes separated by commas (e.g., S, M, L)"
    />
  </div>
  <div className="flex flex-wrap gap-2 mt-2">
    {productData.sizes?.map((size, index) => (
      <span key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
        {size}
        <button
          type="button"
          onClick={() => removeArrayItem('sizes', index)}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </span>
    ))}
  </div>
</div>

          <div>
            <label className="block font-semibold mb-2">Colors</label>
            <div className="flex gap-2">
              <input
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayInput(e, 'colors', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="flex-1 border border-gray-300 rounded-md p-2"
                placeholder="Add color (e.g., Red, Blue)"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {productData.colors?.map((color, index) => (
                <span key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                  {color}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('colors', index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleArrayInput(e, 'tags', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="flex-1 border border-gray-300 rounded-md p-2"
                placeholder="Add tag (e.g., summer, new)"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {productData.tags?.map((tag, index) => (
                <span key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div>
          <label className="block font-semibold mb-2">Product Images</label>
          
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={replaceImages}
                onChange={() => setReplaceImages(!replaceImages)}
                className="mr-2"
              />
              <span>Replace existing images with new uploads</span>
            </label>
          </div>
          
          <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-200">
            Upload New Images
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              multiple
              accept="image/*"
            />
          </label>
          
          {/* New Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">New Images to Upload:</h4>
              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative w-24 h-24 border rounded-md overflow-hidden">
                    <img 
                      src={preview} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index, true)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!replaceImages && productData.images?.length > 0 && (
    <div className="mt-4">
      <h4 className="font-medium mb-2">Current Product Images:</h4>
      <div className="flex flex-wrap gap-4">
        {productData.images.map((image, index) => (
          <div key={`existing-${index}`} className="relative w-24 h-24 border rounded-md overflow-hidden">
            <img 
              src={image.url} 
              alt={`Product ${index}`} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/100';
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(index, false)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
        </div>

        {/* Status Section */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={productData.isFeatured}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <span className="font-semibold">Featured Product</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isPublished"
              checked={productData.isPublished}
              onChange={handleChange}
              className="h-5 w-5"
            />
            <span className="font-semibold">Publish Product</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors font-semibold"
          >
            Update Product
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="flex-1 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;