import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Upload, Package } from 'lucide-react';
import { adminProductsAPI, uploadAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProductForm = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    category: 'smartphone',
    brand: '',
    model: '',
    price: '',
    originalPrice: '',
    sku: '',
    stockQuantity: '',
    inStock: true,
    isActive: true,
    isFeatured: false,
    images: [],
    specifications: {
      screenSize: '',
      resolution: '',
      processor: '',
      ram: '',
      storage: '',
      camera: '',
      battery: '',
      operatingSystem: '',
      connectivity: [],
      colors: [],
      weight: '',
      dimensions: '',
      compatibility: [],
      material: '',
      warranty: ''
    },
    features: [],
    tags: []
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newConnectivity, setNewConnectivity] = useState('');
  const [newColor, setNewColor] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const categories = [
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'accessory', label: 'Accessory' },
    { value: 'case', label: 'Case' },
    { value: 'charger', label: 'Charger' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'screen_protector', label: 'Screen Protector' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        stockQuantity: product.stockQuantity?.toString() || '',
        specifications: {
          screenSize: product.specifications?.screenSize || '',
          resolution: product.specifications?.resolution || '',
          processor: product.specifications?.processor || '',
          ram: product.specifications?.ram || '',
          storage: product.specifications?.storage || '',
          camera: product.specifications?.camera || '',
          battery: product.specifications?.battery || '',
          operatingSystem: product.specifications?.operatingSystem || '',
          connectivity: product.specifications?.connectivity || [],
          colors: product.specifications?.colors || [],
          weight: product.specifications?.weight || '',
          dimensions: product.specifications?.dimensions || '',
          compatibility: product.specifications?.compatibility || [],
          material: product.specifications?.material || '',
          warranty: product.specifications?.warranty || ''
        },
        features: product.features || [],
        tags: product.tags || [],
        images: product.images || []
      });
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSpecificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  const handleArrayChange = (field, value, action = 'add') => {
    setFormData(prev => ({
      ...prev,
      [field]: action === 'add' 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSpecificationArrayChange = (field, value, action = 'add') => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: action === 'add' 
          ? [...prev.specifications[field], value]
          : prev.specifications[field].filter(item => item !== value)
      }
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      selectedFiles.forEach(file => {
        uploadFormData.append('images', file);
      });

      const response = await uploadAPI.uploadImages(uploadFormData);
      
      // Handle different response structures
      const images = response.data?.images || response.data?.imageUrls || [];
      if (!Array.isArray(images)) {
        throw new Error('Invalid response format from server');
      }
      
      const newImages = images.map(img => ({
        url: img.url || img.imageUrl,
        alt: formData.name || 'Product image',
        isPrimary: formData.images.length === 0
      }));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));

      setSelectedFiles([]);
      toast.success(`${images.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload images';
      console.error('Upload error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMsg
      });
      toast.error(`Upload failed: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      const newImage = {
        url: newImageUrl.trim(),
        alt: formData.name || 'Product image',
        isPrimary: formData.images.length === 0
      };
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }));
  };

  const generateSKU = () => {
    const brand = formData.brand.replace(/\s+/g, '').toUpperCase();
    const model = formData.model.replace(/\s+/g, '').toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${brand}-${model}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.brand || !formData.model || !formData.price || !formData.sku) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        inStock: formData.stockQuantity > 0
      };

      if (product) {
        await adminProductsAPI.updateProduct(product._id, submitData);
        toast.success('Product updated successfully');
      } else {
        await adminProductsAPI.createProduct(submitData);
        toast.success('Product created successfully');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, sku: generateSKU() }))}
                    className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Original Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Descriptions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
                <span className="text-red-500 text-sm ml-1">(Max 200 characters)</span>
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleInputChange}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description for product cards"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.shortDescription.length}/200 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <div className="space-y-4">
                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">
                    Upload product images (JPG, PNG, GIF up to 5MB each)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Images
                  </label>
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedFiles.length} file(s) selected
                      </p>
                      <button
                        type="button"
                        onClick={uploadImages}
                        disabled={uploading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {uploading ? 'Uploading...' : 'Upload Images'}
                      </button>
                    </div>
                  )}
                </div>

                {/* URL Input */}
                <div className="flex">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or enter image URL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addImage}
                    className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Add URL
                  </button>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="absolute bottom-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Set Primary
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                <div className="flex">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFeature.trim()) {
                        handleArrayChange('features', newFeature.trim());
                        setNewFeature('');
                      }
                    }}
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleArrayChange('features', feature, 'remove')}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="space-y-2">
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newTag.trim()) {
                        handleArrayChange('tags', newTag.trim());
                        setNewTag('');
                      }
                    }}
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleArrayChange('tags', tag, 'remove')}
                          className="ml-2 text-gray-600 hover:text-gray-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Screen Size
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.screenSize}
                    onChange={(e) => handleSpecificationChange('screenSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.resolution}
                    onChange={(e) => handleSpecificationChange('resolution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processor
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.processor}
                    onChange={(e) => handleSpecificationChange('processor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RAM
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.ram}
                    onChange={(e) => handleSpecificationChange('ram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.storage}
                    onChange={(e) => handleSpecificationChange('storage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Camera
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.camera}
                    onChange={(e) => handleSpecificationChange('camera', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Battery
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.battery}
                    onChange={(e) => handleSpecificationChange('battery', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Operating System
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.operatingSystem}
                    onChange={(e) => handleSpecificationChange('operatingSystem', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.weight}
                    onChange={(e) => handleSpecificationChange('weight', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.dimensions}
                    onChange={(e) => handleSpecificationChange('dimensions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.material}
                    onChange={(e) => handleSpecificationChange('material', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty
                  </label>
                  <input
                    type="text"
                    value={formData.specifications.warranty}
                    onChange={(e) => handleSpecificationChange('warranty', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Connectivity */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Connectivity
                </label>
                <div className="space-y-2">
                  <div className="flex">
                    <input
                      type="text"
                      value={newConnectivity}
                      onChange={(e) => setNewConnectivity(e.target.value)}
                      placeholder="Add connectivity option"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newConnectivity.trim()) {
                          handleSpecificationArrayChange('connectivity', newConnectivity.trim());
                          setNewConnectivity('');
                        }
                      }}
                      className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.specifications.connectivity.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.specifications.connectivity.map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() => handleSpecificationArrayChange('connectivity', item, 'remove')}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Colors */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Colors
                </label>
                <div className="space-y-2">
                  <div className="flex">
                    <input
                      type="text"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="Add color option"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newColor.trim()) {
                          handleSpecificationArrayChange('colors', newColor.trim());
                          setNewColor('');
                        }
                      }}
                      className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.specifications.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.specifications.colors.map((color, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => handleSpecificationArrayChange('colors', color, 'remove')}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Options */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Featured</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductForm;
