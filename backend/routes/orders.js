const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.productId').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('billingAddress').isObject().withMessage('Billing address is required'),
  body('paymentMethod').isObject().withMessage('Payment method is required'),
  body('paymentMethod.type').isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'mpesa']).withMessage('Invalid payment method type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    // Validate products and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.inStock || product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.images[0]?.url || ''
      });
    }

    // Calculate tax (simplified - 8% tax)
    const tax = subtotal * 0.08;
    
    // Calculate shipping (free over $100, otherwise $10)
    const shipping = subtotal >= 100 ? 0 : 10;
    
    // Calculate total
    const total = subtotal + tax + shipping;

    // Create order
    const order = new Order({
      user: req.userId,
      items: orderItems,
      shippingAddress,
      billingAddress,
      paymentMethod,
      pricing: {
        subtotal,
        tax,
        shipping,
        total
      },
      notes
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Populate order with product details
    await order.populate('items.product');

    res.status(201).json({
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { user: req.userId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.userId
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', auth, [
  body('reason').optional().isString().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
], async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel order that has been shipped or delivered' });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: item.quantity }
      });
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Server error while cancelling order' });
  }
});

// @route   GET /api/orders/tracking/:orderNumber
// @desc    Track order by order number
// @access  Public
router.get('/tracking/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate('items.product', 'name image')
      .select('-user'); // Don't expose user information

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error while tracking order' });
  }
});

module.exports = router;
