import { create } from 'zustand';
import { categoryAPI } from '../services/api';

const useCategoryStore = create((set, get) => ({
  // State
  categories: [],
  myCategories: [],
  currentCategory: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all categories with pagination
  fetchCategories: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await categoryAPI.getAll(page, size);
      const data = response.data;
      
      set({
        categories: data.data || data.content || [],
        pagination: {
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          size: data.size || size
        },
        loading: false
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch categories',
        loading: false 
      });
    }
  },

  // Fetch category by ID
  fetchCategoryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await categoryAPI.getById(id);
      set({
        currentCategory: response.data,
        loading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch category',
        loading: false 
      });
      throw error;
    }
  },

  // Fetch categories by toko ID
  fetchCategoriesByTokoId: async (tokoId, page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await categoryAPI.getByTokoId(tokoId, page, size);
      const data = response.data;
      
      set({
        categories: data.data || data.content || [],
        pagination: {
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          size: data.size || size
        },
        loading: false
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch categories',
        loading: false 
      });
    }
  },

  // Fetch my categories (for sellers)
  fetchMyCategories: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await categoryAPI.getMyCategories(page, size);
      const data = response.data;
      
      set({
        myCategories: data.data || data.content || [],
        pagination: {
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          size: data.size || size
        },
        loading: false
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch my categories',
        loading: false 
      });
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    set({ loading: true, error: null });
    try {
      const response = await categoryAPI.create(categoryData);
      const newCategory = response.data;
      
      set(state => ({
        myCategories: [newCategory, ...state.myCategories],
        loading: false
      }));
      
      return newCategory;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create category',
        loading: false 
      });
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    set({ loading: true, error: null });
    try {
      const response = await categoryAPI.update(id, categoryData);
      const updatedCategory = response.data.data || response.data;
      
      set(state => ({
        myCategories: state.myCategories.map(cat => 
          cat.idCategory === id ? updatedCategory : cat
        ),
        categories: state.categories.map(cat => 
          cat.idCategory === id ? updatedCategory : cat
        ),
        currentCategory: state.currentCategory?.idCategory === id ? updatedCategory : state.currentCategory,
        loading: false
      }));
      
      return updatedCategory;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update category',
        loading: false 
      });
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await categoryAPI.delete(id);
      
      set(state => ({
        myCategories: state.myCategories.filter(cat => cat.idCategory !== id),
        categories: state.categories.filter(cat => cat.idCategory !== id),
        currentCategory: state.currentCategory?.idCategory === id ? null : state.currentCategory,
        loading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete category',
        loading: false 
      });
      throw error;
    }
  },

  // Clear current category
  clearCurrentCategory: () => set({ currentCategory: null }),
  
  // Reset store
  resetStore: () => set({
    categories: [],
    myCategories: [],
    currentCategory: null,
    loading: false,
    error: null,
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      size: 10
    }
  })
}));

export default useCategoryStore; 