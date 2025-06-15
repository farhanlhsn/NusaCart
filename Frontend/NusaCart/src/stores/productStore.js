import { create } from 'zustand';
import { productAPI } from '../services/api';

const useProductStore = create((set, get) => ({
  // State
  products: [],
  myProducts: [],
  activeProducts: [],
  currentProduct: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 12
  },
  creating: false,
  updating: false,
  deleting: false,

  // Actions
  setLoading: (loading) => set({ loading }),
  setCreating: (creating) => set({ creating }),
  setUpdating: (updating) => set({ updating }),
  setDeleting: (deleting) => set({ deleting }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all products with pagination
  fetchProducts: async (page = 0, size = 12) => {
    // Ensure parameters are valid numbers
    const validPage = Number.isInteger(page) ? page : 0;
    const validSize = Number.isInteger(size) ? size : 12;
    
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getAll(validPage, validSize);
      const data = response.data;
      
      const products = data.data || data.content || [];
      
      set({
        products: products,
        pagination: {
          currentPage: data.currentPage || validPage,
          totalPages: data.totalPages || 0,
          totalElements: data.totalItems || data.totalElements || 0,
          size: data.size || validSize
        },
        loading: false
      });
    } catch (error) {
      console.error('ProductStore - Error fetching products:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch products',
        loading: false 
      });
    }
  },

  // Fetch products with filters
  fetchProductsWithFilters: async (page = 0, size = 12, filters = {}) => {
    const validPage = Number.isInteger(page) ? page : 0;
    const validSize = Number.isInteger(size) ? size : 12;
    
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: validPage,
        size: validSize,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.tokoId && { tokoId: filters.tokoId }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.minStock && { minStock: filters.minStock }),
        ...(filters.productName && { productName: filters.productName }),
        ...(filters.generalCategory && { generalCategory: filters.generalCategory }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortDirection && { sortDirection: filters.sortDirection }),
        ...(filters.activeOnly !== undefined && { activeOnly: filters.activeOnly })
      });
      
      const response = await productAPI.getAllWithFilters(params.toString());
      const data = response.data;
      
      const products = data.data || data.content || [];
      
      set({
        products: products,
        pagination: {
          currentPage: data.currentPage || validPage,
          totalPages: data.totalPages || 0,
          totalElements: data.totalItems || data.totalElements || 0,
          size: data.size || validSize
        },
        loading: false
      });
    } catch (error) {
      console.error('ProductStore - Error fetching products with filters:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch products with filters',
        loading: false 
      });
    }
  },

  // Fetch product by ID
  fetchProductById: async (id) => {
    // Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      const error = `Invalid product ID: ${id}`;
      console.error('ProductStore -', error);
      set({ 
        error,
        loading: false,
        currentProduct: null 
      });
      throw new Error(error);
    }
    
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getById(id);
      
      set({
        currentProduct: response.data,
        loading: false
      });
      return response.data;
    } catch (error) {
      console.error('ProductStore - Error fetching product:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch product',
        loading: false,
        currentProduct: null
      });
      throw error;
    }
  },

  // Fetch products by toko ID
  fetchProductsByTokoId: async (tokoId, page = 0, size = 12) => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getByTokoId(tokoId, page, size);
      const data = response.data;
      
      set({
        products: data.data || data.content || [],
        pagination: {
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 0,
          totalElements: data.totalItems || data.totalElements || 0,
          size: data.size || size
        },
        loading: false
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch products',
        loading: false 
      });
    }
  },

  // Fetch active products
  fetchActiveProducts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getActive();
      set({
        activeProducts: response.data || [],
        loading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch active products',
        loading: false 
      });
    }
  },

  // Fetch products by seller ID
  fetchProductsBySellerId: async (sellerId) => {
    set({ loading: true, error: null });
    try {
      const response = await productAPI.getBySellerId(sellerId);
      set({
        myProducts: response.data || [],
        loading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch seller products',
        loading: false 
      });
    }
  },

  // Create new product
  createProduct: async (productData) => {
    set({ creating: true, error: null });
    try {
      if (!(productData instanceof FormData)) {
        throw new Error('Pembuatan produk hanya bisa dengan FormData (dengan gambar).');
      }
      const response = await productAPI.create(productData);
      const newProduct = response.data;
      set(state => ({
        myProducts: [newProduct, ...state.myProducts],
        creating: false
      }));
      return newProduct;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to create product',
        creating: false 
      });
      throw error;
    }
  },

  // Update product with images
  updateProduct: async (id, productData) => {
    set({ updating: true, error: null });
    try {
      const response = await productAPI.update(id, productData);
      const updatedProduct = response.data;
      set(state => ({
        myProducts: state.myProducts.map(product => 
          product.productId === id ? updatedProduct : product
        ),
        products: state.products.map(product => 
          product.productId === id ? updatedProduct : product
        ),
        currentProduct: state.currentProduct?.productId === id ? updatedProduct : state.currentProduct,
        updating: false
      }));
      return updatedProduct;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to update product',
        updating: false 
      });
      throw error;
    }
  },

  // Update product JSON only (without images)
  updateProductJson: async (id, productData) => {
    set({ updating: true, error: null });
    try {
      const response = await productAPI.updateJson(id, productData);
      const updatedProduct = response.data;
      
      set(state => ({
        myProducts: state.myProducts.map(product => 
          product.productId === id ? updatedProduct : product
        ),
        products: state.products.map(product => 
          product.productId === id ? updatedProduct : product
        ),
        currentProduct: state.currentProduct?.productId === id ? updatedProduct : state.currentProduct,
        updating: false
      }));
      
      return updatedProduct;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update product',
        updating: false 
      });
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    set({ deleting: true, error: null });
    try {
      await productAPI.delete(id);
      
      set(state => ({
        myProducts: state.myProducts.filter(product => product.productId !== id),
        products: state.products.filter(product => product.productId !== id),
        activeProducts: state.activeProducts.filter(product => product.productId !== id),
        currentProduct: state.currentProduct?.productId === id ? null : state.currentProduct,
        deleting: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete product',
        deleting: false 
      });
      throw error;
    }
  },

  // Search products
  searchProducts: (query) => {
    const { products, activeProducts } = get();
    const searchIn = activeProducts.length > 0 ? activeProducts : products;
    
    if (!query.trim()) return searchIn;
    
    const lowercaseQuery = query.toLowerCase();
    return searchIn.filter(product =>
      product.productName.toLowerCase().includes(lowercaseQuery) ||
      product.description?.toLowerCase().includes(lowercaseQuery) ||
      product.categoryName?.toLowerCase().includes(lowercaseQuery) ||
      product.tokoName?.toLowerCase().includes(lowercaseQuery)
    );
  },

  // Filter products by category
  filterByCategory: (categoryId) => {
    const { products, activeProducts } = get();
    const searchIn = activeProducts.length > 0 ? activeProducts : products;
    
    if (!categoryId) return searchIn;
    
    return searchIn.filter(product => product.idCategory === categoryId);
  },

  // Filter products by price range
  filterByPriceRange: (minPrice, maxPrice) => {
    const { products, activeProducts } = get();
    const searchIn = activeProducts.length > 0 ? activeProducts : products;
    
    return searchIn.filter(product => {
      const price = product.price;
      return price >= minPrice && price <= maxPrice;
    });
  },

  // Sort products
  sortProducts: (products, sortBy = 'name', order = 'asc') => {
    return [...products].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.productName.toLowerCase();
          bValue = b.productName.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          aValue = a.productName.toLowerCase();
          bValue = b.productName.toLowerCase();
      }
      
      if (order === 'desc') {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  },

  // Set current product
  setCurrentProduct: (product) => set({ currentProduct: product }),

  // Clear current product
  clearCurrentProduct: () => set({ currentProduct: null }),

  // Reset store
  resetStore: () => set({
    products: [],
    myProducts: [],
    activeProducts: [],
    currentProduct: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      size: 12
    },
    creating: false,
    updating: false,
    deleting: false
  })
}));

export default useProductStore;