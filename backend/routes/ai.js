const express = require('express');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @route   POST /api/ai/recommendations
// @desc    Get AI-powered product recommendations
// @access  Private
router.post('/recommendations', auth, async (req, res) => {
  try {
    const { preferences, budget, category, currentProductId } = req.body;
    
    // Get user's order history and wishlist for context
    const user = await User.findById(req.userId).populate('orderHistory wishlist');
    
    // Get user's purchase history
    const purchasedProducts = user.orderHistory || [];
    const wishlistProducts = user.wishlist || [];
    
    // Build context for AI
    let context = `User preferences: ${JSON.stringify(preferences || {})}. Budget: ${budget || 'flexible'}. Category: ${category || 'any'}.`;
    
    if (purchasedProducts.length > 0) {
      context += ` User has previously purchased products in categories: ${purchasedProducts.map(p => p.category).join(', ')}.`;
    }
    
    if (wishlistProducts.length > 0) {
      context += ` User has products in wishlist: ${wishlistProducts.map(p => p.name).join(', ')}.`;
    }

    // Get similar products from database
    let query = { isActive: true };
    if (category) query.category = category;
    if (budget) {
      query.price = { $lte: parseFloat(budget) };
    }

    const availableProducts = await Product.find(query)
      .limit(50)
      .select('name description price category brand specifications features');

    // Use OpenAI to generate recommendations
    const prompt = `
    Based on the following context and available products, recommend 5 products that would be most suitable for this user.
    
    Context: ${context}
    
    Available products: ${JSON.stringify(availableProducts.slice(0, 20))}
    
    Please return a JSON array with product recommendations including reasoning for each recommendation.
    Format: [{"productId": "id", "reason": "why this product is recommended", "confidence": 0.8}]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    const recommendations = JSON.parse(completion.choices[0].message.content);
    
    // Get full product details for recommended products
    const recommendedProducts = await Product.find({
      _id: { $in: recommendations.map(r => r.productId) },
      isActive: true
    });

    res.json({
      recommendations: recommendedProducts.map(product => {
        const rec = recommendations.find(r => r.productId === product._id.toString());
        return {
          product,
          reason: rec?.reason || 'Recommended based on your preferences',
          confidence: rec?.confidence || 0.7
        };
      })
    });

  } catch (error) {
    console.error('AI recommendations error:', error);
    
    // Fallback to simple recommendations
    const fallbackProducts = await Product.find({ isActive: true })
      .sort({ 'ratings.average': -1, isFeatured: -1 })
      .limit(5);
    
    res.json({
      recommendations: fallbackProducts.map(product => ({
        product,
        reason: 'Popular choice based on ratings',
        confidence: 0.6
      }))
    });
  }
});

// @route   POST /api/ai/chatbot
// @desc    AI chatbot for customer support
// @access  Public
router.post('/chatbot', [
  body('message').isString().isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters'),
  body('conversationId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, conversationId } = req.body;

    // Get product information for context
    const products = await Product.find({ isActive: true })
      .select('name description price category brand')
      .limit(20);

    const productContext = products.map(p => 
      `${p.name} (${p.brand}) - ${p.category} - $${p.price} - ${p.description.substring(0, 100)}...`
    ).join('\n');

    const prompt = `
    You are a helpful customer service representative for a mobile phones and accessories ecommerce store.
    
    Available products:
    ${productContext}
    
    Customer message: "${message}"
    
    Please provide a helpful response. If the customer is asking about products, be specific and mention relevant products.
    Keep your response concise and friendly. If you need more information, ask clarifying questions.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;

    res.json({
      response,
      conversationId: conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      response: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact our support team.",
      conversationId: conversationId || `conv_${Date.now()}`,
      timestamp: new Date().toISOString()
    });
  }
});

// @route   POST /api/ai/image-search
// @desc    AI-powered image search for products
// @access  Public
router.post('/image-search', [
  body('imageUrl').isURL().withMessage('Please provide a valid image URL'),
  body('description').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { imageUrl, description } = req.body;

    // Use OpenAI Vision API to analyze the image
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and identify what mobile phone or accessory is shown. 
              Provide details about brand, model, type (smartphone, case, charger, etc.), 
              and any distinctive features. If you can't identify the product clearly, 
              describe what you see in general terms.`
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const imageAnalysis = completion.choices[0].message.content;

    // Search for similar products based on the analysis
    const searchTerms = imageAnalysis.toLowerCase();
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerms, $options: 'i' } },
        { description: { $regex: searchTerms, $options: 'i' } },
        { brand: { $regex: searchTerms, $options: 'i' } },
        { model: { $regex: searchTerms, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerms, 'i')] } }
      ],
      isActive: true
    }).limit(10);

    res.json({
      analysis: imageAnalysis,
      products,
      searchTerms: searchTerms.split(' ').filter(term => term.length > 2)
    });

  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({ 
      message: 'Error processing image search',
      analysis: 'Unable to analyze image at this time',
      products: []
    });
  }
});

// @route   POST /api/ai/smart-filters
// @desc    AI-powered smart filtering suggestions
// @access  Public
router.post('/smart-filters', [
  body('query').isString().isLength({ min: 1, max: 200 }).withMessage('Query must be between 1 and 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query } = req.body;

    // Get all available filter options
    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });
    const priceRanges = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    const prompt = `
    Based on the user query "${query}", suggest the most relevant filters from these options:
    
    Categories: ${categories.join(', ')}
    Brands: ${brands.join(', ')}
    Price range: $${priceRanges[0]?.minPrice || 0} - $${priceRanges[0]?.maxPrice || 1000}
    
    Return a JSON object with suggested filters:
    {
      "suggestedCategory": "most relevant category or null",
      "suggestedBrands": ["list of relevant brands"],
      "suggestedPriceRange": {"min": number, "max": number},
      "reasoning": "why these filters are suggested"
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    });

    const suggestions = JSON.parse(completion.choices[0].message.content);

    res.json({
      query,
      suggestions,
      availableFilters: {
        categories,
        brands,
        priceRange: priceRanges[0] || { minPrice: 0, maxPrice: 1000 }
      }
    });

  } catch (error) {
    console.error('Smart filters error:', error);
    res.status(500).json({ 
      message: 'Error generating smart filters',
      suggestions: null
    });
  }
});

// @route   GET /api/ai/trending
// @desc    Get AI-analyzed trending products
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    // Get products with high ratings and recent reviews
    const trendingProducts = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ['$ratings.average', 0.4] },
              { $multiply: ['$ratings.count', 0.1] },
              { $cond: [{ $eq: ['$isFeatured', true] }, 0.2, 0] },
              { $multiply: [{ $divide: [{ $subtract: [new Date(), '$createdAt'] }, 86400000] }, -0.1] }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: 10 }
    ]);

    res.json({ trendingProducts });
  } catch (error) {
    console.error('Trending products error:', error);
    res.status(500).json({ message: 'Error fetching trending products' });
  }
});

module.exports = router;
