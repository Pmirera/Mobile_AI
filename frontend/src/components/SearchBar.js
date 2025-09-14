import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { productsAPI } from '../services/api';
import { useQuery } from 'react-query';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Debounced search for suggestions
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length >= 2) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const response = await productsAPI.getSearchSuggestions(query);
          setSuggestions(response.data.suggestions || []);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setQuery('');
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const searchTerm = suggestion._id || suggestion.name;
    handleSearch(searchTerm);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay hiding suggestions to allow clicking on them
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder="Search for phones, accessories..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div key={index}>
                <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                  {suggestion._id} ({suggestion.count} products)
                </div>
                {suggestion.products?.slice(0, 3).map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleSuggestionClick(product)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-gray-500">{product.model}</div>
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popular Searches */}
      <AnimatePresence>
        {isFocused && query.length < 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
          >
            <div className="px-3 py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
              Popular Searches
            </div>
            {['iPhone 15', 'Samsung Galaxy', 'AirPods', 'Phone Cases', 'Wireless Charger'].map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
              >
                {term}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
