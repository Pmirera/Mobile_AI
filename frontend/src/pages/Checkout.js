import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { productsAPI, paymentsAPI, ordersAPI } from '../services/api';
import { formatKES } from '../utils/currency';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState({
    shippingAddress: {
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    billingAddress: {
      sameAsShipping: true,
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    payment: {
      method: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: '',
      mpesaPhone: ''
    },
    shipping: {
      method: 'standard'
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, cartItems, navigate]);

  const handleInputChange = (section, field, value) => {
    setOrderData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBillingToggle = (sameAsShipping) => {
    setOrderData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        sameAsShipping,
        ...(sameAsShipping ? prev.shippingAddress : {})
      }
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08;
  };

  const calculateShipping = () => {
    const shippingRates = {
      standard: calculateSubtotal() > 15000 ? 0 : 1000,
      express: 2500,
      overnight: 5000
    };
    return shippingRates[orderData.shipping.method];
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        const shipping = orderData.shippingAddress;
        return shipping.firstName && shipping.lastName && shipping.street && 
               shipping.city && shipping.state && shipping.zipCode && shipping.country;
      case 2:
        const payment = orderData.payment;
        if (payment.method === 'card') {
          return payment.cardNumber && payment.expiryDate && payment.cvv && payment.nameOnCard;
        } else if (payment.method === 'mpesa') {
          return payment.mpesaPhone && payment.mpesaPhone.length >= 10;
        }
        return false;
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      console.log('=== PLACING ORDER ===');
      console.log('Cart items:', cartItems);
      console.log('Order data:', orderData);
      
      // Transform cart items to match backend expectations
      const transformedItems = cartItems.map(item => {
        console.log('Cart item:', item);
        console.log('Item ID:', item.id);
        console.log('Item ID type:', typeof item.id);
        return {
          productId: item.id, // Backend expects productId, not _id
          quantity: item.quantity
        };
      });

      // Transform addresses to match backend expectations
      const shippingAddress = {
        name: `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
        street: orderData.shippingAddress.street,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        zipCode: orderData.shippingAddress.zipCode,
        country: orderData.shippingAddress.country
      };

      const billingAddress = orderData.billingAddress.sameAsShipping ? 
        shippingAddress : {
          name: `${orderData.billingAddress.firstName} ${orderData.billingAddress.lastName}`,
          street: orderData.billingAddress.street,
          city: orderData.billingAddress.city,
          state: orderData.billingAddress.state,
          zipCode: orderData.billingAddress.zipCode,
          country: orderData.billingAddress.country
        };

      // Transform payment method to match backend expectations
      const paymentMethod = {
        type: orderData.payment.method === 'card' ? 'credit_card' : 'mpesa',
        details: orderData.payment.method === 'card' ? {
          cardLast4: orderData.payment.cardNumber.slice(-4),
          cardBrand: 'Visa' // You can detect this based on card number
        } : {
          transactionId: null // Will be set to CheckoutRequestID after STK push
        }
      };

      const orderPayload = {
        items: transformedItems,
        shippingAddress,
        billingAddress,
        paymentMethod
      };

      console.log('Order payload:', orderPayload);
      console.log('Making API call to /api/orders');

      // Test if products exist before placing order
      for (const item of transformedItems) {
        try {
          console.log(`Testing product ${item.productId}...`);
          const productResponse = await productsAPI.getProduct(item.productId);
          console.log(`Product ${item.productId} exists:`, productResponse.data);
        } catch (error) {
          console.error(`Product ${item.productId} not found:`, error.response?.data);
          throw new Error(`Product ${item.productId} not found in database`);
        }
      }

      if (orderData.payment.method === 'mpesa') {
        try {
          const stkAmount = Number(calculateTotal().toFixed(0));
          const phone = orderData.payment.mpesaPhone;
          console.log('Initiating M-Pesa STK Push:', { stkAmount, phone });
          const stkResp = await paymentsAPI.initiateMpesaStkPush({
            amount: stkAmount,
            phone,
            accountReference: 'ORDER',
            description: 'Order Payment'
          });
          console.log('STK Push response:', stkResp.data);
          // Persist CheckoutRequestID onto order payload for callback mapping
          const checkoutId = stkResp?.data?.data?.CheckoutRequestID || stkResp?.data?.CheckoutRequestID;
          if (checkoutId) {
            paymentMethod.details.transactionId = checkoutId;
          }
          alert('We sent an MPesa prompt to your phone. Please enter your PIN to approve the payment.');
        } catch (mpesaErr) {
          console.error('Failed to initiate M-Pesa STK Push:', mpesaErr.response?.data || mpesaErr.message);
          // Show detailed Daraja error if available
          const details = mpesaErr.response?.data?.details || mpesaErr.response?.data?.error?.errorMessage || mpesaErr.response?.data?.errorMessage;
          throw new Error(details || 'Failed to initiate STK Push');
        }
      }

      const response = await ordersAPI.createOrder(orderPayload);
      console.log('Order response:', response.data);
      const orderId = response.data?.order?._id || response.data?._id;
      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const backendMsg = error.response?.data?.message;
      const validationErrors = error.response?.data?.errors;
      const detailed = Array.isArray(validationErrors) && validationErrors.length
        ? validationErrors.map(e => e.msg).join(', ')
        : (typeof backendMsg === 'string' ? backendMsg : null);
      alert(detailed || error.message || 'Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Payment</span>
            </div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Review</span>
            </div>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-form">
            {step === 1 && (
              <div className="checkout-step">
                <h2>Shipping Information</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shippingFirstName">First Name</label>
                    <input
                      type="text"
                      id="shippingFirstName"
                      value={orderData.shippingAddress.firstName}
                      onChange={(e) => handleInputChange('shippingAddress', 'firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shippingLastName">Last Name</label>
                    <input
                      type="text"
                      id="shippingLastName"
                      value={orderData.shippingAddress.lastName}
                      onChange={(e) => handleInputChange('shippingAddress', 'lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="shippingStreet">Street Address</label>
                  <input
                    type="text"
                    id="shippingStreet"
                    value={orderData.shippingAddress.street}
                    onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shippingCity">City</label>
                    <input
                      type="text"
                      id="shippingCity"
                      value={orderData.shippingAddress.city}
                      onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shippingState">State</label>
                    <input
                      type="text"
                      id="shippingState"
                      value={orderData.shippingAddress.state}
                      onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shippingZipCode">ZIP Code</label>
                    <input
                      type="text"
                      id="shippingZipCode"
                      value={orderData.shippingAddress.zipCode}
                      onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="shippingCountry">Country</label>
                  <input
                    type="text"
                    id="shippingCountry"
                    value={orderData.shippingAddress.country}
                    onChange={(e) => handleInputChange('shippingAddress', 'country', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shippingMethod">Shipping Method</label>
                  <select
                    id="shippingMethod"
                    value={orderData.shipping.method}
                    onChange={(e) => handleInputChange('shipping', 'method', e.target.value)}
                  >
                    <option value="standard">Standard (3-5 days) - {calculateSubtotal() > 15000 ? 'FREE' : formatKES(1000)}</option>
                    <option value="express">Express (1-2 days) - {formatKES(2500)}</option>
                    <option value="overnight">Overnight - {formatKES(5000)}</option>
                  </select>
                </div>

                <div className="step-actions">
                  <button 
                    className="next-btn"
                    onClick={handleNextStep}
                    disabled={!validateStep(1)}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="checkout-step">
                <h2>Payment Information</h2>
                
                <div className="form-group">
                  <label htmlFor="billingSameAsShipping">
                    <input
                      type="checkbox"
                      id="billingSameAsShipping"
                      checked={orderData.billingAddress.sameAsShipping}
                      onChange={(e) => handleBillingToggle(e.target.checked)}
                    />
                    Billing address same as shipping address
                  </label>
                </div>

                <div className="form-group">
                  <label>Payment Method</label>
                  <div className="payment-methods">
                    <div className="payment-method-option">
                      <input
                        type="radio"
                        id="card-payment"
                        name="paymentMethod"
                        value="card"
                        checked={orderData.payment.method === 'card'}
                        onChange={(e) => handleInputChange('payment', 'method', e.target.value)}
                      />
                      <label htmlFor="card-payment" className="payment-method-label">
                        <span className="payment-icon">💳</span>
                        <span>Credit/Debit Card</span>
                      </label>
                    </div>
                    <div className="payment-method-option">
                      <input
                        type="radio"
                        id="mpesa-payment"
                        name="paymentMethod"
                        value="mpesa"
                        checked={orderData.payment.method === 'mpesa'}
                        onChange={(e) => handleInputChange('payment', 'method', e.target.value)}
                      />
                      <label htmlFor="mpesa-payment" className="payment-method-label">
                        <span className="payment-icon">📱</span>
                        <span>MPesa</span>
                      </label>
                    </div>
                  </div>
                </div>

                {!orderData.billingAddress.sameAsShipping && (
                  <div className="billing-address">
                    <h3>Billing Address</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="billingFirstName">First Name</label>
                        <input
                          type="text"
                          id="billingFirstName"
                          value={orderData.billingAddress.firstName}
                          onChange={(e) => handleInputChange('billingAddress', 'firstName', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="billingLastName">Last Name</label>
                        <input
                          type="text"
                          id="billingLastName"
                          value={orderData.billingAddress.lastName}
                          onChange={(e) => handleInputChange('billingAddress', 'lastName', e.target.value)}
                        />
                      </div>
                    </div>
                    {/* Add more billing address fields as needed */}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="nameOnCard">Name on Card</label>
                  <input
                    type="text"
                    id="nameOnCard"
                    value={orderData.payment.nameOnCard}
                    onChange={(e) => handleInputChange('payment', 'nameOnCard', e.target.value)}
                    required
                  />
                </div>

                {orderData.payment.method === 'card' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="nameOnCard">Name on Card</label>
                      <input
                        type="text"
                        id="nameOnCard"
                        value={orderData.payment.nameOnCard}
                        onChange={(e) => handleInputChange('payment', 'nameOnCard', e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input
                        type="text"
                        id="cardNumber"
                        value={orderData.payment.cardNumber}
                        onChange={(e) => handleInputChange('payment', 'cardNumber', e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                          type="text"
                          id="expiryDate"
                          value={orderData.payment.expiryDate}
                          onChange={(e) => handleInputChange('payment', 'expiryDate', e.target.value)}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input
                          type="text"
                          id="cvv"
                          value={orderData.payment.cvv}
                          onChange={(e) => handleInputChange('payment', 'cvv', e.target.value)}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {orderData.payment.method === 'mpesa' && (
                  <div className="mpesa-payment">
                    <div className="mpesa-info">
                      <h3>📱 MPesa Payment</h3>
                      <p>You will receive an MPesa prompt on your phone to complete the payment.</p>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="mpesaPhone">Phone Number</label>
                      <input
                        type="tel"
                        id="mpesaPhone"
                        value={orderData.payment.mpesaPhone}
                        onChange={(e) => handleInputChange('payment', 'mpesaPhone', e.target.value)}
                        placeholder="+254 7XX XXX XXX"
                        required
                      />
                      <small>Enter your MPesa registered phone number</small>
                    </div>

                    <div className="mpesa-instructions">
                      <h4>How it works:</h4>
                      <ol>
                        <li>Enter your MPesa registered phone number</li>
                        <li>Click "Review Order" to proceed</li>
                        <li>You'll receive an MPesa prompt on your phone</li>
                        <li>Enter your MPesa PIN to complete payment</li>
                      </ol>
                    </div>
                  </div>
                )}

                <div className="step-actions">
                  <button 
                    className="prev-btn"
                    onClick={handlePrevStep}
                  >
                    Back to Shipping
                  </button>
                  <button 
                    className="next-btn"
                    onClick={handleNextStep}
                    disabled={!validateStep(2)}
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="checkout-step">
                <h2>Review Your Order</h2>
                
                <div className="order-review">
                  <div className="review-section">
                    <h3>Shipping Address</h3>
                    <p>
                      {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}<br />
                      {orderData.shippingAddress.street}<br />
                      {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}<br />
                      {orderData.shippingAddress.country}
                    </p>
                  </div>

                  <div className="review-section">
                    <h3>Payment Method</h3>
                    {orderData.payment.method === 'card' ? (
                      <p>
                        **** **** **** {orderData.payment.cardNumber.slice(-4)}<br />
                        {orderData.payment.nameOnCard}
                      </p>
                    ) : (
                      <p>
                        📱 MPesa<br />
                        {orderData.payment.mpesaPhone}
                      </p>
                    )}
                  </div>

                  <div className="review-section">
                    <h3>Order Items</h3>
                    <div className="order-items">
                      {cartItems.map(item => (
                        <div key={item._id} className="order-item">
                          <img src={item.image} alt={item.name} />
                          <div>
                            <h4>{item.name}</h4>
                            <p>Quantity: {item.quantity}</p>
                            <p>{formatKES(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="step-actions">
                  <button 
                    className="prev-btn"
                    onClick={handlePrevStep}
                  >
                    Back to Payment
                  </button>
                  <button 
                    className="place-order-btn"
                    onClick={handleSubmitOrder}
                    disabled={loading}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatKES(calculateSubtotal())}</span>
              </div>
              
              <div className="summary-row">
                <span>Tax:</span>
                <span>{formatKES(calculateTax())}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping:</span>
                <span>
                  {calculateShipping() === 0 ? 'FREE' : formatKES(calculateShipping())}
                </span>
              </div>
              
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatKES(calculateTotal())}</span>
              </div>
            </div>

            <div className="security-info">
              <h4>🔒 Secure Checkout</h4>
              <p>Your payment information is encrypted and secure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
