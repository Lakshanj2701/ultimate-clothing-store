import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import ProductGrid from './ProductGrid';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getFullImageUrl } from '../../utils/imageHelpers';
import { useCart } from '../../components/Cart/CartContext';
import ReviewSection from '../Reviews/ReviewSection';

const ProductDetails = ({ product: initialProduct }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(initialProduct || null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(!initialProduct);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [mainImage, setMainImage] = useState("");  
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customDescription, setCustomDescription] = useState("");
  const [customImage, setCustomImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!initialProduct && id) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000'}/api/products/${id}`);
          const productWithUrls = {
            ...response.data,
            images: response.data.images.map(image => ({
              ...image,
              url: getFullImageUrl(image.url)
            }))
          };
          setProduct(productWithUrls);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error("Failed to load product");
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, initialProduct]);

  useEffect(() => {
    if (product?._id) {
      const fetchSimilarProducts = async () => {
        try {
          setSimilarLoading(true);
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000'}/api/products/similar/${product._id}`);
          const similarWithUrls = response.data.map(product => ({
            ...product,
            images: product.images.map(image => ({
              ...image,
              url: getFullImageUrl(image.url)
            }))
          }));
          setSimilarProducts(similarWithUrls);
          setSimilarLoading(false);
        } catch (error) {
          console.error("Error fetching similar products:", error);
          setSimilarLoading(false);
        }
      };

      fetchSimilarProducts();
    }
  }, [product]);

  useEffect(() => {
    if (product?.images?.length > 0) {
      setMainImage(product.images[0].url);
    }
  }, [product]);

  const handleQuantityChange = (action) => {
    if (action === "plus") setQuantity((prev) => prev + 1);
    if (action === "minus" && quantity > 1) setQuantity((prev) => prev - 1);     
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG and GIF are allowed.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Maximum 5MB allowed.');
      return;
    }

    setCustomImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeImage = () => {
    setCustomImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select a size and color before adding to cart.", {
        duration: 1000,
      });
      return;
    }

    if (product.category === "Custom" && !customDescription) {
      toast.error("Please provide a custom description.", {
        duration: 1000,
      });
      return;
    }

    if (product.category === "Custom" && !customImage) {
      toast.error("Please upload an image for your custom product.", {
        duration: 1000,
      });
      return;
    }

    const success = await addToCart(
      product._id, 
      quantity, 
      selectedSize, 
      selectedColor, 
      customDescription,
      customImage
    );

    if (success) {
      toast.success("Product added to cart!", {
        duration: 1000,
      });
      setQuantity(1);
      setCustomDescription("");
      setCustomImage(null);
      setImagePreview("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading || !product) {
    return <div className="text-center py-8">Loading product details...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg">
        <div className="flex flex-col md:flex-row">
          {/* Left Thumbnails */}
          <div className="hidden md:flex flex-col space-y-4 mr-6">
            {product.images?.map((image, index) => (
              <img
                key={image._id || index}
                src={image.url}
                alt={image.altText || `Thumbnail ${index}`}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                  mainImage === image.url ? "border-black" : "border-gray-300"
                }`} 
                onClick={() => setMainImage(image.url)}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="md:w-1/2">
            <div className="mb-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Custom product preview"
                    className="w-full h-auto object-cover rounded-lg"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <img
                  src={mainImage}
                  alt={product.images?.find(img => img.url === mainImage)?.altText || product.name}
                  className="w-full h-auto object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          {/* Mobile Thumbnail */}
          <div className="md:hidden flex overscroll-x-scroll space-x-4 mb-4">
            {product.images?.map((image, index) => (
              <img
                key={image._id || index}
                src={image.url}
                alt={image.altText || `Thumbnail ${index}`}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border ${
                  mainImage === image.url ? "border-black" : "border-gray-300"
                }`}
                onClick={() => setMainImage(image.url)} 
              />
            ))}
          </div>

          {/* Right Side */}
          <div className="md:w-1/2 md:ml-10">
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">
              {product.name}
            </h1>

            {product.discountPrice && (
              <p className="text-lg text-gray-600 mb-1 line-through">
                ${product.discountPrice}
              </p>
            )}

            <p className="text-xl text-gray-500 mb-2">
              ${product.price}
            </p>

            <p className="text-gray-600 mb-4">{product.description}</p>

            {/* Custom Fields (Only for Custom Products) */}
            {product.category === "Custom" && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Custom Description</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows="4"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Enter custom description here..."
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Upload Your Design</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={triggerFileInput}
                    className="w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                  >
                    {customImage ? 'Change Image' : 'Select Image'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: JPEG, PNG, GIF (Max 5MB)
                  </p>
                </div>
              </>
            )}

            {product.colors?.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-700">Color:</p>
                <div className="flex gap-2 mt-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border ${
                        selectedColor === color
                          ? "border-4 border-white"
                          : "border-gray-300"
                      }`}
                      style={{ 
                        backgroundColor: color.toLowerCase(),
                        filter: "brightness(0.5)",
                      }}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="mb-4">
                <p className="text-gray-700">Size:</p>
                <div className="flex gap-2 mt-2">
                  {product.sizes.map((size) => (
                    <button 
                      key={size} 
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded border ${
                        selectedSize === size ? "bg-black text-white" : ""
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <p className="text-gray-700">Quantity:</p>
              <div className="flex items-center space-x-4 mt-2">
                <button 
                  onClick={() => handleQuantityChange("minus")} 
                  className="px-2 py-1 bg-gray-200 rounded text-lg"
                >
                  -
                </button>
                <span className="text-lg">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange("plus")} 
                  className="px-2 py-1 bg-gray-200 rounded text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              className="bg-black text-white py-2 px-6 rounded w-full mb-4 hover:bg-gray-900"
            >
              ADD TO CART
            </button>

            <div className="mt-10 text-gray-700">
              <h3 className="text-xl font-bold mb-4">Characteristics:</h3>
              <table className="w-full text-left text-sm text-gray-600">
                <tbody>
                  {product.brand && (
                    <tr>
                      <td className="py-1">Brand</td>
                      <td className="py-1">{product.brand}</td>
                    </tr>
                  )}
                  {product.material && (
                    <tr>
                      <td className="py-1">Material</td>
                      <td className="py-1">{product.material}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-8">
          <ReviewSection productId={product._id} />
        </div>
        
        {similarProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl text-center font-medium mb-4">
              You May Also Like
            </h2>
            {similarLoading ? (
              <div className="text-center py-8">Loading similar products...</div>
            ) : (
              <ProductGrid products={similarProducts} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;