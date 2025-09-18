import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Filter,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { adminProductsAPI } from '../services/api';
import ProductForm from '../components/ProductForm';
import toast from 'react-hot-toast';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    isActive: '',
    inStock: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    totalValue: 0
  });

  useEffect(() => {
    console.log('=== useEffect triggered - calling fetchProducts ===');
    console.log('Dependencies:', { pagination: pagination.currentPage, searchTerm, filters });
    console.log('fetchProducts function:', typeof fetchProducts);
    try {
      console.log('About to call fetchProducts...');
      if (typeof fetchProducts === 'function') {
        fetchProducts();
        console.log('fetchProducts called successfully');
      } else {
        console.error('fetchProducts is not a function!');
      }
    } catch (error) {
      console.error('Error calling fetchProducts:', error);
    }
  }, [pagination.currentPage, searchTerm, filters]);

  // Debug log for products state
  useEffect(() => {
    console.log('Products state updated:', products);
    console.log('Products length:', products.length);
  }, [products]);

  // Debug log for stats state
  useEffect(() => {
    console.log('Stats state updated:', stats);
    console.log('Stats values:', {
      totalProducts: stats.totalProducts,
      activeProducts: stats.activeProducts,
      outOfStock: stats.outOfStock,
      totalValue: stats.totalValue
    });
  }, [stats]);

  const fetchProducts = async () => {
    console.log('=== FETCH PRODUCTS FUNCTION CALLED ===');
    try {
      console.log('=== FETCH PRODUCTS STARTED ===');
      console.log('Current token:', localStorage.getItem('token'));
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 20,
        ...filters
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }

      console.log('Fetching products with params:', params);
      console.log('Making API call to adminProductsAPI.getAllProducts...');
      
      const response = await adminProductsAPI.getAllProducts(params);
      console.log('API Response received:', response);
      console.log('API Response data:', response.data);
      console.log('Products in response:', response.data?.products);
      console.log('Number of products:', response.data?.products?.length);
      
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      
      // Calculate stats
      const allProducts = response.data.products;
      const totalProducts = response.data.pagination.totalProducts;
      const activeProducts = allProducts.filter(p => p.isActive).length;
      const outOfStock = allProducts.filter(p => p.stockQuantity === 0).length;
      const totalValue = allProducts.reduce((sum, p) => sum + (p.price * p.stockQuantity), 0);
      
      console.log('Calculated stats:', { totalProducts, activeProducts, outOfStock, totalValue });
      
      // Update stats state
      const newStats = {
        totalProducts,
        activeProducts,
        outOfStock,
        totalValue
      };
      
      console.log('Setting new stats:', newStats);
      setStats(newStats);
      console.log('setStats called with:', newStats);
    } catch (error) {
      console.error('=== ERROR IN FETCH PRODUCTS ===');
      console.error('Error fetching products:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response statusText:', error.response?.statusText);
      console.error('Error config:', error.config);
      console.error('Error request headers:', error.config?.headers);
      toast.error('Failed to fetch products');
    } finally {
      console.log('=== FETCH PRODUCTS FINISHED ===');
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminProductsAPI.deleteProduct(productId);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      await adminProductsAPI.toggleProductStatus(productId);
      toast.success('Product status updated');
      fetchProducts();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleProductFormClose = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      isActive: '',
      inStock: ''
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (showProductForm) {
    return (
      <ProductForm 
        product={editingProduct}
        onClose={handleProductFormClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your products and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            key={`total-${stats.totalProducts}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            key={`active-${stats.activeProducts}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            key={`outofstock-${stats.outOfStock}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Package className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            key={`value-${stats.totalValue}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalValue)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="smartphone">Smartphones</option>
                  <option value="accessory">Accessories</option>
                  <option value="case">Cases</option>
                  <option value="charger">Chargers</option>
                  <option value="headphones">Headphones</option>
                  <option value="screen_protector">Screen Protectors</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={filters.isActive}
                  onChange={(e) => handleFilterChange('isActive', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>

                <select
                  value={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Stock</option>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>

                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Add Product Button */}
            <button
              onClick={handleCreateProduct}
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500">Get started by adding your first product.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={product.images[0].url}
                                  alt={product.name}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.brand} {product.model}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.stockQuantity > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stockQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleToggleStatus(product._id)}
                              className={`p-2 rounded-lg transition-colors ${
                                product.isActive 
                                  ? 'text-gray-600 hover:text-red-600 hover:bg-red-50' 
                                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={product.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {product.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={!pagination.hasPrev}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={!pagination.hasNext}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{' '}
                        <span className="font-medium">
                          {((pagination.currentPage - 1) * 20) + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {Math.min(pagination.currentPage * 20, pagination.totalProducts)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium">{pagination.totalProducts}</span>{' '}
                        results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                          disabled={!pagination.hasPrev}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                          disabled={!pagination.hasNext}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
