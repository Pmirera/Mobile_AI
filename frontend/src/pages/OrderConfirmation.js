import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/api/orders/${orderId}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="error">
            <h2>Order Not Found</h2>
            <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link to="/" className="btn btn-primary">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        <div className="order-details">
          <div className="order-info">
            <h2>Order Details</h2>
            <div className="info-row">
              <span>Order Number:</span>
              <span className="order-number">{order.orderNumber}</span>
            </div>
            <div className="info-row">
              <span>Order Date:</span>
              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span>Status:</span>
              <span className={`status status-${order.status}`}>{order.status}</span>
            </div>
            <div className="info-row">
              <span>Total Amount:</span>
              <span className="total">${order.pricing.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="shipping-info">
            <h3>Shipping Address</h3>
            <p>
              {order.shippingAddress.name}<br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div className="payment-info">
            <h3>Payment Method</h3>
            <p>
              {order.paymentMethod.type === 'credit_card' ? '💳 Credit Card' : '📱 MPesa'}<br />
              {order.paymentMethod.details.cardLast4 && `**** **** **** ${order.paymentMethod.details.cardLast4}`}
            </p>
          </div>
        </div>

        <div className="order-items">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ${item.price.toFixed(2)}</p>
                </div>
                <div className="item-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${order.pricing.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>${order.pricing.tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping:</span>
            <span>{order.pricing.shipping === 0 ? 'FREE' : `$${order.pricing.shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>${order.pricing.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
          <Link to="/profile" className="btn btn-primary">View My Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
