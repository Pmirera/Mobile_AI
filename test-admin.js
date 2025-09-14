const axios = require('axios');

async function testAdminRoute() {
  try {
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@mobileai.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token:', token.substring(0, 20) + '...');
    
    // Test admin route
    const adminResponse = await axios.get('http://localhost:5000/api/products/admin/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Admin route successful!');
    console.log('Response:', adminResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Wait for server to start
setTimeout(testAdminRoute, 3000);
