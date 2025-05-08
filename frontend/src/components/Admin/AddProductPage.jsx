import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const AddProductPage = () => {
    const navigate = useNavigate();
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: "",
        discountPrice: "",
        countInStock: "",
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
        dimensions: { length: "", width: "", height: "" },
        weight: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: ""
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    const categories = ["Men", "Women", "Custom"];

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role === "admin") {
                setIsAdmin(true);
            } else {
                toast.error("Access denied! Only admins can add products.");
                navigate("/");
            }
        } else {
            toast.error("Unauthorized! Please login first.");
            navigate("/login");
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === "checkbox") {
            setProductData({ ...productData, [name]: checked });
        } else if (name.startsWith("dimensions.")) {
            const dimensionField = name.split(".")[1];
            setProductData({
                ...productData,
                dimensions: {
                    ...productData.dimensions,
                    [dimensionField]: value
                }
            });
        } else if (type === "number") {
            setProductData({ ...productData, [name]: value === "" ? "" : Number(value) });
        } else {
            setProductData({ ...productData, [name]: value });
        }
    };

    // Updated array handling to match edit page
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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setProductData((prevData) => ({
            ...prevData,
            images: [...prevData.images, ...files], 
        }));

        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]);
    };

    const removeImage = (index) => {
        const updatedImages = [...productData.images];
        updatedImages.splice(index, 1);
        setProductData({ ...productData, images: updatedImages });

        const updatedPreviews = [...imagePreviews];
        URL.revokeObjectURL(updatedPreviews[index]);
        updatedPreviews.splice(index, 1);
        setImagePreviews(updatedPreviews);
    };

    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAdmin) {
            toast.error("Only admins can add products!");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Unauthorized! Please log in.");
            return;
        }

        if (!productData.sku || productData.sku.trim() === "") {
            toast.error("SKU is required!");
            return;
        }

        if (productData.price === "" || isNaN(productData.price)) {
            toast.error("Please enter a valid numeric price.");
            return;
        }

        const formData = new FormData();
        formData.append("name", productData.name);
        formData.append("description", productData.description);
        formData.append("price", productData.price);
        formData.append("discountPrice", productData.discountPrice);
        formData.append("countInStock", productData.countInStock);
        formData.append("sku", productData.sku);
        formData.append("category", productData.category);
        formData.append("brand", productData.brand);
        formData.append("collections", productData.collections);
        formData.append("material", productData.material);
        formData.append("gender", productData.gender);
        formData.append("isFeatured", productData.isFeatured);
        formData.append("isPublished", productData.isPublished);
        formData.append("weight", productData.weight);
        formData.append("dimensions", JSON.stringify(productData.dimensions));
        formData.append("metaTitle", productData.metaTitle);
        formData.append("metaDescription", productData.metaDescription);
        formData.append("metaKeywords", productData.metaKeywords);

        // Convert arrays to JSON strings before appending (matches edit page format)
        formData.append("sizes", JSON.stringify(productData.sizes));
        formData.append("colors", JSON.stringify(productData.colors));
        formData.append("tags", JSON.stringify(productData.tags));

        // Append images
        productData.images.forEach((image) => formData.append("images", image));

        try {
            await axios.post("http://localhost:9000/api/products/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success("Product added successfully!");
            navigate("/admin/products");
        } catch (error) {
            console.error("Error adding product:", error);
            toast.error(error.response?.data?.message || "Failed to add product!");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md bg-white">
            <h2 className="text-3xl font-bold mb-6">Add New Product</h2>
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
                        <select
                            name="category"
                            value={productData.category}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
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

                {/* Dimensions Section */}
                

                {/* Arrays Section - Updated to match edit page */}
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
                    <label className="block font-semibold mb-2">Product Images*</label>
                    <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-200">
                        Choose Files (Max 5)
                        <input
                            type="file"
                            onChange={handleImageUpload}
                            className="hidden"
                            multiple
                            accept="image/*"
                            max={5}
                        />
                    </label>
                    <p className="text-sm text-gray-500 mt-1">Upload high-quality product images (JPEG, PNG, GIF)</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative w-24 h-24 border rounded-md overflow-hidden">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                

                {/* Status Section */}
                <div className="flex items-center gap-6">
                    
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="isPublished"
                            checked={productData.isPublished}
                            onChange={handleChange}
                            className="h-5 w-5"
                        />
                        <span className="font-semibold">Publish Immediately</span>
                    </label>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        className="flex-1 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition-colors font-semibold"
                    >
                        Create Product
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

export default AddProductPage;