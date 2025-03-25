import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddProductPage = () => {
    const navigate = useNavigate();
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
        dimensions: { length: 0, width: 0, height: 0 },
        weight: 0,
    });

    const [imagePreviews, setImagePreviews] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user.role === "admin") {
                setIsAdmin(true);
            } else {
                alert("Access denied! Only admins can add products.");
                navigate("/");
            }
        } else {
            alert("Unauthorized! Please login first.");
            navigate("/login");
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData({ ...productData, [name]: value });
    };

    // Handle image selection and preview
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setProductData((prevData) => ({
            ...prevData,
            images: [...prevData.images, ...files], 
        }));

        const previews = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prevPreviews) => [...prevPreviews, ...previews]);
    };

    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAdmin) {
            alert("Only admins can add products!");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Unauthorized! Please log in.");
            return;
        }

        if (!productData.sku || productData.sku.trim() === "") {
            alert("SKU is required!");
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

        // Convert arrays to JSON strings before appending
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

            alert("Product added successfully!");
            navigate("/admin/products");
        } catch (error) {
            console.error("Error adding product:", error);
            alert(error.response?.data?.message || "Failed to add product!");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 shadow-md rounded-md">
            <h2 className="text-3xl font-bold mb-6">Add New Product</h2>
            <form onSubmit={handleSubmit}>
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

                <div className="mb-6">
                    <label className="block font-semibold mb-2">Price</label>
                    <input
                        type="text"
                        name="price"
                        value={productData.price}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block font-semibold mb-2">SKU</label>
                    <input
                        type="text"
                        name="sku"
                        value={productData.sku}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md p-2"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block font-semibold mb-2">Upload Images</label>
                    <label className="cursor-pointer inline-block px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition duration-200">
                        Choose Files
                        <input
                            type="file"
                            onChange={handleImageUpload}
                            className="hidden"
                            multiple
                            accept="image/*"
                        />
                    </label>
                    <div className="flex gap-4 mt-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="w-24 h-24 border rounded-md overflow-hidden">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
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
                        onClick={() => navigate("/admin/products")}
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
