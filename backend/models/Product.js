const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['smartphone', 'accessory', 'case', 'charger', 'headphones', 'screen_protector', 'other']
  },
  brand: {
    type: String,
    required: [true, 'Product brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Product model is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  specifications: {
    // Smartphone specifications
    screenSize: String,
    resolution: String,
    processor: String,
    ram: String,
    storage: String,
    camera: String,
    battery: String,
    operatingSystem: String,
    connectivity: [String],
    colors: [String],
    weight: String,
    dimensions: String,
    
    // Accessory specifications
    compatibility: [String],
    material: String,
    warranty: String
  },
  features: [String],
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Stock quantity cannot be negative']
  },
  sku: {
    type: String,
    unique: true,
    required: true
  },
  tags: [String],
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  }
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  brand: 'text', 
  model: 'text',
  tags: 'text'
});

// Index for filtering
productSchema.index({ category: 1, brand: 1, price: 1, inStock: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Method to update average rating
productSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.ratings.count = this.reviews.length;
  }
};

module.exports = mongoose.model('Product', productSchema);
