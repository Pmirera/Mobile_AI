import { formatKES } from '../utils/currency';
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
      const response = await api.get(`/products/${id}`);
      const prod = response.data?.product || response.data; // backend returns { product }
      setProduct(prod);
      setSelectedVariant(prod?.variants?.[0] || null);
      if (prod?.category) {
        fetchRelatedProducts(prod.category);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (category) => {
    try {
      const response = await api.get(`/products?category=${category}&limit=4`);
      const list = response.data?.products || response.data || [];
      setRelatedProducts(list.filter(p => p._id !== id));
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

  const imageUrls = (product.images?.map(img => img?.url).filter(Boolean)) || (product.image ? [product.image] : []);
  const images = imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/500x500?text=No+Image'];

  const ratingAverage = product.ratings?.average || 0;
  const ratingCount = product.ratings?.count || product.reviews?.length || 0;
  const inStock = product.inStock !== undefined ? product.inStock : (product.stockQuantity > 0);
  const stockQty = product.stockQuantity ?? product.stock ?? 0;

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
                  <span key={i} className={i < Math.round(ratingAverage) ? 'star filled' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">({ratingCount} reviews)</span>
            </div>

            <div className="product-price">
              <span className="current-price">{formatKES(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="original-price">{formatKES(product.originalPrice)}</span>
              )}
              {product.discount && (
                <span className="discount-badge">{product.discount}% OFF</span>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            {/* Core details */}
            <div className="product-core-details">
              <h3>Details</h3>
              <div className="details-grid">
                <div><span className="label">Brand:</span> <span className="value">{product.brand || '—'}</span></div>
                <div><span className="label">Model:</span> <span className="value">{product.model || '—'}</span></div>
                <div><span className="label">SKU:</span> <span className="value">{product.sku || '—'}</span></div>
                <div><span className="label">Category:</span> <span className="value">{product.category || '—'}</span></div>
              </div>
            </div>

            {/* Specifications */}
            {(product.specifications && Object.keys(product.specifications).length > 0) && (
              <div className="product-specs">
                <h3>Specifications</h3>
                <div className="specs-grid">
                  {product.specifications.screenSize && (
                    <div><span className="label">Screen Size:</span> <span className="value">{product.specifications.screenSize}</span></div>
                  )}
                  {product.specifications.resolution && (
                    <div><span className="label">Resolution:</span> <span className="value">{product.specifications.resolution}</span></div>
                  )}
                  {product.specifications.processor && (
                    <div><span className="label">Processor:</span> <span className="value">{product.specifications.processor}</span></div>
                  )}
                  {product.specifications.ram && (
                    <div><span className="label">RAM:</span> <span className="value">{product.specifications.ram}</span></div>
                  )}
                  {product.specifications.storage && (
                    <div><span className="label">Storage:</span> <span className="value">{product.specifications.storage}</span></div>
                  )}
                  {product.specifications.camera && (
                    <div><span className="label">Camera:</span> <span className="value">{product.specifications.camera}</span></div>
                  )}
                  {product.specifications.battery && (
                    <div><span className="label">Battery:</span> <span className="value">{product.specifications.battery}</span></div>
                  )}
                  {product.specifications.operatingSystem && (
                    <div><span className="label">OS:</span> <span className="value">{product.specifications.operatingSystem}</span></div>
                  )}
                  {Array.isArray(product.specifications.connectivity) && product.specifications.connectivity.length > 0 && (
                    <div><span className="label">Connectivity:</span> <span className="value">{product.specifications.connectivity.join(', ')}</span></div>
                  )}
                  {Array.isArray(product.specifications.colors) && product.specifications.colors.length > 0 && (
                    <div><span className="label">Colors:</span> <span className="value">{product.specifications.colors.join(', ')}</span></div>
                  )}
                  {product.specifications.weight && (
                    <div><span className="label">Weight:</span> <span className="value">{product.specifications.weight}</span></div>
                  )}
                  {product.specifications.dimensions && (
                    <div><span className="label">Dimensions:</span> <span className="value">{product.specifications.dimensions}</span></div>
                  )}
                  {Array.isArray(product.specifications.compatibility) && product.specifications.compatibility.length > 0 && (
                    <div><span className="label">Compatibility:</span> <span className="value">{product.specifications.compatibility.join(', ')}</span></div>
                  )}
                  {product.specifications.material && (
                    <div><span className="label">Material:</span> <span className="value">{product.specifications.material}</span></div>
                  )}
                  {product.specifications.warranty && (
                    <div><span className="label">Warranty:</span> <span className="value">{product.specifications.warranty}</span></div>
                  )}
                </div>
              </div>
            )}

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
                      {variant.name || variant}
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
                  onClick={() => setQuantity(Math.min((stockQty || 1), quantity + 1))}
                  disabled={quantity >= stockQty}
                >
                  +
                </button>
              </div>
              <span className="stock-info">
                {inStock ? `${stockQty} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="product-actions">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                Add to Cart
              </button>
              <button 
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                Buy Now
              </button>
            </div>

            <div className="product-features">
              <h3>Key Features:</h3>
              <ul>
                {(product.features && product.features.length > 0) ? (
                  product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))
                ) : (
                  <>
                    <li>High-quality materials</li>
                    <li>1-year warranty</li>
                    <li>Fast shipping</li>
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
                <div key={relatedProduct._id} className="related-item" onClick={() => navigate(`/product/${relatedProduct._id}`)}>
                  <img 
                    src={relatedProduct.images?.[0]?.url || relatedProduct.image || 'https://via.placeholder.com/200x200?text=No+Image'} 
                    alt={relatedProduct.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                  <h4>{relatedProduct.name}</h4>
                  <p>{formatKES(relatedProduct.price)}</p>
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
