# Admin Panel Documentation

## Overview

The MobileAI application now includes a comprehensive admin panel that allows administrators to manage products and system settings. This document provides information about the admin functionality and how to use it.

## Features

### Admin Dashboard
- **Product Management**: View, create, edit, and delete products
- **Product Status Control**: Activate/deactivate products
- **Inventory Management**: Track stock quantities and product availability
- **Search and Filtering**: Advanced search and filtering capabilities
- **Statistics Dashboard**: Overview of total products, active products, out-of-stock items, and total inventory value

### Product Management
- **Add New Products**: Complete product creation form with specifications
- **Edit Existing Products**: Modify product details, pricing, and inventory
- **Delete Products**: Remove products from the system
- **Toggle Product Status**: Activate or deactivate products
- **Image Management**: Add multiple product images with primary image selection
- **Specifications**: Detailed product specifications including technical details
- **Features and Tags**: Add product features and tags for better categorization

## Access Control

### Admin Authentication
- Only users with `role: 'admin'` can access the admin panel
- Admin routes are protected by the `AdminRoute` component
- Non-admin users are redirected to the home page if they try to access admin routes

### User Roles
- **User**: Regular customers (default role)
- **Admin**: System administrators with full access to admin panel

## Getting Started

### Creating an Admin User

1. **Using the Script** (Recommended):
   ```bash
   cd backend
   node scripts/createAdminUser.js
   ```
   
   This creates an admin user with:
   - Email: `admin@mobileai.com`
   - Password: `admin123`
   - Role: `admin`

2. **Manual Creation**:
   - Register a new user through the normal registration process
   - Update the user's role to 'admin' in the database:
     ```javascript
     // In MongoDB
     db.users.updateOne(
       { email: "your-email@example.com" },
       { $set: { role: "admin" } }
     )
     ```

### Accessing the Admin Panel

1. **Login**: Use your admin credentials to log in to the application
2. **Navigation**: Look for the "Admin Panel" link in the user dropdown menu (desktop) or mobile menu
3. **Direct Access**: Navigate to `/admin` (requires admin authentication)

## Admin Panel Features

### Dashboard Overview
The admin dashboard provides:
- **Statistics Cards**: Quick overview of key metrics
- **Product Table**: Comprehensive list of all products with actions
- **Search and Filters**: Find products quickly
- **Pagination**: Navigate through large product catalogs

### Product Form
The product creation/editing form includes:

#### Basic Information
- Product name, brand, model
- Category selection
- SKU (with auto-generation)
- Pricing (price and original price)
- Stock quantity

#### Descriptions
- Short description (for product cards)
- Full description (detailed product information)

#### Images
- Multiple image URLs
- Primary image selection
- Image management (add/remove)

#### Specifications
- Technical specifications (screen size, processor, RAM, etc.)
- Connectivity options
- Available colors
- Material and warranty information

#### Features and Tags
- Product features (add/remove)
- Tags for categorization

#### Status Options
- Active/Inactive toggle
- Featured product option

## API Endpoints

### Admin Product Routes
- `POST /api/products/admin` - Create new product
- `GET /api/products/admin/all` - Get all products (including inactive)
- `PUT /api/products/admin/:id` - Update product
- `DELETE /api/products/admin/:id` - Delete product
- `PUT /api/products/admin/:id/toggle-status` - Toggle product status

### Authentication Required
All admin routes require:
- Valid JWT token
- User role must be 'admin'

## Security Considerations

1. **Role-Based Access**: Admin routes are protected by middleware that checks user role
2. **Authentication**: All admin operations require valid authentication
3. **Input Validation**: All forms include client and server-side validation
4. **Error Handling**: Comprehensive error handling for all operations

## Usage Tips

### Product Management
1. **SKU Generation**: Use the "Generate" button to create unique SKUs automatically
2. **Image Management**: Set a primary image for better product display
3. **Status Control**: Use the eye icon to quickly toggle product visibility
4. **Bulk Operations**: Use filters to manage multiple products efficiently

### Best Practices
1. **Product Images**: Use high-quality images with consistent aspect ratios
2. **Descriptions**: Write clear, detailed descriptions for better SEO
3. **Specifications**: Fill in all relevant specifications for better customer experience
4. **Tags**: Use consistent tagging for better product organization

## Troubleshooting

### Common Issues
1. **Access Denied**: Ensure user has admin role
2. **Form Validation**: Check all required fields are filled
3. **Image Issues**: Verify image URLs are accessible
4. **SKU Conflicts**: Ensure SKUs are unique across all products

### Support
For technical issues or questions about the admin panel, refer to the development team or check the application logs for detailed error messages.

## Future Enhancements

Potential future improvements to the admin panel:
- Bulk product operations
- Product import/export functionality
- Advanced analytics and reporting
- Order management
- User management
- Content management system
- SEO optimization tools
