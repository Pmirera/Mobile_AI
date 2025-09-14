import React, { useState } from 'react';
import './AIFeatures.css';

const AIFeatures = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleImageSearch = (e) => {
    e.preventDefault();
    // Placeholder for image search functionality
    console.log('Image search:', searchQuery);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      setChatHistory([...chatHistory, { type: 'user', message: chatMessage }]);
      // Placeholder for AI chatbot response
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          type: 'bot', 
          message: 'Thank you for your message! Our AI assistant is learning and will be available soon.' 
        }]);
      }, 1000);
      setChatMessage('');
    }
  };

  const aiFeatures = [
    {
      title: "Smart Product Recommendations",
      description: "Get personalized product suggestions based on your preferences and browsing history",
      icon: "🎯",
      status: "Coming Soon"
    },
    {
      title: "AI-Powered Search",
      description: "Find products using natural language queries and image recognition",
      icon: "🔍",
      status: "Coming Soon"
    },
    {
      title: "Virtual Assistant",
      description: "24/7 AI chatbot to help with product questions and support",
      icon: "🤖",
      status: "Coming Soon"
    },
    {
      title: "Smart Filters",
      description: "Advanced filtering using AI to understand your exact needs",
      icon: "⚡",
      status: "Coming Soon"
    },
    {
      title: "Price Prediction",
      description: "AI analyzes market trends to predict the best time to buy",
      icon: "📈",
      status: "Coming Soon"
    },
    {
      title: "Visual Search",
      description: "Upload an image to find similar products in our catalog",
      icon: "📸",
      status: "Coming Soon"
    }
  ];

  return (
    <div className="ai-features">
      <div className="container">
        <div className="hero-section">
          <h1>AI-Enhanced Shopping Experience</h1>
          <p>Discover the future of mobile shopping with our cutting-edge AI features</p>
        </div>

        <div className="features-grid">
          {aiFeatures.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="status-badge">{feature.status}</span>
            </div>
          ))}
        </div>

        <div className="demo-section">
          <div className="demo-card">
            <h2>Try Our AI Features</h2>
            
            <div className="demo-item">
              <h3>🔍 Image Search</h3>
              <p>Upload an image to find similar products</p>
              <form onSubmit={handleImageSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Describe what you're looking for..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>
            </div>

            <div className="demo-item">
              <h3>🤖 AI Chatbot</h3>
              <p>Ask questions about our products</p>
              <div className="chat-container">
                <div className="chat-history">
                  {chatHistory.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.type}`}>
                      <strong>{msg.type === 'user' ? 'You' : 'AI Assistant'}:</strong>
                      <p>{msg.message}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleChatSubmit} className="chat-form">
                  <input
                    type="text"
                    placeholder="Ask me anything about our products..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                  <button type="submit">Send</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="coming-soon">
          <h2>🚀 More AI Features Coming Soon</h2>
          <div className="upcoming-features">
            <div className="upcoming-item">
              <h4>Voice Search</h4>
              <p>Search products using voice commands</p>
            </div>
            <div className="upcoming-item">
              <h4>AR Try-On</h4>
              <p>See how accessories look on you using AR</p>
            </div>
            <div className="upcoming-item">
              <h4>Smart Notifications</h4>
              <p>Get notified when your favorite products go on sale</p>
            </div>
            <div className="upcoming-item">
              <h4>Personalized Deals</h4>
              <p>AI-curated deals based on your preferences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeatures;
