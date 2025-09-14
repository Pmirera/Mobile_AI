const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('wishlist');
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ message: 'Server error while fetching wishlist' });
  }
});

// @route   POST /api/users/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/wishlist/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.userId);
    
    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();

    res.json({ message: 'Product added to wishlist successfully' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ message: 'Server error while adding to wishlist' });
  }
});

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/wishlist/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.userId);
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json({ message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ message: 'Server error while removing from wishlist' });
  }
});

// @route   GET /api/users/orders
// @desc    Get user's order history
// @access  Private
router.get('/orders', auth, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const orders = await Order.find({ user: req.userId })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/users/recommendations
// @desc    Get personalized product recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('orderHistory wishlist');
    
    // Get user's purchase history categories
    const purchasedCategories = user.orderHistory?.map(order => 
      order.items?.map(item => item.product?.category)
    ).flat().filter(Boolean) || [];

    // Get user's wishlist categories
    const wishlistCategories = user.wishlist?.map(product => product.category) || [];

    // Combine and get most common categories
    const allCategories = [...purchasedCategories, ...wishlistCategories];
    const categoryCounts = allCategories.reduce((acc, category) => {
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.keys(categoryCounts)
      .sort((a, b) => categoryCounts[b] - categoryCounts[a])
      .slice(0, 3);

    // Get recommended products based on user preferences
    let query = { isActive: true };
    if (topCategories.length > 0) {
      query.category = { $in: topCategories };
    }

    const recommendations = await Product.find(query)
      .sort({ 'ratings.average': -1, isFeatured: -1 })
      .limit(8);

    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error while fetching recommendations' });
  }
});

module.exports = router;
