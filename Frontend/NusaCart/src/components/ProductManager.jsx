import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI, generalCategoryAPI } from '../services/api';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [generalCategories, setGeneralCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    page: 0,
    size: 10,
    categoryId: '',
    tokoId: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    productName: '',
    generalCategory: '',
    sortBy: '',
    sortDirection: 'asc',
    activeOnly: true
  });

  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0
  });

  // Load initial data
  useEffect(() => {
    loadGeneralCategories();
    loadCategories();
    loadProducts();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadGeneralCategories = async () => {
    try {
      const response = await generalCategoryAPI.getAll();
      setGeneralCategories(response.data);
    } catch (err) {
      console.error('Error loading general categories:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll(0, 100); // Load more categories for dropdown
      setCategories(response.data.content || response.data);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Clean filters - remove empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '' && value !== null)
      );

      const response = await productAPI.getAll(cleanFilters);
      
      if (response.data.content) {
        // Paginated response
        setProducts(response.data.content);
        setPagination({
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
          currentPage: response.data.currentPage
        });
      } else {
        // Non-paginated response
        setProducts(response.data);
      }
      setError(null);
    } catch (err) {
      setError('Error loading products: ' + (err.response?.data?.message || err.message));
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 0 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleSearch = async (searchTerm) => {
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        const response = await productAPI.search(searchTerm);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError('Error searching products: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    } else {
      loadProducts();
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(productId);
        loadProducts(); // Reload products after deletion
      } catch (err) {
        setError('Error deleting product: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Product Manager</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search products..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch(e.target.value);
              }
            }}
          />
          <button
            onClick={() => handleSearch(document.querySelector('input[placeholder="Search products..."]').value)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={filters.categoryId}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.idCategory} value={category.idCategory}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">General Category</label>
          <select
            value={filters.generalCategory}
            onChange={(e) => handleFilterChange('generalCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All General Categories</option>
            {generalCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.displayName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Min Price</label>
          <input
            type="number"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Price</label>
          <input
            type="number"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="999999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Min Stock</label>
          <input
            type="number"
            value={filters.minStock}
            onChange={(e) => handleFilterChange('minStock', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Default</option>
            <option value="productName">Name</option>
            <option value="price">Price</option>
            <option value="stock">Stock</option>
            <option value="dateCreated">Date Created</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sort Direction</label>
          <select
            value={filters.sortDirection}
            onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.activeOnly}
              onChange={(e) => handleFilterChange('activeOnly', e.target.checked)}
              className="mr-2"
            />
            Active Only
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading products...</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
            {products.map(product => (
              <div key={product.idProduct} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="aspect-w-1 aspect-h-1">
                  <img
                    src={product.imageUrls?.[0] || '/placeholder-image.jpg'}
                    alt={product.productName}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 truncate">{product.productName}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold text-green-600">
                      Rp {product.price?.toLocaleString('id-ID')}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.stock}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleDeleteProduct(product.idProduct)}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => handlePageChange(Math.max(0, filters.page - 1))}
                disabled={filters.page === 0}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="px-4 py-2">
                Page {pagination.currentPage + 1} of {pagination.totalPages}
                ({pagination.totalElements} total items)
              </span>
              
              <button
                onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, filters.page + 1))}
                disabled={filters.page >= pagination.totalPages - 1}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductManager; 