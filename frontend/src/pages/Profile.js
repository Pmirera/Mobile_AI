import { formatKES } from '../utils/currency';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const u = response.data.user || {};
      const [firstName = '', ...rest] = (u.name || '').split(' ');
      const lastName = rest.join(' ');
      setProfileData({
        firstName,
        lastName,
        email: u.email || '',
        phone: u.phone || '',
        address: {
          street: u.address?.street || '',
          city: u.address?.city || '',
          state: u.address?.state || '',
          zipCode: u.address?.zipCode || '',
          country: u.address?.country || ''
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        phone: profileData.phone,
        address: profileData.address
      };
      await api.put('/auth/profile', payload);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your account settings and view your orders</p>
        </div>

        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="profile-nav">
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                📝 Profile Information
              </button>
              <button 
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                📦 Order History
              </button>
              <button 
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️ Account Settings
              </button>
            </div>
          </div>

          <div className="profile-content">
            {activeTab === 'profile' && (
              <div className="profile-tab">
                <h2>Profile Information</h2>
                {message && (
                  <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <h3>Address Information</h3>
                  <div className="form-group">
                    <label htmlFor="address.street">Street Address</label>
                    <input
                      type="text"
                      id="address.street"
                      name="address.street"
                      value={profileData.address.street}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="address.city">City</label>
                      <input
                        type="text"
                        id="address.city"
                        name="address.city"
                        value={profileData.address.city}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address.state">State</label>
                      <input
                        type="text"
                        id="address.state"
                        name="address.state"
                        value={profileData.address.state}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="address.zipCode">ZIP Code</label>
                      <input
                        type="text"
                        id="address.zipCode"
                        name="address.zipCode"
                        value={profileData.address.zipCode}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address.country">Country</label>
                      <input
                        type="text"
                        id="address.country"
                        name="address.country"
                        value={profileData.address.country}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="save-btn"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="profile-tab">
                <h2>Order History</h2>
                {orders.length === 0 ? (
                  <div className="no-orders">
                    <p>You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order._id} className="order-item">
                        <div className="order-header">
                          <h4>Order #{order.orderNumber}</h4>
                          <span className={`status ${order.status}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="order-details">
                          <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                          <p>Total: {formatKES(order.totalAmount)}</p>
                          <p>Items: {order.items.length}</p>
                        </div>
                        <div className="order-items">
                          {order.items.map((item, index) => (
                            <div key={index} className="order-item-detail">
                              <img src={item.product.image} alt={item.product.name} />
                              <div>
                                <h5>{item.product.name}</h5>
                                <p>Quantity: {item.quantity}</p>
                                <p>Price: {formatKES(item.price)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="profile-tab">
                <h2>Account Settings</h2>
                <div className="settings-section">
                  <h3>Security</h3>
                  <button className="settings-btn">
                    Change Password
                  </button>
                  <button className="settings-btn">
                    Two-Factor Authentication
                  </button>
                </div>

                <div className="settings-section">
                  <h3>Notifications</h3>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Email notifications</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>SMS notifications</span>
                  </label>
                </div>

                <div className="settings-section">
                  <h3>Danger Zone</h3>
                  <button className="danger-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
