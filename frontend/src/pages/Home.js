import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Star, 
  Shield, 
  Truck, 
  Headphones, 
  Smartphone,
  Zap,
  Sparkles
} from 'lucide-react';
import { useQuery } from 'react-query';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Newsletter from '../components/Newsletter';

const Home = () => {
  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useQuery(
    'featured-products',
    () => {
      console.log('=== FETCHING FEATURED PRODUCTS ===');
      return productsAPI.getFeaturedProducts(8);
    },
    { 
      staleTime: 5 * 60 * 1000,
      onSuccess: (data) => {
        console.log('Featured products response:', data);
        console.log('Featured products array:', data?.data?.products);
      },
      onError: (error) => {
        console.error('Error fetching featured products:', error);
      }
    }
  );

  // Fetch trending products
  const { data: trendingData, isLoading: trendingLoading } = useQuery(
    'trending-products',
    () => {
      console.log('=== FETCHING TRENDING PRODUCTS ===');
      return productsAPI.getProducts({ sort: '-ratings.average', limit: 6 });
    },
    { 
      staleTime: 5 * 60 * 1000,
      onSuccess: (data) => {
        console.log('Trending products response:', data);
        console.log('Trending products array:', data?.data?.products);
      },
      onError: (error) => {
        console.error('Error fetching trending products:', error);
      }
    }
  );

  const categories = [
    {
      name: 'Smartphones',
      icon: Smartphone,
      path: '/products?category=smartphone',
      description: 'Latest mobile phones',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Accessories',
      icon: Headphones,
      path: '/products?category=accessory',
      description: 'Essential accessories',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Cases',
      icon: Shield,
      path: '/products?category=case',
      description: 'Protective cases',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Chargers',
      icon: Zap,
      path: '/products?category=charger',
      description: 'Fast charging solutions',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized product suggestions based on your preferences and browsing history.'
    },
    {
      icon: Star,
      title: 'Smart Search',
      description: 'Find exactly what you need with our intelligent search that understands context.'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Free shipping on orders over $100 with same-day delivery in select areas.'
    },
    {
      icon: Shield,
      title: 'Secure Shopping',
      description: 'Your data and payments are protected with enterprise-grade security.'
    }
  ];

  return (
    <div className="home min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our wide range of mobile phones and accessories, carefully curated for the best experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={category.path}
                  className="group block bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                  <div className="flex items-center text-blue-600 mt-4 group-hover:translate-x-1 transition-transform duration-300">
                    <span className="text-sm font-medium">Shop Now</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Handpicked products that our customers love. Discover the latest and greatest in mobile technology.
            </p>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center">
              {/* Tailwind spinner */}
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredData?.data.products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/products?featured=true"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View All Featured Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <Features features={features} />

      {/* Trending Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trending Now
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See what's popular among our customers. These products are flying off the shelves!
            </p>
          </div>

          {trendingLoading ? (
            <div className="flex justify-center">
              {/* Tailwind spinner */}
              <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingData?.data.products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              to="/products?sort=-ratings.average"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              View All Trending Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
};

export default Home;
