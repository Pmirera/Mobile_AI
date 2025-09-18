import { formatKES } from '../utils/currency';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { productsAPI } from '../services/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState('name');

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'smartphones', label: 'Smartphones' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'cases', label: 'Cases & Covers' },
    { value: 'chargers', label: 'Chargers' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'screen-protectors', label: 'Screen Protectors' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING PRODUCTS FOR CUSTOMERS ===');
      const response = await productsAPI.getProducts();
  
      console.log("Frontend products response:", response.data);
      console.log("Products array:", response.data.products);
      console.log("Products length:", response.data.products?.length);
  
      // Handle both cases: if backend returns { products: [...] } or just [...]
      const productsData = response.data.products || response.data || [];
      console.log("Final products data:", productsData);
      console.log("Final products length:", productsData.length);
  
      setProducts(productsData);
      
      // Calculate dynamic price range based on actual products
      if (productsData.length > 0) {
        const prices = productsData.map(p => p.price).filter(price => price != null);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setMaxPrice(maxPrice);
          setPriceRange([minPrice, maxPrice]);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // ensure products state is at least an empty array
    } finally {
      setLoading(false);
    }
  };
  
  

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleMinPriceChange = (value) => {
    const newMin = parseInt(value);
    if (newMin <= priceRange[1]) {
      setPriceRange([newMin, priceRange[1]]);
    }
  };

  const handleMaxPriceChange = (value) => {
    const newMax = parseInt(value);
    if (newMax >= priceRange[0]) {
      setPriceRange([priceRange[0], newMax]);
    }
  };

  // Update CSS custom properties for visual range indicator
  useEffect(() => {
    const sliderContainer = document.querySelector('.price-slider-container');
    if (sliderContainer && maxPrice > 0) {
      const minPercent = (priceRange[0] / maxPrice) * 100;
      const maxPercent = (priceRange[1] / maxPrice) * 100;
      sliderContainer.style.setProperty('--min-percent', minPercent);
      sliderContainer.style.setProperty('--max-percent', maxPercent);
    }
  }, [priceRange, maxPrice]);

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const resetPriceRange = () => {
    if (products.length > 0) {
      const prices = products.map(p => p.price).filter(price => price != null);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange([minPrice, maxPrice]);
      }
    }
  };

  if (loading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="page-header">
          <h1>Our Products</h1>
          <p>Discover the latest mobile phones and accessories</p>
        </div>

        <div className="products-layout">
          <div className="filters-sidebar">
            <div className="filter-section">
              <h3>Search</h3>
              <SearchBar onSearch={handleSearch} placeholder="Search products..." />
            </div>

            <div className="filter-section">
              <h3>Category</h3>
              <div className="category-filters">
                {categories.map(category => (
                  <button
                    key={category.value}
                    className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.value)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h3>Price Range</h3>
              <div className="price-range">
                <div className="price-inputs">
                  <div className="price-input-group">
                    <label>Min Price</label>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange[0]}
                      onChange={(e) => handleMinPriceChange(e.target.value)}
                      className="price-input"
                    />
                  </div>
                  <div className="price-input-group">
                    <label>Max Price</label>
                    <input
                      type="number"
                      min="0"
                      max={maxPrice}
                      value={priceRange[1]}
                      onChange={(e) => handleMaxPriceChange(e.target.value)}
                      className="price-input"
                    />
                  </div>
                </div>
                <div className="price-slider-container">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => handleMinPriceChange(e.target.value)}
                    className="price-slider price-slider-min"
                  />
                <input
                  type="range"
                  min="0"
                    max={maxPrice}
                  value={priceRange[1]}
                    onChange={(e) => handleMaxPriceChange(e.target.value)}
                    className="price-slider price-slider-max"
                />
                </div>
                <div className="price-labels">
                  <span>{formatKES(0)}</span>
                  <span className="price-range-display">
                    {formatKES(priceRange[0])} - {formatKES(priceRange[1])}
                  </span>
                  <span>{formatKES(maxPrice)}</span>
                </div>
                <button
                  type="button"
                  onClick={resetPriceRange}
                  className="price-reset-btn"
                >
                  Reset Range
                </button>
              </div>
            </div>

            <div className="filter-section">
              <h3>Sort By</h3>
              <select 
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div className="products-content">
            <div className="products-header">
              <p className="results-count">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
