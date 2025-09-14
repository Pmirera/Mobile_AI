const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    name: String, // Store product name at time of order
    image: String // Store product image at time of order
  }],
  shippingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String
  },
  billingAddress: {
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'mpesa'],
      required: true
    },
    details: {
      cardLast4: String,
      cardBrand: String,
      transactionId: String
    }
  },
  pricing: {
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  tracking: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String
  },
  notes: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    try {
      const count = await mongoose.model('Order').countDocuments();
      this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating order number:', error);
      // Fallback order number
      this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  next();
});

// Calculate total before saving
orderSchema.pre('save', function(next) {
  this.pricing.total = this.pricing.subtotal + this.pricing.tax + this.pricing.shipping - this.pricing.discount;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
