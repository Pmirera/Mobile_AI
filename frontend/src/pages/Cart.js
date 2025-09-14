import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleCheckout = () => {
    console.log('=== CHECKOUT CLICKED ===');
    console.log('User object:', user);
    console.log('User type:', typeof user);
    console.log('User is null?', user === null);
    console.log('User is undefined?', user === undefined);
    console.log('Token from localStorage:', localStorage.getItem('token'));
    
    if (!user) {
      console.log('User not found, redirecting to login');
      navigate('/login');
      return;
    }
    console.log('User found, navigating to checkout');
    navigate('/checkout');
  };

  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 100 ? 0 : 10; // Free shipping over $100
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>{cartItems?.length || 0} item{(cartItems?.length || 0) !== 1 ? 's' : ''} in your cart</p>
        </div>

        <div className="cart-layout">
          <div className="cart-items">
            {cartItems?.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                    }}
                  />
                </div>

                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-category">{item.category}</p>
                  {item.variant && (
                    <p className="item-variant">Variant: {item.variant.name}</p>
                  )}
                  <p className="item-price">${item.price}</p>
                </div>

                <div className="item-quantity">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  <p className="total-price">${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <div className="item-actions">
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            <div className="cart-actions">
              <button 
                className="clear-cart-btn"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <Link to="/products" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Tax:</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping:</span>
                <span>
                  {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
                </span>
              </div>
              
              {calculateSubtotal() < 100 && (
                <div className="shipping-note">
                  <p>Add ${(100 - calculateSubtotal()).toFixed(2)} more for free shipping!</p>
                </div>
              )}
              
              <div className="summary-row total">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>

              <div className="payment-methods">
                <p>We accept:</p>
                <div className="payment-icons">
                  <span>💳</span>
                  <span>🏦</span>
                  <span>📱</span>
                  <span>💰</span>
                </div>
              </div>
            </div>

            <div className="security-info">
              <h4>🔒 Secure Checkout</h4>
              <p>Your payment information is encrypted and secure.</p>
            </div>

            <div className="shipping-info">
              <h4>🚚 Shipping Information</h4>
              <ul>
                <li>Free shipping on orders over $100</li>
                <li>Standard shipping: 3-5 business days</li>
                <li>Express shipping: 1-2 business days</li>
                <li>International shipping available</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
