const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['name', 'price', 'rating', 'createdAt', '-name', '-price', '-rating', '-createdAt']).withMessage('Invalid sort parameter'),
  query('category').optional().isIn(['smartphone', 'accessory', 'case', 'charger', 'headphones', 'screen_protector', 'other']).withMessage('Invalid category'),
  query('brand').optional().isString().trim(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('inStock').optional().isBoolean().withMessage('In stock must be a boolean'),
  query('featured').optional().isBoolean().withMessage('Featured must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      featured
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = new RegExp(brand, 'i');
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reviews.user', 'name avatar');

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isFeatured: true,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.json({ products });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({ message: 'Server error while fetching featured products' });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 8 } = req.query;

    const products = await Product.find({
      category,
      isActive: true
    })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.json({ products });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   GET /api/products/brand/:brand
// @desc    Get products by brand
// @access  Public
router.get('/brand/:brand', async (req, res) => {
  try {
    const { brand } = req.params;
    const { limit = 8 } = req.query;

    const products = await Product.find({
      brand: new RegExp(brand, 'i'),
      isActive: true
    })
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(parseInt(limit));

    res.json({ products });
  } catch (error) {
    console.error('Get products by brand error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar')
      .populate({
        path: 'reviews',
        options: { sort: { createdAt: -1 } }
      });

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// @route   GET /api/products/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await Product.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { brand: { $regex: q, $options: 'i' } },
            { model: { $regex: q, $options: 'i' } }
          ]
        }
      },
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          products: { $push: { name: '$name', model: '$model', _id: '$_id' } }
        }
      },
      { $limit: 5 }
    ]);

    res.json({ suggestions });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ message: 'Server error while fetching suggestions' });
  }
});

// @route   POST /api/products/:id/review
// @desc    Add product review
// @access  Private
router.post('/:id/review', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.userId.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add review
    product.reviews.push({
      user: req.userId,
      rating,
      comment
    });

    // Update average rating
    product.updateRating();
    await product.save();

    // Populate the new review
    await product.populate('reviews.user', 'name avatar');

    res.status(201).json({
      message: 'Review added successfully',
      review: product.reviews[product.reviews.length - 1]
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error while adding review' });
  }
});

// @route   GET /api/products/brands/list
// @desc    Get list of all brands
// @access  Public
router.get('/brands/list', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true });
    res.json({ brands: brands.sort() });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error while fetching brands' });
  }
});

// ==================== ADMIN ROUTES ====================

// @route   POST /api/products/admin
// @desc    Create new product (Admin only)
// @access  Private/Admin
router.post('/admin', admin, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('category').isIn(['smartphone', 'accessory', 'case', 'charger', 'headphones', 'screen_protector', 'other']).withMessage('Invalid category'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const productData = req.body;
    
    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// @route   PUT /api/products/admin/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/admin/:id', admin, [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Product description cannot be empty'),
  body('category').optional().isIn(['smartphone', 'accessory', 'case', 'charger', 'headphones', 'screen_protector', 'other']).withMessage('Invalid category'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stockQuantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if SKU is being changed and if it already exists
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// @route   DELETE /api/products/admin/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
router.delete('/admin/:id', admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

// @route   GET /api/products/admin/all
// @desc    Get all products for admin (including inactive)
// @access  Private/Admin
router.get('/admin/all', admin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      search,
      category,
      brand,
      inStock,
      isActive
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = new RegExp(brand, 'i');
    }

    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    // Execute query
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reviews.user', 'name avatar');

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   PUT /api/products/admin/:id/toggle-status
// @desc    Toggle product active status (Admin only)
// @access  Private/Admin
router.put('/admin/:id/toggle-status', admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      product
    });
  } catch (error) {
    console.error('Toggle product status error:', error);
    res.status(500).json({ message: 'Server error while updating product status' });
  }
});

module.exports = router;
