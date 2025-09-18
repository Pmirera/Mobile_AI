import React, { useState } from 'react';
import './AIFeatures.css';
import { aiAPI } from '../services/api';

const AIFeatures = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [imageDesc, setImageDesc] = useState('');
  const [imageResults, setImageResults] = useState(null);

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [conversationId, setConversationId] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [smartQuery, setSmartQuery] = useState('');
  const [smartFilters, setSmartFilters] = useState(null);
  const [trending, setTrending] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingSmart, setLoadingSmart] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);

  const handleImageSearch = async (e) => {
    e.preventDefault();
    if (!imageUrl) return;
    try {
      setLoadingImage(true);
      const res = await aiAPI.imageSearch(imageUrl, imageDesc);
      setImageResults(res.data);
    } catch (err) {
      console.error('Image search error:', err);
      setImageResults({ analysis: 'Unable to analyze image at this time', products: [] });
    } finally {
      setLoadingImage(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    const newHistory = [...chatHistory, { type: 'user', message: chatMessage }];
    setChatHistory(newHistory);
    setChatLoading(true);
    try {
      const res = await aiAPI.chatBot(chatMessage, conversationId || undefined);
      setConversationId(res.data.conversationId);
      setChatHistory([...newHistory, { type: 'bot', message: res.data.response }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setChatHistory([...newHistory, { type: 'bot', message: 'Sorry, I had trouble responding. Please try again.' }]);
    } finally {
      setChatMessage('');
      setChatLoading(false);
    }
  };

  const handleSmartFilters = async (e) => {
    e.preventDefault();
    if (!smartQuery.trim()) return;
    try {
      setLoadingSmart(true);
      const res = await aiAPI.smartFilters(smartQuery);
      setSmartFilters(res.data);
    } catch (err) {
      console.error('Smart filters error:', err);
      setSmartFilters(null);
    } finally {
      setLoadingSmart(false);
    }
  };

  const handleTrending = async () => {
    try {
      setLoadingTrending(true);
      const res = await aiAPI.getTrending();
      setTrending(res.data.trendingProducts || res.data);
    } catch (err) {
      console.error('Trending error:', err);
      setTrending([]);
    } finally {
      setLoadingTrending(false);
    }
  };

  return (
    <div className="ai-features">
      <div className="container">
        <div className="hero-section">
          <h1>AI-Enhanced Shopping Experience</h1>
          <p>Discover the future of mobile shopping with our cutting-edge AI features</p>
        </div>

        <div className="demo-section">
          <div className="demo-card">
            <h2>Try Our AI Features</h2>

            <div className="demo-item">
              <h3>🔍 Image Search</h3>
              <p>Paste an image URL to find similar products</p>
              <form onSubmit={handleImageSearch} className="search-form">
                <input
                  type="url"
                  placeholder="https://example.com/phone.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Optional: describe the image"
                  value={imageDesc}
                  onChange={(e) => setImageDesc(e.target.value)}
                />
                <button type="submit" disabled={loadingImage}>{loadingImage ? 'Searching...' : 'Search'}</button>
              </form>
              {imageResults && (
                <div className="result-block">
                  <h4>Analysis</h4>
                  <p>{imageResults.analysis}</p>
                  <h4>Similar Products</h4>
                  <div className="products-row">
                    {(imageResults.products || []).map((p) => (
                      <div key={p._id} className="mini-card">
                        <img src={p.images?.[0]?.url} alt={p.name} />
                        <div className="mini-title">{p.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <button type="submit" disabled={chatLoading}>{chatLoading ? 'Sending...' : 'Send'}</button>
                </form>
              </div>
            </div>

            <div className="demo-item">
              <h3>🧠 Smart Filters</h3>
              <p>Let AI suggest the best filters for your search</p>
              <form onSubmit={handleSmartFilters} className="search-form">
                <input
                  type="text"
                  placeholder="e.g. budget gaming phone with good battery"
                  value={smartQuery}
                  onChange={(e) => setSmartQuery(e.target.value)}
                />
                <button type="submit" disabled={loadingSmart}>{loadingSmart ? 'Thinking...' : 'Suggest'}</button>
              </form>
              {smartFilters && (
                <div className="result-block">
                  <pre>{JSON.stringify(smartFilters, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="demo-item">
              <h3>🔥 Trending (AI-analyzed)</h3>
              <button onClick={handleTrending} disabled={loadingTrending}>{loadingTrending ? 'Loading...' : 'Load Trending'}</button>
              {Array.isArray(trending) && (
                <div className="products-row">
                  {trending.map((p) => (
                    <div key={p._id || p.product?._id} className="mini-card">
                      <img src={(p.images?.[0]?.url) || (p.product?.images?.[0]?.url)} alt={p.name || p.product?.name} />
                      <div className="mini-title">{p.name || p.product?.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIFeatures;
