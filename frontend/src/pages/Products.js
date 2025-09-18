import { formatKES } from '../utils/currency';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { productsAPI } from '../services/api';
import './Products.css';
import PriceRangeFilter from '../components/PriceRangeFilter';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  // Hard bounds requested by user
  const HARD_MIN_PRICE = 100;
  const HARD_MAX_PRICE = 1000000;
  const [priceRange, setPriceRange] = useState([HARD_MIN_PRICE, HARD_MAX_PRICE]);
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
      const response = await productsAPI.getProducts();
      const productsData = response.data.products || response.data || [];
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
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

    // Clamp the working range to hard bounds and filter by price
    const [minP, maxP] = [
      Math.max(HARD_MIN_PRICE, Math.min(priceRange[0], HARD_MAX_PRICE)),
      Math.max(HARD_MIN_PRICE, Math.min(priceRange[1], HARD_MAX_PRICE))
    ];
    filtered = filtered.filter(product => {
      const price = Number(product.price);
      if (Number.isNaN(price)) return false; // skip items without numeric price
      return price >= minP && price <= maxP;
    });

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
    const newMin = Math.max(HARD_MIN_PRICE, Math.min(Number(value) || HARD_MIN_PRICE, priceRange[1]));
    setPriceRange([newMin, priceRange[1]]);
  };

  const handleMaxPriceChange = (value) => {
    const newMax = Math.min(HARD_MAX_PRICE, Math.max(Number(value) || HARD_MAX_PRICE, priceRange[0]));
    setPriceRange([priceRange[0], newMax]);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const resetPriceRange = () => {
    setPriceRange([HARD_MIN_PRICE, HARD_MAX_PRICE]);
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
              <PriceRangeFilter
                priceRange={priceRange}
                onMinChange={handleMinPriceChange}
                onMaxChange={handleMaxPriceChange}
                onReset={resetPriceRange}
              />
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
