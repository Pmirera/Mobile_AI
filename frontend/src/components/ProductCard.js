import { formatKES } from '../utils/currency';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  Eye,
  Tag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useMutation, useQueryClient } from 'react-query';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation(
    () => usersAPI.addToWishlist(product._id),
    {
      onSuccess: () => {
        toast.success('Added to wishlist!');
        queryClient.invalidateQueries('user-wishlist');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add to wishlist');
      }
    }
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      addToWishlistMutation.mutate();
    } else {
      toast.error('Please login to add to wishlist');
    }
  };

  const handleNavigate = () => {
    navigate(`/product/${product._id}`);
  };

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group cursor-pointer"
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleNavigate(); }}
    >
      <div className="card overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img
            src={product.images[0]?.url || '/placeholder-phone.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
              <Tag className="w-3 h-3 mr-1" />
              -{discountPercentage}%
            </div>
          )}

          {/* Featured Badge */}
          {product.isFeatured && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Featured
            </div>
          )}

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <button
                onClick={handleAddToWishlist}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                title="Add to Wishlist"
              >
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Add to Cart"
              >
                <ShoppingCart className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNavigate(); }}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                title="Quick View"
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.brand}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.shortDescription}
            </p>
          )}

          {/* Rating */}
          {product.ratings?.count > 0 && (
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.ratings.average)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                ({product.ratings.count})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatKES(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  {formatKES(product.originalPrice)}
                </span>
              )}
            </div>
            
            {/* Stock Indicator */}
            <div className="text-xs">
              {product.inStock ? (
                <span className="text-green-600 font-medium">
                  In Stock
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isInCart(product._id)}
            className="w-full mt-3 btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInCart(product._id) ? (
              'In Cart'
            ) : !product.inStock ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
