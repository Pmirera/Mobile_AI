# AI Enhanced Mobile Phones and Accessories Ecommerce Platform

A full-stack ecommerce platform built with React and Node.js, featuring AI-powered shopping experiences for mobile phones and accessories.

## 🚀 Features

### Core Ecommerce Features
- **Product Catalog**: Browse smartphones, headphones, chargers, cases, and accessories
- **Shopping Cart**: Add, remove, and manage items in your cart
- **User Authentication**: Secure login/register with JWT tokens
- **Order Management**: Complete checkout process with order tracking
- **User Profiles**: Manage personal information and view order history

### AI Features (Coming Soon)
- **Smart Recommendations**: Personalized product suggestions
- **AI-Powered Search**: Natural language and image-based search
- **Virtual Assistant**: 24/7 AI chatbot for customer support
- **Smart Filters**: Advanced filtering using AI
- **Price Prediction**: AI-powered price trend analysis
- **Visual Search**: Upload images to find similar products

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **React Router DOM** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **CSS3** - Styling with modern features

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Development Tools
- **Nodemon** - Development server
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Mobile_AI
```

### 2. Install Dependencies

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:

```bash
cd backend
touch .env
```

Add the following environment variables to `backend/.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/mobile_ai_ecommerce

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=5000
NODE_ENV=development

# AI Services (Optional - for future AI features)
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

**Local MongoDB:**
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or if using Homebrew on macOS
brew services start mongodb-community
```

**MongoDB Atlas:**
- Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a new cluster
- Get your connection string and update `MONGODB_URI` in `.env`

### 5. Seed the Database

Run the database seeding script to populate with sample data:

```bash
cd backend
npm run seed
```

This will create:
- 3 sample users (including admin)
- 8 sample products across different categories
- Properly hashed passwords

### 6. Start the Development Servers

**Start the backend server:**
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

**Start the frontend development server:**
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## 📱 Sample Accounts

After seeding the database, you can use these accounts to test the application:

### Regular Users
- **Email:** john@example.com
- **Password:** password123

- **Email:** jane@example.com
- **Password:** password123

### Admin User
- **Email:** admin@mobileai.com
- **Password:** admin123

## 🏗️ Project Structure

```
Mobile_AI/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Product.js           # Product model
│   │   └── Order.js             # Order model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── products.js          # Product routes
│   │   ├── users.js             # User routes
│   │   ├── orders.js            # Order routes
│   │   └── ai.js                # AI features routes
│   ├── scripts/
│   │   └── seedDatabase.js      # Database seeding script
│   ├── server.js                # Main server file
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation component
│   │   │   ├── Footer.js        # Footer component
│   │   │   ├── ProductCard.js   # Product display component
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   ├── AuthContext.js   # Authentication context
│   │   │   └── CartContext.js   # Shopping cart context
│   │   ├── pages/
│   │   │   ├── Home.js          # Home page
│   │   │   ├── Products.js      # Product listing
│   │   │   ├── ProductDetail.js # Product details
│   │   │   ├── Cart.js          # Shopping cart
│   │   │   ├── Checkout.js      # Checkout process
│   │   │   ├── Login.js         # Login page
│   │   │   ├── Register.js      # Registration page
│   │   │   ├── Profile.js       # User profile
│   │   │   └── AIFeatures.js    # AI features showcase
│   │   ├── services/
│   │   │   └── api.js           # API service
│   │   ├── App.js               # Main app component
│   │   └── index.js             # App entry point
│   └── package.json
└── README.md
```

## 🔧 Available Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
```

### Frontend Scripts
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run eject      # Eject from Create React App
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Orders
- `GET /api/orders` - Get user orders (protected)
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders/:id` - Get order by ID (protected)

### AI Features (Placeholder)
- `POST /api/ai/recommendations` - Get product recommendations
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/image-search` - Search products by image
- `POST /api/ai/smart-filters` - Apply smart filters

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with gradients and animations
- **User-Friendly Navigation**: Intuitive menu and breadcrumbs
- **Product Filtering**: Category, price range, and sorting options
- **Shopping Cart**: Real-time cart updates and quantity management
- **Checkout Process**: Multi-step checkout with form validation
- **User Dashboard**: Profile management and order history

## 🔮 Future Enhancements

### AI Features Implementation
- Integrate OpenAI API for chatbot functionality
- Implement image recognition for visual search
- Add machine learning for personalized recommendations
- Create price prediction algorithms

### Additional Features
- Payment gateway integration (Stripe, PayPal)
- Email notifications and order confirmations
- Product reviews and ratings system
- Wishlist functionality
- Advanced search with filters
- Multi-language support
- Dark mode theme
- Progressive Web App (PWA) features

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify network connectivity for MongoDB Atlas

**Port Already in Use:**
- Change the PORT in `.env` file
- Kill existing processes using the port

**Module Not Found:**
- Run `npm install` in both backend and frontend directories
- Clear npm cache: `npm cache clean --force`

**CORS Issues:**
- Ensure backend is running on the correct port
- Check CORS configuration in `server.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@mobileai.com or create an issue in the repository.

---

**Happy Shopping! 🛒✨**
