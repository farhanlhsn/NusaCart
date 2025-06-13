import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI, generalCategoryAPI, tokoAPI } from '../services/api';

const ProductCreator = () => {
  const [categories, setCategories] = useState([]);
  const [generalCategories, setGeneralCategories] = useState([]);
  const [myStores, setMyStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [createdProduct, setCreatedProduct] = useState(null);

  const [productData, setProductData] = useState({
    productName: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    tokoId: '',
    generalCategory: '',
    isActive: true
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, generalCategoriesRes, storesRes] = await Promise.all([
        categoryAPI.getAll(0, 100),
        generalCategoryAPI.getAll(),
        tokoAPI.getMyStores()
      ]);

      setCategories(categoriesRes.data.content || categoriesRes.data);
      setGeneralCategories(generalCategoriesRes.data);
      setMyStores(storesRes.data);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load form data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Validate file count (max 5)
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('Only JPEG, PNG, and WebP images are allowed');
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Each image must be smaller than 5MB');
      return;
    }

    setSelectedImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setError(null);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Clean up the removed URL
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    if (!productData.productName.trim()) {
      setError('Product name is required');
      return false;
    }
    if (!productData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!productData.price || parseFloat(productData.price) <= 0) {
      setError('Valid price is required');
      return false;
    }
    if (!productData.stock || parseInt(productData.stock) < 0) {
      setError('Valid stock quantity is required');
      return false;
    }
    if (!productData.categoryId) {
      setError('Category is required');
      return false;
    }
    if (!productData.tokoId) {
      setError('Store is required');
      return false;
    }
    if (!productData.generalCategory) {
      setError('General category is required');
      return false;
    }
    if (selectedImages.length === 0) {
      setError('At least 1 product image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare form data
      const formData = new FormData();
      
      // Add product data as JSON string (required parameter name: 'productData')
      const productDataJson = {
        productName: productData.productName.trim(),
        description: productData.description.trim(),
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
        categoryId: parseInt(productData.categoryId),
        tokoId: parseInt(productData.tokoId),
        generalCategory: productData.generalCategory,
        isActive: productData.isActive
      };
      
      formData.append('productData', JSON.stringify(productDataJson));
      
      // Add images (required parameter name: 'images')
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      console.log('Creating product with data:', productDataJson);
      console.log('Number of images:', selectedImages.length);

      const response = await productAPI.create(formData);
      
      setSuccess(`Product "${response.data.productName}" created successfully!`);
      setCreatedProduct(response.data);
      
      // Reset form
      setProductData({
        productName: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        tokoId: '',
        generalCategory: '',
        isActive: true
      });
      setSelectedImages([]);
      setImagePreviews([]);
      
      // Clear file input
      const fileInput = document.getElementById('images');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.response?.data?.message || 'Failed to create product');
      setCreatedProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create New Product</h1>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span>{success}</span>
            <button onClick={clearMessages} className="text-green-700 hover:text-green-900">×</button>
          </div>
          {/* Preview gambar dari produk yang baru dibuat */}
          {createdProduct && createdProduct.imageUrls && createdProduct.imageUrls.length > 0 && (
            <div className="flex gap-2 mt-2">
              {createdProduct.imageUrls.map((url, idx) => (
                <img key={idx} src={url.startsWith('http') ? url : `http://localhost:6060${url}`} alt={`Uploaded ${idx+1}`} className="w-24 h-24 object-cover rounded border" />
              ))}
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between">
          <span>{error}</span>
          <button onClick={clearMessages} className="text-red-700 hover:text-red-900">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <input
                type="text"
                name="productName"
                value={productData.productName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Price (Rp) *</label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                step="1000"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={productData.stock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select
                name="categoryId"
                value={productData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.idCategory} value={category.idCategory}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Store *</label>
              <select
                name="tokoId"
                value={productData.tokoId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select Store</option>
                {myStores.map(store => (
                  <option key={store.idToko} value={store.idToko}>
                    {store.storeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">General Category *</label>
              <select
                name="generalCategory"
                value={productData.generalCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              >
                <option value="">Select General Category</option>
                {generalCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
              required
              disabled={loading}
            />
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={productData.isActive}
                onChange={handleInputChange}
                className="mr-2"
                disabled={loading}
              />
              Product is active
            </label>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Product Images *</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Upload Images (1-5 images, max 5MB each)
            </label>
            <input
              type="file"
              id="images"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPEG, PNG, WebP
            </p>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear the form?')) {
                setProductData({
                  productName: '',
                  description: '',
                  price: '',
                  stock: '',
                  categoryId: '',
                  tokoId: '',
                  generalCategory: '',
                  isActive: true
                });
                setSelectedImages([]);
                setImagePreviews([]);
                const fileInput = document.getElementById('images');
                if (fileInput) fileInput.value = '';
                clearMessages();
              }
            }}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            disabled={loading}
          >
            Clear Form
          </button>
          
          <button
            type="submit"
            className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
            disabled={loading}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>

      {/* Form Data Debug (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Form Data (Debug):</h4>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(productData, null, 2)}
          </pre>
          <p className="text-xs mt-2">Selected images: {selectedImages.length}</p>
        </div>
      )}
    </div>
  );
};

export default ProductCreator; 