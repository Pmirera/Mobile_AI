import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Star } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
            >
              <Star className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-sm font-medium">AI-Enhanced Shopping Experience</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              Discover Your Perfect
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Mobile Device
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-blue-100 mb-8 max-w-2xl"
            >
              Experience the future of mobile shopping with AI-powered recommendations, 
              smart search, and personalized suggestions tailored just for you.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                to="/products"
                className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100 inline-flex items-center justify-center"
              >
                Shop Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/ai-features"
                className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-blue-600 inline-flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Explore AI Features
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20"
            >
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-blue-200 text-sm">Happy Customers</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-blue-200 text-sm">Products</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-blue-200 text-sm">AI Support</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Phone Mockup */}
              <div className="relative mx-auto w-80 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">AI Shopping</h3>
                    <p className="text-sm opacity-90">Smart Recommendations</p>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-2xl">📱</span>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-xl">🎧</span>
              </motion.div>

              <motion.div
                animate={{ y: [-5, 15, -5] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 -right-8 w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <span className="text-lg">⚡</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/70 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
