import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/${id}`);
      setProduct(response.data);
      setSelectedVariant(response.data.variants?.[0] || null);
      fetchRelatedProducts(response.data.category);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await api.get(`/api/products?category=${category}&limit=4`);
      setRelatedProducts(response.data.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        variant: selectedVariant,
        quantity
      });
      // Show success message or redirect to cart
      alert('Product added to cart!');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    );
  }

  const images = product.images || [product.image];

  return (
    <div className="product-detail">
      <div className="container">
        <div className="breadcrumb">
          <button onClick={() => navigate('/products')}>Products</button>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-layout">
          <div className="product-images">
            <div className="main-image">
              <img 
                src={images[selectedImage]} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
                }}
              />
            </div>
            <div className="image-thumbnails">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                  }}
                />
              ))}
            </div>
          </div>

          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < (product.rating || 0) ? 'star filled' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">({product.reviews?.length || 0} reviews)</span>
            </div>

            <div className="product-price">
              <span className="current-price">${product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="original-price">${product.originalPrice}</span>
              )}
              {product.discount && (
                <span className="discount-badge">{product.discount}% OFF</span>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="product-variants">
                <h3>Variants:</h3>
                <div className="variant-options">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      className={`variant-btn ${selectedVariant === variant ? 'active' : ''}`}
                      onClick={() => setSelectedVariant(variant)}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-quantity">
              <h3>Quantity:</h3>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className="stock-info">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="product-actions">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                Add to Cart
              </button>
              <button 
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={product.stock === 0}
              >
                Buy Now
              </button>
            </div>

            <div className="product-features">
              <h3>Key Features:</h3>
              <ul>
                {product.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                )) || (
                  <>
                    <li>High-quality materials</li>
                    <li>1-year warranty</li>
                    <li>Free shipping</li>
                  </>
                )}
                
              </ul>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h2>Related Products</h2>
            <div className="related-grid">
              {relatedProducts.map(relatedProduct => (
                <div key={relatedProduct._id} className="related-item">
                  <img 
                    src={relatedProduct.image} 
                    alt={relatedProduct.name}
                    onClick={() => navigate(`/product/${relatedProduct._id}`)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                  <h4>{relatedProduct.name}</h4>
                  <p>${relatedProduct.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
