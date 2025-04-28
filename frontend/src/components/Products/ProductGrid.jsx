import { Link } from "react-router-dom";

// Base64 encoded 1x1 transparent pixel
const FALLBACK_IMAGE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const ProductGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
            <Link key={product._id || index} to={`/product/${product._id}`} className="block">
                <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="w-full h-96 mb-4 relative bg-gray-100 rounded-lg">
                        <img 
                            src={product.images?.[0]?.url || FALLBACK_IMAGE} 
                            alt={product.images?.[0]?.altText || product.name || 'Product image'}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = FALLBACK_IMAGE;
                            }}
                        />
                        {!product.images?.[0]?.url && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                No Image Available
                            </div>
                        )}
                    </div>
                    <h3 className="text-sm font-medium mb-2 line-clamp-2">{product.name || 'Unnamed Product'}</h3>
                    <p className="text-gray-500 font-medium text-sm tracking-tighter">
                        ${product.price?.toFixed(2) || '0.00'}
                    </p>
                </div>
            </Link>
        ))}
    </div>
  );
};

export default ProductGrid;