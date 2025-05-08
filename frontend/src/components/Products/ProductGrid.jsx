import { Link } from "react-router-dom";
import { getFullImageUrl } from '../../utils/imageHelpers';
import StarRating from '../Reviews/StarRating';

const ProductGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link 
          key={`${product._id}-${product.name}`} 
          to={`/product/${product._id}`} 
          className="block"
        >
          <div className="bg-white p-4 rounded-lg hover:shadow-md transition-shadow">
            <div className="w-full h-96 mb-4 overflow-hidden">
              <img 
                src={getFullImageUrl(product.images?.[0]?.url)} 
                alt={product.images?.[0]?.altText || product.name}
                className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                  e.target.alt = 'Product image not available';
                  e.target.className = 'w-full h-full object-contain rounded-lg bg-gray-100';
                }}
              />
            </div>
            <div className="flex items-center mb-1">
  <StarRating rating={product.rating || 0} />
  <span className="text-xs text-gray-500 ml-1">
    ({product.numReviews || 0})
  </span>
</div>
            <h3 className="text-sm mb-2">{product.name}</h3>
            <p className="text-gray-500 font-medium text-sm tracking-tighter">
              ${product.price}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductGrid;