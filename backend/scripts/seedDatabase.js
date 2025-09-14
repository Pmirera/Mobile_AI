const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

const sampleProducts = [
  {
    name: "iPhone 15 Pro",
    description: "The latest iPhone with titanium design, A17 Pro chip, and advanced camera system. Features a 6.1-inch Super Retina XDR display with ProMotion technology.",
    shortDescription: "Latest iPhone with titanium design and A17 Pro chip",
    category: "smartphone",
    brand: "Apple",
    model: "iPhone 15 Pro",
    price: 999,
    originalPrice: 1099,
    images: [
      { url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500", alt: "iPhone 15 Pro", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500", alt: "iPhone 15 Pro back" }
    ],
    specifications: {
      screenSize: "6.1 inches",
      resolution: "2556 x 1179 pixels",
      processor: "A17 Pro",
      ram: "8GB",
      storage: "128GB",
      camera: "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
      battery: "Up to 23 hours video playback",
      operatingSystem: "iOS 17",
      connectivity: ["5G", "Wi-Fi 6E", "Bluetooth 5.3"],
      colors: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
      weight: "187g",
      dimensions: "146.6 x 70.6 x 8.25 mm"
    },
    features: ["Titanium Design", "Action Button", "USB-C", "Pro Camera System", "Face ID"],
    inStock: true,
    stockQuantity: 50,
    sku: "IPH15PRO-128-NT",
    tags: ["iphone", "apple", "pro", "titanium", "5g"],
    isFeatured: true
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android smartphone with S Pen, 200MP camera, and AI-powered features. Features a 6.8-inch Dynamic AMOLED 2X display.",
    shortDescription: "Premium Android with S Pen and 200MP camera",
    category: "smartphone",
    brand: "Samsung",
    model: "Galaxy S24 Ultra",
    price: 1199,
    originalPrice: 1299,
    images: [
      { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500", alt: "Samsung Galaxy S24 Ultra", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500", alt: "Samsung Galaxy S24 Ultra back" }
    ],
    specifications: {
      screenSize: "6.8 inches",
      resolution: "3120 x 1440 pixels",
      processor: "Snapdragon 8 Gen 3",
      ram: "12GB",
      storage: "256GB",
      camera: "200MP Main, 50MP Periscope, 10MP Telephoto, 12MP Ultra Wide",
      battery: "5000mAh",
      operatingSystem: "Android 14",
      connectivity: ["5G", "Wi-Fi 7", "Bluetooth 5.3"],
      colors: ["Titanium Black", "Titanium Gray", "Titanium Violet", "Titanium Yellow"],
      weight: "232g",
      dimensions: "162.3 x 79.0 x 8.6 mm"
    },
    features: ["S Pen", "200MP Camera", "AI Features", "Titanium Frame", "Wireless Charging"],
    inStock: true,
    stockQuantity: 30,
    sku: "SGS24U-256-TB",
    tags: ["samsung", "galaxy", "ultra", "s-pen", "android"],
    isFeatured: true
  },
  {
    name: "Google Pixel 8 Pro",
    description: "Google's flagship smartphone with advanced AI features, excellent camera performance, and pure Android experience.",
    shortDescription: "Google's flagship with advanced AI and camera",
    category: "smartphone",
    brand: "Google",
    model: "Pixel 8 Pro",
    price: 899,
    originalPrice: 999,
    images: [
      { url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500", alt: "Google Pixel 8 Pro", isPrimary: true }
    ],
    specifications: {
      screenSize: "6.7 inches",
      resolution: "3120 x 1440 pixels",
      processor: "Google Tensor G3",
      ram: "12GB",
      storage: "128GB",
      camera: "50MP Main, 48MP Ultra Wide, 48MP Telephoto",
      battery: "5050mAh",
      operatingSystem: "Android 14",
      connectivity: ["5G", "Wi-Fi 7", "Bluetooth 5.3"],
      colors: ["Obsidian", "Porcelain", "Bay"],
      weight: "213g",
      dimensions: "162.6 x 76.5 x 8.8 mm"
    },
    features: ["Google AI", "Magic Eraser", "Call Screen", "Pure Android", "7 Years Updates"],
    inStock: true,
    stockQuantity: 25,
    sku: "GP8P-128-OBS",
    tags: ["google", "pixel", "ai", "android", "camera"],
    isFeatured: false
  },
  {
    name: "AirPods Pro (2nd Generation)",
    description: "Premium wireless earbuds with active noise cancellation, spatial audio, and up to 6 hours of listening time.",
    shortDescription: "Premium wireless earbuds with noise cancellation",
    category: "headphones",
    brand: "Apple",
    model: "AirPods Pro 2",
    price: 249,
    originalPrice: 279,
    images: [
      { url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500", alt: "AirPods Pro", isPrimary: true }
    ],
    specifications: {
      compatibility: ["iPhone", "iPad", "Mac", "Android"],
      material: "Plastic, Metal",
      warranty: "1 Year",
      battery: "Up to 6 hours listening time",
      connectivity: ["Bluetooth 5.3", "H2 Chip"],
      features: ["Active Noise Cancellation", "Spatial Audio", "Adaptive Transparency"]
    },
    features: ["Active Noise Cancellation", "Spatial Audio", "Adaptive Transparency", "H2 Chip"],
    inStock: true,
    stockQuantity: 100,
    sku: "APP2-WHT",
    tags: ["airpods", "apple", "wireless", "noise-cancellation"],
    isFeatured: true
  },
  {
    name: "Samsung Galaxy Buds2 Pro",
    description: "Premium wireless earbuds with intelligent active noise cancellation and 24-bit Hi-Fi audio.",
    shortDescription: "Premium wireless earbuds with Hi-Fi audio",
    category: "headphones",
    brand: "Samsung",
    model: "Galaxy Buds2 Pro",
    price: 199,
    originalPrice: 229,
    images: [
      { url: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500", alt: "Samsung Galaxy Buds2 Pro", isPrimary: true }
    ],
    specifications: {
      compatibility: ["Samsung Galaxy", "Android", "iOS"],
      material: "Plastic, Metal",
      warranty: "1 Year",
      battery: "Up to 5 hours listening time",
      connectivity: ["Bluetooth 5.3"],
      features: ["Intelligent ANC", "24-bit Hi-Fi", "360 Audio"]
    },
    features: ["Intelligent ANC", "24-bit Hi-Fi Audio", "360 Audio", "Voice Detect"],
    inStock: true,
    stockQuantity: 75,
    sku: "SGB2P-BLK",
    tags: ["samsung", "galaxy-buds", "wireless", "hi-fi"],
    isFeatured: false
  },
  {
    name: "iPhone 15 Pro Max Clear Case",
    description: "Crystal clear protective case for iPhone 15 Pro Max. Made from premium materials with precise cutouts and wireless charging compatibility.",
    shortDescription: "Clear protective case for iPhone 15 Pro Max",
    category: "case",
    brand: "Apple",
    model: "iPhone 15 Pro Max Case",
    price: 49,
    originalPrice: 59,
    images: [
      { url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500", alt: "iPhone 15 Pro Max Clear Case", isPrimary: true }
    ],
    specifications: {
      compatibility: ["iPhone 15 Pro Max"],
      material: "Polycarbonate",
      warranty: "1 Year",
      features: ["Wireless Charging Compatible", "Precise Cutouts", "Drop Protection"]
    },
    features: ["Crystal Clear", "Drop Protection", "Wireless Charging", "Precise Fit"],
    inStock: true,
    stockQuantity: 200,
    sku: "IPH15PM-CASE-CLR",
    tags: ["iphone", "case", "clear", "protection"],
    isFeatured: false
  },
  {
    name: "Samsung 25W Super Fast Charger",
    description: "Fast charging adapter with USB-C port. Compatible with Samsung Galaxy devices and other USB-C devices.",
    shortDescription: "25W fast charging adapter with USB-C",
    category: "charger",
    brand: "Samsung",
    model: "25W Super Fast Charger",
    price: 29,
    originalPrice: 35,
    images: [
      { url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500", alt: "Samsung 25W Charger", isPrimary: true }
    ],
    specifications: {
      compatibility: ["Samsung Galaxy", "USB-C Devices"],
      material: "Plastic",
      warranty: "1 Year",
      output: "25W",
      connector: "USB-C"
    },
    features: ["Super Fast Charging", "USB-C", "Compact Design", "Safety Protection"],
    inStock: true,
    stockQuantity: 150,
    sku: "SSC-25W-USB-C",
    tags: ["samsung", "charger", "fast-charging", "usb-c"],
    isFeatured: false
  },
  {
    name: "Tempered Glass Screen Protector",
    description: "High-quality tempered glass screen protector with 9H hardness and bubble-free installation. Compatible with most smartphones.",
    shortDescription: "9H hardness tempered glass screen protector",
    category: "screen_protector",
    brand: "Generic",
    model: "Tempered Glass Protector",
    price: 15,
    originalPrice: 20,
    images: [
      { url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=500", alt: "Tempered Glass Screen Protector", isPrimary: true }
    ],
    specifications: {
      compatibility: ["Universal"],
      material: "Tempered Glass",
      warranty: "6 Months",
      hardness: "9H",
      features: ["Bubble-Free", "Crystal Clear", "Easy Installation"]
    },
    features: ["9H Hardness", "Bubble-Free", "Crystal Clear", "Easy Installation"],
    inStock: true,
    stockQuantity: 300,
    sku: "TGP-UNIV-9H",
    tags: ["screen-protector", "tempered-glass", "protection", "universal"],
    isFeatured: false
  }
];

const sampleUsers = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123",
    phone: "+1234567890",
    address: {
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    }
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    password: "password123",
    phone: "+1234567891",
    address: {
      street: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA"
    }
  },
  {
    firstName: "Admin",
    lastName: "User",
    email: "admin@mobileai.com",
    password: "admin123",
    phone: "+1234567892",
    role: "admin",
    address: {
      street: "789 Admin Blvd",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      country: "USA"
    }
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile_ai_ecommerce');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Seed products
    const products = await Product.insertMany(sampleProducts);
    console.log(`Seeded ${products.length} products`);

    // Seed users with hashed passwords
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );
    const users = await User.insertMany(hashedUsers);
    console.log(`Seeded ${users.length} users`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
