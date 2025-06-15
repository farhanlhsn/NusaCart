import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { Search, Plus, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Package, Users, BarChart3, Home, ShoppingBag, MessageSquare, UserCheck, HelpCircle, Settings, Store, ExternalLink, FolderKanban, Edit, Trash2, Eye } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import useSellerStore from '../stores/sellerStore';
import useCategoryStore from '../stores/categoryStore';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuthStore();
  const {
    store,
    products,
    loading,
    error,
    currentPage,
    searchTerm,
    categories,
    showProductModal,
    editProduct,
    showStoreModal,
    showCategoryModal,
    newCategoryId,
    totalPages,
    setCurrentPage,
    setSearchTerm,
    setShowProductModal,
    setEditProduct,
    setShowStoreModal,
    setShowCategoryModal,
    setNewCategoryId,
    fetchStoreAndProducts,
    refreshCategories
  } = useSellerStore();
  const {
    myCategories,
    loading: categoryLoading,
    error: categoryError,
    pagination: categoryPagination,
    fetchMyCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError
  } = useCategoryStore();
  const [activeMenu, setActiveMenu] = React.useState('beranda');
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = React.useState(null);
  const [summaryData, setSummaryData] = React.useState(null);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  const [analyticsError, setAnalyticsError] = React.useState('');
  const [selectedPeriod, setSelectedPeriod] = React.useState('7_days');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');
  
  // Category management state
  const [showCategoryManagementModal, setShowCategoryManagementModal] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState(null);
  const [categoryCurrentPage, setCategoryCurrentPage] = React.useState(0);
  const [categorySearchTerm, setCategorySearchTerm] = React.useState('');
  const [categoriesWithCounts, setCategoriesWithCounts] = React.useState([]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    const hasSellerRole = user?.role && (
      Array.isArray(user.role) 
        ? user.role.includes('SELLER')
        : (user.role.has?.('SELLER') || Object.values(user.role).includes('SELLER') || user.role.includes?.('SELLER'))
    );
    
    if (!hasSellerRole) {
      alert('Anda belum terdaftar sebagai seller. Silakan daftar sebagai seller terlebih dahulu di halaman profil.');
      navigate('/profile');
      return;
    }
    
    fetchStoreAndProducts(user, currentPage, searchTerm);
    // eslint-disable-next-line
  }, [isLoggedIn, user, currentPage, searchTerm, fetchStoreAndProducts]);

  const handleAddProduct = () => {
    setEditProduct(null);
    setShowProductModal(true);
  };
  const handleEditProduct = (product) => {
    setEditProduct(product);
    setShowProductModal(true);
  };
  const handleDeleteProduct = async (id) => {
    const productId = typeof id === 'object' ? id.productId : id;
    if (!window.confirm('Yakin hapus produk ini?')) return;
    try {
      await api.delete(`/api/products/${productId}`);
      fetchStoreAndProducts(user, currentPage, searchTerm);
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
      alert('Gagal menghapus produk');
    }
  };
  const handleEditStore = () => {
    setShowStoreModal(true);
  };

  // Category management functions
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryManagementModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryManagementModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Yakin hapus kategori ini? Produk yang menggunakan kategori ini akan menjadi tanpa kategori.')) return;
    try {
      await deleteCategory(categoryId);
      await fetchMyCategories(categoryCurrentPage, 10);
      refreshCategories(); // Refresh categories in seller store
      alert('Kategori berhasil dihapus');
    } catch (err) {
      console.error('Gagal menghapus kategori:', err);
      alert('Gagal menghapus kategori');
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.idCategory, categoryData);
      } else {
        await createCategory({ ...categoryData, idToko: store.idToko });
      }
      setShowCategoryManagementModal(false);
      await fetchMyCategories(categoryCurrentPage, 10);
      refreshCategories(); // Refresh categories in seller store
      alert(editingCategory ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
    } catch (err) {
      console.error('Gagal menyimpan kategori:', err);
      throw err;
    }
  };
  
  // REVISI 3: Endpoint chat diubah menjadi /chat
  const sidebarItems = useMemo(() => [
    { id: 'beranda', label: 'Beranda', icon: Home },
    { id: 'produk', label: 'Produk', icon: ShoppingBag },
    { id: 'kategori', label: 'Kategori', icon: FolderKanban },
    { id: 'chat', label: 'Chat Pelanggan', icon: MessageSquare, link: '/chat' },
    { id: 'customers', label: 'Customers', icon: UserCheck },
    { id: 'analisis', label: 'Analisis', icon: BarChart3 },
    { id: 'help', label:'Pusat Bantuan', icon: HelpCircle },
  ], []);

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const fetchAnalytics = async (period = selectedPeriod, startDate = '', endDate = '') => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const params = new URLSearchParams();
      if (period !== 'custom') {
        params.append('period', period);
      } else if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      
      const [analyticsRes, summaryRes] = await Promise.all([
        api.get(`/api/seller/analytics?${params.toString()}`),
        api.get(`/api/seller/analytics/summary?${params.toString()}`)
      ]);
      
      setAnalyticsData(analyticsRes.data);
      setSummaryData(summaryRes.data);
    } catch (err) {
      setAnalyticsError(err.response?.data?.message || 'Gagal memuat data analisis');
    } finally {
      setAnalyticsLoading(false);
    }
  };
  
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      fetchAnalytics(period);
    }
  };
  
  const handleCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      fetchAnalytics('custom', customStartDate, customEndDate);
    }
  };
  
  useEffect(() => {
    if (activeMenu === 'analisis' && store?.idToko) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, store?.idToko]);

  useEffect(() => {
    if (activeMenu === 'kategori' && store?.idToko) {
      const loadCategoriesWithCounts = async () => {
        await fetchMyCategories(categoryCurrentPage, 10);
      };
      loadCategoriesWithCounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMenu, store?.idToko, categoryCurrentPage]);

  // Separate useEffect to fetch product counts when categories change
  useEffect(() => {
    if (myCategories.length > 0 && activeMenu === 'kategori') {
      const loadProductCounts = async () => {
        const categoriesWithCounts = await fetchCategoryProductCounts(myCategories);
        setCategoriesWithCounts(categoriesWithCounts);
      };
      loadProductCounts();
    } else {
      setCategoriesWithCounts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myCategories, activeMenu]);

  // Function to get product count for each category
  const fetchCategoryProductCounts = async (categories) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user?.userId) {
        console.error('User ID not found');
        return categories.map(cat => ({ ...cat, productCount: 0 }));
      }

      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          try {
            // Try to get products by seller ID and filter by category
            const productsResponse = await api.get(`/api/products/seller/${user.userId}`);
            const allProducts = productsResponse.data || [];
            const categoryProducts = allProducts.filter(product => product.idCategory === category.idCategory);
            return { ...category, productCount: categoryProducts.length };
          } catch (error) {
            console.error('Error counting products for category:', category.idCategory, error);
            return { ...category, productCount: 0 };
          }
        })
      );
      return categoriesWithCounts;
    } catch (error) {
      console.error('Error fetching category product counts:', error);
      return categories.map(cat => ({ ...cat, productCount: 0 }));
    }
  };

  // Preview Image Component
  const PreviewImage = React.memo(({ file, index, onRemove }) => {
    const [imageUrl, setImageUrl] = React.useState(null);
    const [error, setError] = React.useState(false);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      if (file && file instanceof File) {
        setLoading(true);
        setError(false);
        
        console.log(`Processing file ${index}:`, {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified
        });
        
        // Use FileReader for better compatibility
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const result = e.target.result;
          console.log(`FileReader success for file ${index}:`, {
            hasResult: !!result,
            resultType: typeof result,
            resultLength: result ? result.length : 0,
            startsWithData: result ? result.startsWith('data:') : false,
            preview: result ? result.substring(0, 50) + '...' : 'No result'
          });
          setImageUrl(result);
          setLoading(false);
          setError(false);
        };
        
        reader.onerror = (e) => {
          console.error(`FileReader error for file ${index}:`, e);
          setError(true);
          setLoading(false);
        };
        
        reader.onabort = () => {
          console.warn(`FileReader aborted for file ${index}`);
          setError(true);
          setLoading(false);
        };
        
        try {
          reader.readAsDataURL(file);
        } catch (err) {
          console.error(`Failed to start FileReader for file ${index}:`, err);
          setError(true);
          setLoading(false);
        }
      }
    }, [file, index]);

    if (loading || error || !imageUrl) {
      return (
        <div className="relative group">
          <div className="w-full h-32 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-1" />
              <span className="text-xs">
                {loading ? 'Loading...' : error ? 'Error loading' : 'No image'}
              </span>
            </div>
          </div>
          {!loading && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="relative group">
        <div className="w-full h-32 bg-white rounded-lg border-2 border-gray-200 group-hover:border-red-300 transition-colors overflow-hidden relative">
          <img 
            src={imageUrl}
            alt={`Preview ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            onLoad={(e) => {
              console.log(`Preview image ${index + 1} loaded successfully:`, {
                src: e.target.src.substring(0, 50) + '...',
                naturalWidth: e.target.naturalWidth,
                naturalHeight: e.target.naturalHeight,
                displayWidth: e.target.width,
                displayHeight: e.target.height
              });
              setError(false);
            }}
            onError={(e) => {
              console.error(`Failed to load preview image ${index + 1}:`, {
                src: e.target.src.substring(0, 50) + '...',
                error: e.type
              });
              setError(true);
            }}
            style={{ 
              display: 'block',
              visibility: 'visible',
              opacity: 1,
              zIndex: 1
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 px-2 py-1 rounded">
            Gambar Baru
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          ×
        </button>
      </div>
    );
  });

  const ProductModal = React.memo(({ show, onClose, onSave, product, tokoId, onCategoryAdded, newCategoryId }) => {
    const [form, setForm] = React.useState(product || {
      productName: '', description: '', price: 0, stock: 0, idCategory: '',
      isActive: true, generalCategory: 'LAINNYA'
    });
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState('');
    const [selectedImages, setSelectedImages] = React.useState([]);
    const [modalCategories, setModalCategories] = React.useState([]);
    const [activeTab, setActiveTab] = React.useState('basic');
    
    const formRef = React.useRef(form);
    const isRestoringRef = React.useRef(false);
    
    React.useEffect(() => { if (!isRestoringRef.current) formRef.current = form; }, [form]);

    React.useEffect(() => {
      if (show) {
        setModalCategories(Array.isArray(categories) ? [...categories] : []);
        const backup = localStorage.getItem('productFormBackup');
        if (backup && !product) {
          try {
            isRestoringRef.current = true;
            setForm(JSON.parse(backup));
            setTimeout(() => { isRestoringRef.current = false; }, 100);
          } catch (e) { console.log('Failed to restore from backup:', e); }
        }
      } else {
        localStorage.removeItem('productFormBackup');
        // Reset states when modal closes
        setSelectedImages([]);
        setErr('');
      }
    }, [show, product, categories]);

    React.useEffect(() => {
        if (product && show) {
            isRestoringRef.current = true;
            setForm(product);
            setSelectedImages([]); // Reset selected images when editing
            setTimeout(() => { isRestoringRef.current = false; }, 100);
        } else if (!product && show) {
            setForm({
              productName: '', description: '', price: 0, stock: 0, idCategory: '',
              isActive: true, generalCategory: 'LAINNYA'
            });
            setSelectedImages([]);
        }
    }, [product, show]);
    
    React.useEffect(() => {
        if (newCategoryId && Array.isArray(categories) && categories.length > 0) {
            setModalCategories([...categories]);
            setForm(prev => ({...prev, idCategory: newCategoryId})); // Auto-select new category
        }
    }, [newCategoryId, categories]);
    
    const handleOpenCategoryModal = React.useCallback(() => {
      localStorage.setItem('productFormBackup', JSON.stringify(formRef.current));
      setShowCategoryModal(true);
    }, []);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm(prevForm => ({ ...prevForm, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      console.log('Files selected:', files.length);
      
      // Filter only valid image files
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max
        
        console.log(`File ${file.name}:`, {
          type: file.type,
          size: file.size,
          isValidType,
          isValidSize
        });
        
        if (!isValidType) {
          console.warn(`File ${file.name} is not a valid image type`);
        }
        if (!isValidSize) {
          console.warn(`File ${file.name} is too large (max 10MB)`);
        }
        
        return isValidType && isValidSize;
      });
      
      // Limit to 5 images max
      const limitedFiles = validFiles.slice(0, 5);
      
      if (limitedFiles.length !== files.length) {
        const message = [];
        if (validFiles.length < files.length) {
          message.push('Beberapa file tidak valid (hanya gambar dengan ukuran max 10MB)');
        }
        if (limitedFiles.length < validFiles.length) {
          message.push('Maksimal 5 gambar yang dapat dipilih');
        }
        setErr(message.join('. '));
        setTimeout(() => setErr(''), 3000);
      }
      
      console.log(`Final selected files:`, limitedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
      setSelectedImages(limitedFiles);
    };

    const validateForm = () => {
      if (!form.productName.trim()) {
        setErr('Nama produk wajib diisi');
        return false;
      }
      if (form.productName.length < 3) {
        setErr('Nama produk minimal 3 karakter');
        return false;
      }
      if (!form.price || form.price <= 0) {
        setErr('Harga produk harus lebih dari 0');
        return false;
      }
      if (!form.stock || form.stock < 0) {
        setErr('Stok produk tidak boleh negatif');
        return false;
      }
      if (!product && selectedImages.length === 0) {
        setErr('Gambar produk wajib diisi untuk produk baru');
        return false;
      }
      return true;
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setErr('');

      if (!validateForm()) {
        setSaving(false);
        return;
      }

      try {
        localStorage.removeItem('productFormBackup');
        const formData = new FormData();
        
        if (product && product.productId) {
            // For update: exclude productId and other fields not in ProductUpdateDTO
            const productData = { 
              productName: form.productName,
              description: form.description,
              price: Number(form.price), 
              stock: Number(form.stock), 
              idCategory: form.idCategory ? Number(form.idCategory) : null,
              generalCategory: form.generalCategory,
              isActive: form.isActive
            };
            formData.append('productData', JSON.stringify(productData));
            if (selectedImages.length > 0) selectedImages.forEach(img => formData.append('images', img));
            await api.put(`/api/products/${product.productId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
            // For create: include idToko
            const productData = { 
              productName: form.productName,
              description: form.description,
              price: Number(form.price), 
              stock: Number(form.stock), 
              idCategory: form.idCategory ? Number(form.idCategory) : null,
              generalCategory: form.generalCategory,
              isActive: form.isActive,
              idToko: tokoId 
            };
            formData.append('productData', JSON.stringify(productData));
            selectedImages.forEach(img => formData.append('images', img));
            await api.post('/api/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        onSave();
        if (onCategoryAdded) onCategoryAdded(form);
      } catch (error) {
        setErr(error.response?.data?.message || error.message || 'Gagal menyimpan produk');
      } finally {
        setSaving(false);
      }
    };
    
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl border w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{product ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                <p className="text-red-100 mt-1">{product ? 'Perbarui informasi produk Anda' : 'Tambahkan produk baru ke toko Anda'}</p>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'basic'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Informasi Dasar
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'details'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Detail & Kategori
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'images'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Gambar Produk
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {err && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {err}
                </div>
              )}

              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Product Name */}
                  <div>
                    <label htmlFor="productName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Produk <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="productName"
                      name="productName" 
                      value={form.productName || ''} 
                      onChange={handleChange} 
                      placeholder="Contoh: Kemeja Flanel Pria Premium" 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                      required 
                    />
                    <p className="mt-1 text-xs text-gray-500">Nama produk yang menarik akan meningkatkan minat pembeli</p>
                  </div>

                  {/* Product Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Deskripsi Produk
                    </label>
                    <textarea 
                      id="description"
                      name="description" 
                      value={form.description || ''} 
                      onChange={handleChange} 
                      placeholder="Jelaskan detail produk Anda: bahan, ukuran, warna, keunggulan, cara perawatan, dll..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                      rows={5}
                      maxLength={1000}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Deskripsi yang detail membantu pembeli memahami produk ({form.description?.length || 0}/1000 karakter)
                    </p>
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                        Harga Produk <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                        <input 
                          id="price"
                          name="price" 
                          type="number" 
                          value={form.price || ''} 
                          placeholder="0" 
                          onChange={handleChange} 
                          className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                          required 
                          min={0} 
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Tentukan harga yang kompetitif untuk produk Anda</p>
                    </div>
                    <div>
                      <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
                        Stok Tersedia <span className="text-red-500">*</span>
                      </label>
                      <input 
                        id="stock"
                        name="stock" 
                        type="number" 
                        value={form.stock || ''} 
                        placeholder="0" 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                        required 
                        min={0} 
                      />
                      <p className="mt-1 text-xs text-gray-500">Jumlah produk yang tersedia untuk dijual</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Details & Category Tab */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Store Category */}
                  <div>
                    <label htmlFor="idCategory" className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori Toko
                    </label>
                    <div className="flex items-center gap-2">
                      <select 
                        id="idCategory"
                        name="idCategory" 
                        value={form.idCategory || ''} 
                        onChange={handleChange} 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      >
                        <option value="">Pilih Kategori Toko (Opsional)</option>
                        {Array.isArray(modalCategories) && modalCategories.map(cat => (
                          <option key={cat.idCategory} value={cat.idCategory}>{cat.namaCategory}</option>
                        ))}
                      </select>
                      <button 
                        type="button" 
                        onClick={handleOpenCategoryModal} 
                        className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition shrink-0"
                        title="Tambah kategori baru"
                      >
                        <Plus size={18}/>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Kategori khusus toko Anda untuk mengorganisir produk</p>
                  </div>

                  {/* General Category */}
                  <div>
                    <label htmlFor="generalCategory" className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori Umum <span className="text-red-500">*</span>
                    </label>
                    <select 
                      id="generalCategory"
                      name="generalCategory" 
                      value={form.generalCategory || 'LAINNYA'} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                      required
                    >
                      <option value="" disabled>Pilih Kategori Umum *</option>
                      <option value="ELEKTRONIK">📱 Elektronik</option>
                      <option value="FURNITUR">🪑 Furnitur</option>
                      <option value="PAKAIAN">👕 Pakaian</option>
                      <option value="MAKANAN_MINUMAN">🍕 Makanan & Minuman</option>
                      <option value="KESEHATAN_KECANTIKAN">💄 Kesehatan & Kecantikan</option>
                      <option value="OLAHRAGA_OUTDOOR">⚽ Olahraga & Outdoor</option>
                      <option value="OTOMOTIF">🚗 Otomotif</option>
                      <option value="BUKU_ALAT_TULIS">📚 Buku & Alat Tulis</option>
                      <option value="MAINAN_HOBI">🧸 Mainan & Hobi</option>
                      <option value="RUMAH_TANGGA">🏠 Rumah Tangga</option>
                      <option value="PERHIASAN_AKSESORIS">💍 Perhiasan & Aksesoris</option>
                      <option value="LAINNYA">📦 Lainnya</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Kategori umum untuk memudahkan pembeli menemukan produk</p>
                  </div>

                  {/* Product Status */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Status Produk</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={form.isActive || false} 
                        onChange={handleChange} 
                        id="isActive" 
                        className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="isActive" className="font-medium text-gray-700">
                        Aktifkan Produk
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Produk yang diaktifkan akan ditampilkan di toko dan dapat dibeli oleh pelanggan
                    </p>
                  </div>
                </div>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Gambar Produk {!product && <span className="text-red-500">*</span>}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-red-400 transition-colors">
                      <input 
                        type="file" 
                        multiple 
                        accept="image/jpeg,image/jpg,image/png,image/webp" 
                        onChange={handleFileChange} 
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 file:cursor-pointer cursor-pointer"
                        id="product-images"
                      />
                      <div className="mt-4 text-center">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-semibold">Klik untuk upload</span> atau drag & drop gambar
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP hingga 10MB (maksimal 5 gambar)
                          {selectedImages.length > 0 && (
                            <span className="block mt-1 text-green-600 font-medium">
                              {selectedImages.length} gambar dipilih
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {(product?.imageUrls?.length > 0 || selectedImages.length > 0) && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Preview Gambar</label>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {selectedImages.length > 0 ? (
                          selectedImages.map((file, i) => {
                            console.log(`Rendering preview for file ${i}:`, {
                              name: file.name,
                              type: file.type,
                              size: file.size
                            });
                            
                            return (
                              <PreviewImage 
                                key={`${file.name}-${i}`}
                                file={file}
                                index={i}
                                onRemove={(index) => {
                                  const newImages = selectedImages.filter((_, idx) => idx !== index);
                                  setSelectedImages(newImages);
                                }}
                              />
                            );
                          })
                        ) : (
                          product?.imageUrls?.map((url, i) => (
                            <div key={i} className="relative group">
                              <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-gray-200 group-hover:border-red-300 transition-colors overflow-hidden">
                                <img 
                                  src={url.startsWith('http') ? url : `http://localhost:6060${url}`} 
                                  alt={`Current ${i + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error(`Failed to load current image ${i + 1}:`, url);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div 
                                  className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500"
                                  style={{ display: 'none' }}
                                >
                                  <div className="text-center">
                                    <Package className="w-8 h-8 mx-auto mb-1" />
                                    <span className="text-xs">Error loading</span>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 px-2 py-1 rounded">
                                  Gambar Saat Ini
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image Tips */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">💡 Tips Foto Produk yang Baik:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Gunakan pencahayaan yang cukup dan merata</li>
                      <li>• Foto dari berbagai sudut (depan, samping, detail)</li>
                      <li>• Background yang bersih dan tidak mengganggu</li>
                      <li>• Resolusi tinggi dan tidak buram</li>
                      <li>• Tunjukkan detail penting produk</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Wajib diisi
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-8 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {saving ? 'Menyimpan...' : (product ? 'Simpan Perubahan' : 'Tambah Produk')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }, (prevProps, nextProps) => prevProps.show === nextProps.show && prevProps.product === nextProps.product && prevProps.tokoId === nextProps.tokoId && prevProps.newCategoryId === nextProps.newCategoryId);

  // REVISI 1: StoreModal diperbaiki
  const StoreModal = ({ show, onClose, onSave, store }) => {
    const [form, setForm] = React.useState({ 
        namaToko: '', 
        deskripsiToko: '',
        profilePictureToko: '',
        alamatToko: '',
        noTelpToko: '',
        emailToko: ''
    });
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('basic');

    React.useEffect(() => {
        if (store && show) {
            setForm({
                namaToko: store.namaToko || '',
                deskripsiToko: store.deskripsiToko || '',
                profilePictureToko: store.profilePictureToko || '',
                alamatToko: store.alamatToko || '',
                noTelpToko: store.noTelpToko || '',
                emailToko: store.emailToko || ''
            });
        }
    }, [store, show]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleImage = (url) => setForm(prev => ({ ...prev, profilePictureToko: url }));

    const validateForm = () => {
      if (!form.namaToko.trim()) {
        setErr('Nama toko wajib diisi');
        return false;
      }
      if (form.namaToko.length < 3) {
        setErr('Nama toko minimal 3 karakter');
        return false;
      }
      if (form.noTelpToko && !/^[0-9+\-\s()]+$/.test(form.noTelpToko)) {
        setErr('Format nomor telepon tidak valid');
        return false;
      }
      if (form.emailToko && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailToko)) {
        setErr('Format email tidak valid');
        return false;
      }
      return true;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setErr('');
      
      if (!validateForm()) {
        setSaving(false);
        return;
      }

      try {
        await api.put(`/api/toko/${store.idToko}`, form);
        onSave();
        onClose();
      } catch (error) {
        setErr(error.response?.data?.message || 'Gagal menyimpan profil toko');
      } finally {
        setSaving(false);
      }
    };

    if (!show) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl border w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Edit Profil Toko</h2>
                <p className="text-red-100 mt-1">Perbarui informasi toko Anda</p>
              </div>
              <button 
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('basic')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'basic'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Informasi Dasar
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'contact'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kontak & Alamat
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {err && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {err}
                </div>
              )}

              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <label className="block text-lg font-semibold text-gray-800 mb-4">Foto Profil Toko</label>
                    <div className="flex flex-col lg:flex-row items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-xl border-2 border-gray-200 overflow-hidden bg-white">
                          {form.profilePictureToko ? (
                            <img 
                              src={`http://localhost:6060${form.profilePictureToko}`} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Store className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <ImageUpload 
                          imageType="store" 
                          currentImageUrl={form.profilePictureToko} 
                          onImageUpdate={handleImage} 
                        />
                        <div className="mt-3 text-sm text-gray-600">
                          <p className="font-medium">Tips untuk foto toko yang baik:</p>
                          <ul className="mt-2 space-y-1 text-xs">
                            <li>• Gunakan logo atau foto yang mewakili brand toko Anda</li>
                            <li>• Pastikan gambar jelas dan tidak buram</li>
                            <li>• Ukuran optimal: 400x400 pixel (rasio 1:1)</li>
                            <li>• Format yang didukung: JPG, PNG, WEBP</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Store Name */}
                  <div>
                    <label htmlFor="namaToko" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Toko <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="namaToko" 
                      name="namaToko" 
                      value={form.namaToko || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                      placeholder="Contoh: Nusacraft Official Store" 
                      required 
                    />
                    <p className="mt-1 text-xs text-gray-500">Nama toko akan ditampilkan di halaman produk dan profil toko</p>
                  </div>

                  {/* Store Description */}
                  <div>
                    <label htmlFor="deskripsiToko" className="block text-sm font-semibold text-gray-700 mb-2">
                      Deskripsi Toko
                    </label>
                    <textarea 
                      id="deskripsiToko" 
                      name="deskripsiToko" 
                      value={form.deskripsiToko || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Ceritakan tentang toko Anda, produk unggulan, visi misi, atau keunikan yang membedakan toko Anda dari yang lain..."
                      rows={5}
                      maxLength={500}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Deskripsi yang menarik dapat meningkatkan kepercayaan pelanggan ({form.deskripsiToko?.length || 0}/500 karakter)
                    </p>
                  </div>
                </div>
              )}

              {/* Contact & Address Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  {/* Email */}
                  <div>
                    <label htmlFor="emailToko" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Toko <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="emailToko" 
                      name="emailToko" 
                      type="email"
                      value={form.emailToko || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                      placeholder="Contoh: info@nusacraft.com"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Email untuk komunikasi bisnis dan customer service</p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="noTelpToko" className="block text-sm font-semibold text-gray-700 mb-2">
                      Nomor Telepon Toko <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="noTelpToko" 
                      name="noTelpToko" 
                      value={form.noTelpToko || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                      placeholder="Contoh: 081234567890 atau 021-12345678"
                      type="tel"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Nomor telepon untuk customer service atau informasi toko</p>
                  </div>

                  {/* Store Address */}
                  <div>
                    <label htmlFor="alamatToko" className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat Toko <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      id="alamatToko" 
                      name="alamatToko" 
                      value={form.alamatToko || ''} 
                      onChange={handleChange} 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Contoh: Jl. Sudirman No. 123, Kelurahan ABC, Kecamatan XYZ, Kota Jakarta Pusat, DKI Jakarta 10110"
                      rows={3}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Alamat lengkap toko untuk memudahkan pelanggan menemukan lokasi</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
              <div className="text-sm text-gray-500">
                <span className="text-red-500">*</span> Wajib diisi
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-8 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const CategoryModal = ({ show, onClose, onSave }) => {
    const [newCategoryName, setNewCategoryName] = React.useState('');
    const [savingCategory, setSavingCategory] = React.useState(false);
    const [categoryError, setCategoryError] = React.useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSavingCategory(true);
      setCategoryError('');
      try {
        const res = await api.post('/api/categories', { namaCategory: newCategoryName, idToko: store.idToko });
        setNewCategoryName('');
        onSave(res.data);
      } catch (err) {
        setCategoryError(err.response?.data?.message || 'Gagal menambah kategori');
      } finally {
        setSavingCategory(false);
      }
    };

    if (!show) return null;
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl border w-full max-w-md transition-all transform scale-95 animate-in fade-in-0 zoom-in-95">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Tambah Kategori Baru</h2>
          {categoryError && <div className="text-red-600 bg-red-50 p-3 rounded-lg mb-4 text-center text-sm">{categoryError}</div>}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Nama Kategori</label>
            <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-300 transition" required />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition">Batal</button>
            <button type="submit" disabled={savingCategory} className="px-8 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60">{savingCategory ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    );
  };

  const CategoryManagementModal = ({ show, onClose, onSave, category }) => {
    const [categoryName, setCategoryName] = React.useState(category?.namaCategory || '');
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
      if (show) {
        setCategoryName(category?.namaCategory || '');
        setError('');
      }
    }, [show, category]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setError('');
      try {
        await onSave({ namaCategory: categoryName });
        setCategoryName('');
        onClose();
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal menyimpan kategori');
      } finally {
        setSaving(false);
      }
    };

    if (!show) return null;
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-50 p-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl border w-full max-w-md transition-all transform scale-95 animate-in fade-in-0 zoom-in-95">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {category ? 'Edit Kategori' : 'Tambah Kategori'}
          </h2>
          {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Nama Kategori</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Masukkan nama kategori"
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-300 transition"
              required
            />
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition">Batal</button>
            <button type="submit" disabled={saving} className="px-8 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-60">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const activeMenuLabel = sidebarItems.find(item => item.id === activeMenu)?.label || 'Dashboard';

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 min-h-screen flex-col bg-white border-r border-gray-200 sticky top-0 z-20 hidden lg:flex">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center overflow-hidden">
                        {store?.profilePictureToko ? (
                        <img src={`http://localhost:6060${store.profilePictureToko}`} alt="Toko" className="w-full h-full object-cover" />
                        ) : (
                        <Store className="w-6 h-6 text-red-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="font-bold text-lg text-gray-900 truncate">{store?.namaToko || 'Nama Toko'}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={handleEditStore} className="text-xs text-red-600 hover:underline font-semibold">Edit Toko</button>
                          <span className="text-gray-300">||</span>
                          <button 
                            onClick={() => window.open(`/toko/${store?.idToko}`, '_blank')} 
                            className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                          >
                            <Eye size={12} />
                            Lihat Toko
                          </button>
                        </div>
                    </div>
                </div>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {sidebarItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => item.link ? navigate(item.link) : setActiveMenu(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-semibold text-sm ${
                    activeMenu === item.id
                        ? 'bg-red-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.link && <ExternalLink className="w-4 h-4 ml-auto text-gray-400" />}
                </button>
              ))}
            </nav>
            <div className="mt-auto p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profilePicture ? (
                    <img src={`http://localhost:6060${user.profilePicture}`} alt={user.name} className="w-10 h-10 object-cover" />
                  ) : (
                    <span className="text-gray-600 font-bold text-sm">{user?.name?.slice(0,1).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-black text-sm">{user.name}</p>
                  <button onClick={() => navigate('/profile')} className="text-xs text-gray-500 hover:text-red-500">Lihat Profil</button>
                </div>
                <button onClick={() => navigate('/profile')} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <Settings className="w-5 h-5 text-gray-500"/>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-900">{activeMenuLabel}</h1>
                <div className="flex items-center space-x-4">
                    {/* Search bar hanya muncul di menu produk */}
                    {activeMenu === 'produk' && (
                        <div className="relative w-full max-w-xs hidden md:block">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border bg-gray-100 border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all"
                            />
                        </div>
                    )}
                </div>
            </header>

            <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
              {activeMenu === 'beranda' && (
                <div className="space-y-6">
                    {/* REVISI 2: Quick Stats dibenahi */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Produk</p>
                                    <p className="text-3xl font-bold text-gray-800">{products.length}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full"><Package className="w-6 h-6 text-blue-500" /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Kategori Toko</p>
                                    <p className="text-3xl font-bold text-gray-800">{categories.length}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full"><FolderKanban className="w-6 h-6 text-green-500" /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                             <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status Toko</p>
                                    <p className="text-xl font-bold text-green-600">Aktif</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full"><div className="text-2xl">✅</div></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-4">
                            <h3 className="text-lg font-bold text-gray-800">Aksi Cepat</h3>
                            <button onClick={() => setActiveMenu('produk')} className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all">
                                <div className="p-3 bg-red-100 rounded-lg"><ShoppingBag className="w-6 h-6 text-red-500"/></div>
                                <div>
                                    <p className="font-semibold text-gray-800">Kelola Produk</p>
                                    <p className="text-xs text-gray-500">Lihat dan atur semua produk Anda.</p>
                                </div>
                            </button>
                            <button onClick={() => setActiveMenu('kategori')} className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all">
                                <div className="p-3 bg-purple-100 rounded-lg"><FolderKanban className="w-6 h-6 text-purple-500"/></div>
                                <div>
                                    <p className="font-semibold text-gray-800">Kelola Kategori</p>
                                    <p className="text-xs text-gray-500">Atur kategori produk toko Anda.</p>
                                </div>
                            </button>
                            <button onClick={() => setActiveMenu('analisis')} className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all">
                                <div className="p-3 bg-green-100 rounded-lg"><BarChart3 className="w-6 h-6 text-green-500"/></div>
                                <div>
                                    <p className="font-semibold text-gray-800">Lihat Analisis</p>
                                    <p className="text-xs text-gray-500">Pantau performa penjualan toko.</p>
                                </div>
                            </button>
                             {/* REVISI 3: Endpoint chat diubah */}
                             <button onClick={() => navigate('/chat')} className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all">
                                <div className="p-3 bg-blue-100 rounded-lg"><MessageSquare className="w-6 h-6 text-blue-500"/></div>
                                <div>
                                    <p className="font-semibold text-gray-800">Buka Chat</p>
                                    <p className="text-xs text-gray-500">Layanan pelanggan Anda.</p>
                                </div>
                            </button>
                        </div>

                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5"/> <span>Produk Terbaru</span>
                            </h3>
                             {products.length > 0 ? (
                                <div className="space-y-4">
                                    {products.slice(0, 4).map((product) => (
                                    <div key={product.productId} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                        {product.imageUrls && product.imageUrls.length > 0 ? (
                                            <img src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:6060${product.imageUrls[0]}`} alt={product.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={24}/></div>
                                        )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">{product.productName}</h4>
                                            <p className="text-xs text-gray-500">Stok: {product.stock}</p>
                                        </div>
                                        <p className="text-red-600 font-bold text-sm">{formatCurrency(product.price)}</p>
                                    </div>
                                    ))}
                                </div>
                            ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p>Belum ada produk</p>
                                <button onClick={handleAddProduct} className="mt-2 text-red-500 hover:underline font-medium text-sm">
                                Tambah produk sekarang
                                </button>
                            </div>
                            )}
                        </div>
                    </div>

                    {/* REVISI 2: Menambahkan daftar kategori */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FolderKanban className="w-5 h-5 text-gray-700"/>
                            <span>Kategori Toko Anda</span>
                        </h3>
                        {categories.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {categories.map(cat => (
                                    <span key={cat.idCategory} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold text-sm">
                                        {cat.namaCategory}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="font-medium">Anda belum membuat kategori khusus</p>
                                <p className="text-sm mt-1">
                                    Anda dapat menambahkan kategori saat membuat atau mengedit produk.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
              )}

              {activeMenu === 'produk' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-red-500" />
                        <span>Daftar Produk</span>
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">Kelola semua produk di toko Anda.</p>
                    </div>
                    <button 
                      onClick={handleAddProduct}
                      className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-all shadow-sm"
                    >
                      <Plus size={18} />
                      <span>Tambah Produk</span>
                    </button>
                  </div>

                {loading && <div className="p-6 text-center text-gray-500">Memuat data...</div>}
                {error && <div className="p-6 text-center text-red-500">{error}</div>}

                {!loading && !error && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6">
                      {products.map((product) => (
                        <div key={product.productId} className="bg-gray-50 rounded-xl shadow hover:shadow-xl transition-all p-4 flex flex-col gap-2 border border-gray-100">
                           <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden mb-2">
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                              <img src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:6060${product.imageUrls[0]}`} alt={product.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs"><Package size={32} /></div>
                            )}
                          </div>
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{product.productName}</h3>
                          <p className="text-sm text-gray-500 mb-1">{product.categoryName || 'Tanpa Kategori'}</p>
                          <p className="text-xl font-bold text-red-600">{formatCurrency(product.price)}</p>
                          <p className="text-xs text-gray-500 mb-2">Stok: {product.stock}</p>
                          <div className="flex gap-2 mt-auto pt-2">
                            <button onClick={() => handleEditProduct(product)} className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-600 transition">Edit</button>
                            <button onClick={() => handleDeleteProduct(product.productId)} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition">Hapus</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                          <tr>
                            <th scope="col" className="px-6 py-4 rounded-l-lg">Produk</th>
                            <th scope="col" className="px-6 py-4 text-center">Stok</th>
                            <th scope="col" className="px-6 py-4">Harga</th>
                            <th scope="col" className="px-6 py-4">Status</th>
                            <th scope="col" className="px-6 py-4 text-center rounded-r-lg">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {products.map((product) => (
                            <tr key={product.productId} className="hover:bg-gray-50 border-b last:border-b-0">
                              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                      {product.imageUrls && product.imageUrls.length > 0 ? (
                                        <img src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:6060${product.imageUrls[0]}`} alt={product.productName} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={24}/></div>
                                      )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-base text-gray-800">{product.productName}</div>
                                    <div className="text-xs text-gray-500">{product.categoryName || 'Tanpa Kategori'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(product.price)}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {product.isActive ? 'Aktif' : 'Nonaktif'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center items-center gap-4">
                                    <button onClick={() => handleEditProduct(product)} className="font-medium text-blue-600 hover:text-blue-900">Edit</button>
                                    <button onClick={() => handleDeleteProduct(product.productId)} className="font-medium text-red-600 hover:text-red-900">Hapus</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                 {products.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada produk</h3>
                        <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan produk pertama Anda.</p>
                        <div className="mt-6">
                            <button onClick={handleAddProduct} type="button" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                <Plus className="-ml-1 mr-2 h-5 w-5" />
                                Tambah Produk Baru
                            </button>
                        </div>
                    </div>
                 )}

                <div className="pt-6 flex items-center justify-between border-t mt-6">
                  <div className="text-sm text-gray-500">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="px-3 py-1 font-medium text-sm">{currentPage}</span>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                  </div>
                </div>
              )}

              {activeMenu === 'kategori' && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FolderKanban className="w-6 h-6 text-red-500" />
                        <span>Manajemen Kategori</span>
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">Kelola kategori produk di toko Anda.</p>
                    </div>
                    <button 
                      onClick={handleAddCategory}
                      className="flex items-center gap-2 bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-all shadow-sm"
                    >
                      <Plus size={18} />
                      <span>Tambah Kategori</span>
                    </button>
                  </div>

                  {categoryLoading && <div className="p-6 text-center text-gray-500">Memuat data kategori...</div>}
                  {categoryError && <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg">{categoryError}</div>}

                  {!categoryLoading && !categoryError && (
                    <>
                      {/* Mobile view */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                        {(categoriesWithCounts.length > 0 ? categoriesWithCounts : myCategories).map((category, index) => (
                          <div key={category.idCategory} className="bg-gray-50 rounded-xl shadow hover:shadow-lg transition-all p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                  <span className="text-red-600 font-bold text-sm">#{index + 1}</span>
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900">{category.namaCategory}</h3>
                                  <p className="text-xs text-gray-500">
                                    {category.productCount !== undefined ? `${category.productCount} produk` : 'Memuat...'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button 
                                onClick={() => handleEditCategory(category)}
                                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-blue-600 transition flex items-center justify-center gap-1"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(category.idCategory)}
                                className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition flex items-center justify-center gap-1"
                              >
                                <Trash2 size={14} />
                                Hapus
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Desktop table view */}
                      <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                            <tr>
                              <th scope="col" className="px-6 py-4 rounded-l-lg">No</th>
                              <th scope="col" className="px-6 py-4">Nama Kategori</th>
                              <th scope="col" className="px-6 py-4">Jumlah Produk</th>
                              <th scope="col" className="px-6 py-4">Tanggal Dibuat</th>
                              <th scope="col" className="px-6 py-4 text-center rounded-r-lg">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {(categoriesWithCounts.length > 0 ? categoriesWithCounts : myCategories).map((category, index) => (
                              <tr key={category.idCategory} className="hover:bg-gray-50 border-b last:border-b-0">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                      <span className="text-red-600 font-bold text-sm">#{index + 1}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                      <FolderKanban className="w-4 h-4 text-purple-500" />
                                    </div>
                                    <span className="font-semibold text-gray-800">{category.namaCategory}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    (category.productCount || 0) > 0 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {category.productCount !== undefined ? `${category.productCount} produk` : 'Memuat...'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                  {category.createdAt ? new Date(category.createdAt).toLocaleDateString('id-ID') : '-'}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <div className="flex justify-center items-center gap-4">
                                    <button 
                                      onClick={() => handleEditCategory(category)}
                                      className="font-medium text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                    >
                                      <Edit size={14} />
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteCategory(category.idCategory)}
                                      className="font-medium text-red-600 hover:text-red-900 flex items-center gap-1"
                                    >
                                      <Trash2 size={14} />
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {(categoriesWithCounts.length === 0 && myCategories.length === 0) && !categoryLoading && (
                    <div className="text-center py-16">
                      <FolderKanban className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada kategori</h3>
                      <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan kategori pertama untuk mengorganisir produk Anda.</p>
                      <div className="mt-6">
                        <button 
                          onClick={handleAddCategory}
                          type="button" 
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Plus className="-ml-1 mr-2 h-5 w-5" />
                          Tambah Kategori Baru
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {categoryPagination.totalPages > 1 && (
                    <div className="pt-6 flex items-center justify-between border-t mt-6">
                      <div className="text-sm text-gray-500">
                        Halaman {categoryPagination.currentPage + 1} dari {categoryPagination.totalPages}
                        {categoriesWithCounts.length > 0 && (
                          <span className="ml-2">({categoriesWithCounts.length} kategori)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setCategoryCurrentPage(Math.max(0, categoryCurrentPage - 1))} 
                          disabled={categoryCurrentPage === 0} 
                          className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 font-medium text-sm">{categoryCurrentPage + 1}</span>
                        <button 
                          onClick={() => setCategoryCurrentPage(Math.min(categoryPagination.totalPages - 1, categoryCurrentPage + 1))} 
                          disabled={categoryCurrentPage === categoryPagination.totalPages - 1} 
                          className="p-2 border rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
             {/* Content for other menus follows */}
            {activeMenu === 'customers' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                     <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Users className="w-6 h-6 text-red-500" />
                        <span>Manajemen Pelanggan</span>
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">Kelola dan pahami pelanggan Anda lebih baik.</p>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0"><Users className="h-5 w-5 text-yellow-400" aria-hidden="true" /></div>
                            <div className="ml-3"><p className="text-sm text-yellow-700">Fitur Manajemen Pelanggan akan segera hadir untuk memberikan Anda wawasan mendalam tentang perilaku belanja dan demografi pelanggan Anda.</p></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
                        <div className="bg-gray-100 p-6 rounded-lg"><Users className="mx-auto h-8 w-8 text-gray-400 mb-2"/><h3 className="text-lg font-semibold text-gray-700">Daftar Pelanggan</h3><p className="text-sm text-gray-500">Akan datang</p></div>
                         <div className="bg-gray-100 p-6 rounded-lg"><TrendingUp className="mx-auto h-8 w-8 text-gray-400 mb-2"/><h3 className="text-lg font-semibold text-gray-700">Segmentasi</h3><p className="text-sm text-gray-500">Akan datang</p></div>
                         <div className="bg-gray-100 p-6 rounded-lg"><DollarSign className="mx-auto h-8 w-8 text-gray-400 mb-2"/><h3 className="text-lg font-semibold text-gray-700">Lifetime Value</h3><p className="text-sm text-gray-500">Akan datang</p></div>
                    </div>
                </div>
              )}
             {activeMenu === 'help' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-8">
                     <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3"><HelpCircle className="w-6 h-6 text-red-500" /><span>Pusat Bantuan</span></h2>
                      <p className="text-gray-500 text-sm mt-1">Temukan jawaban dan panduan untuk toko Anda.</p>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Pertanyaan Umum (FAQ)</h3>
                        <div className="space-y-4">
                            <details className="p-4 rounded-lg bg-gray-50 group"><summary className="font-semibold cursor-pointer list-none flex justify-between items-center">Bagaimana cara menambah produk baru?<ChevronLeft className="w-5 h-5 transition-transform duration-300 transform group-open:rotate-[-90deg]" /></summary><p className="mt-2 text-gray-600 text-sm">Pilih menu "Produk" di sidebar, lalu klik tombol "Tambah Produk" di kanan atas. Anda juga bisa menggunakan tombol plus (+) melayang di kanan bawah halaman.</p></details>
                             <details className="p-4 rounded-lg bg-gray-50 group"><summary className="font-semibold cursor-pointer list-none flex justify-between items-center">Bagaimana cara mengubah informasi toko?<ChevronLeft className="w-5 h-5 transition-transform duration-300 transform group-open:rotate-[-90deg]" /></summary><p className="mt-2 text-gray-600 text-sm">Di sidebar, klik tombol "Edit Toko" di bawah nama toko Anda. Sebuah modal akan muncul di mana Anda dapat mengubah nama, deskripsi, dan foto profil toko.</p></details>
                            <details className="p-4 rounded-lg bg-gray-50 group"><summary className="font-semibold cursor-pointer list-none flex justify-between items-center">Di mana saya bisa melihat data penjualan?<ChevronLeft className="w-5 h-5 transition-transform duration-300 transform group-open:rotate-[-90deg]" /></summary><p className="mt-2 text-gray-600 text-sm">Buka menu "Analisis" di sidebar untuk melihat grafik penjualan, pendapatan, dan statistik toko lainnya. Anda dapat memfilter data berdasarkan periode waktu yang berbeda untuk wawasan yang lebih dalam.</p></details>
                        </div>
                    </div>
                    <div>
                         <h3 className="text-lg font-bold text-gray-800 mb-4">Hubungi Kami</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-lg bg-red-50 border border-red-200"><h4 className="font-bold text-red-800">Email Support</h4><p className="text-sm text-red-700 mt-1 mb-2">Kirimkan pertanyaan Anda dan kami akan merespon dalam 24 jam.</p><a href="mailto:support@nusacart.com" className="font-semibold text-red-600 hover:underline">support@nusacart.com</a></div>
                             <div className="p-6 rounded-lg bg-blue-50 border border-blue-200"><h4 className="font-bold text-blue-800">Live Chat</h4><p className="text-sm text-blue-700 mt-1 mb-2">Dapatkan bantuan langsung dari tim kami.</p><button className="font-semibold text-blue-600 hover:underline">Mulai Chat (Segera Hadir)</button></div>
                         </div>
                    </div>
                </div>
             )}
            {activeMenu === 'analisis' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-6 h-6 text-red-500" />Analisis Penjualan</h2>
                      <p className="text-gray-500 text-sm mt-1">Pantau performa toko Anda dengan data yang akurat.</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <select value={selectedPeriod} onChange={(e) => handlePeriodChange(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"><option value="7_days">7 Hari Terakhir</option><option value="30_days">30 Hari Terakhir</option><option value="90_days">3 Bulan Terakhir</option><option value="1_year">1 Tahun Terakhir</option><option value="custom">Periode Kustom</option></select>
                      {selectedPeriod === 'custom' && (<div className="flex items-center gap-2"><input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"/><span className="text-gray-500">-</span><input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"/><button onClick={handleCustomDateFilter} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm">Filter</button></div>)}
                    </div>
                  </div>
                  {analyticsLoading && (<div className="p-8 text-center text-gray-500"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>Memuat data analisis...</div>)}
                  {analyticsError && (<div className="p-6 text-center text-red-500 bg-red-50 rounded-lg">{analyticsError}</div>)}
                  {!analyticsLoading && !analyticsError && summaryData && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-blue-500 text-white p-5 rounded-xl shadow-lg"><div className="flex items-center justify-between"><div><p className="text-blue-100 text-sm">Total Pesanan</p><p className="text-2xl font-bold">{summaryData.totalOrders || 0}</p></div><Package className="w-8 h-8 text-blue-200" /></div></div>
                        <div className="bg-green-500 text-white p-5 rounded-xl shadow-lg"><div className="flex items-center justify-between"><div><p className="text-green-100 text-sm">Total Pendapatan</p><p className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue || 0)}</p></div><DollarSign className="w-8 h-8 text-green-200" /></div></div>
                        <div className="bg-purple-500 text-white p-5 rounded-xl shadow-lg"><div className="flex items-center justify-between"><div><p className="text-purple-100 text-sm">Produk Terjual</p><p className="text-2xl font-bold">{summaryData.totalProductsSold || 0}</p></div><TrendingUp className="w-8 h-8 text-purple-200" /></div></div>
                        <div className="bg-orange-500 text-white p-5 rounded-xl shadow-lg"><div className="flex items-center justify-between"><div><p className="text-orange-100 text-sm">Rata-rata Pesanan</p><p className="text-2xl font-bold">{formatCurrency(summaryData.averageOrderValue || 0)}</p></div><Users className="w-8 h-8 text-orange-200" /></div></div>
                      </div>
                      {analyticsData && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                          {analyticsData.topProducts?.length > 0 && (<div className="bg-gray-50 p-6 rounded-xl border border-gray-200 lg:col-span-2"><h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">🏆 <span>Produk Terlaris</span></h3><div className="space-y-3">{analyticsData.topProducts.slice(0, 5).map((p, i) => (<div key={p.productId} className="flex items-center gap-3"><div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm bg-gray-700">#{i + 1}</div><div className="flex-1"><p className="font-semibold text-gray-900 text-sm line-clamp-1">{p.productName}</p><p className="text-xs text-gray-500">{p.quantitySold} terjual</p></div><p className="font-bold text-green-600 text-sm">{formatCurrency(p.revenue)}</p></div>))}</div></div>)}
                          {analyticsData.categorySales?.length > 0 && (<div className="bg-gray-50 p-6 rounded-xl border border-gray-200 lg:col-span-3"><h3 className="text-lg font-bold text-gray-900 mb-4">Penjualan per Kategori</h3><div className="h-64 flex items-center justify-center"><Doughnut data={{ labels: analyticsData.categorySales.map(c => c.categoryName), datasets: [{ data: analyticsData.categorySales.map(c => c.revenue), backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'], borderWidth: 0 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} /></div></div>)}
                          {analyticsData.dailySales?.length > 0 && (<div className="bg-gray-50 p-6 rounded-xl border border-gray-200 lg:col-span-5"><h3 className="text-lg font-bold text-gray-900 mb-4">Grafik Penjualan Harian</h3><div className="h-80"><Bar data={{ labels: analyticsData.dailySales.slice(-15).map(d => new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })), datasets: [{ label: 'Pendapatan (Rp)', data: analyticsData.dailySales.slice(-15).map(d => d.revenue), backgroundColor: 'rgba(59, 130, 246, 0.8)', borderRadius: 4 }] }} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: (v) => formatCurrency(v) }}}, plugins: { legend: { display: false }}}} /></div></div>)}
                           {analyticsData.monthlySales?.length > 0 && (<div className="bg-gray-50 p-6 rounded-xl border border-gray-200 lg:col-span-5"><h3 className="text-lg font-bold text-gray-900 mb-4">Trend Penjualan Bulanan</h3><div className="h-80"><Line data={{ labels: analyticsData.monthlySales.map(m => new Date(m.month + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })), datasets: [{ label: 'Pendapatan Bulanan', data: analyticsData.monthlySales.map(m => m.revenue), borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.3 }] }} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { ticks: { callback: (v) => formatCurrency(v) }}}, plugins: { legend: { display: false }}}} /></div></div>)}
                        </div>
                      )}
                    </div>
                  )}
                  {!analyticsLoading && !analyticsError && !summaryData && (<div className="p-8 text-center text-gray-500"><BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" /><p className="text-lg font-medium">Belum ada data penjualan</p><p className="text-sm">Data analisis akan muncul setelah Anda memiliki pesanan.</p></div>)}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <ProductModal 
        show={showProductModal} 
        onClose={() => setShowProductModal(false)} 
        onSave={() => { setShowProductModal(false); fetchStoreAndProducts(user, currentPage, searchTerm, false); setNewCategoryId(null); }} 
        product={editProduct} 
        tokoId={store?.idToko} 
        onCategoryAdded={() => {}} 
        newCategoryId={newCategoryId} 
      />
      <StoreModal show={showStoreModal} onClose={() => setShowStoreModal(false)} onSave={() => { setShowStoreModal(false); fetchStoreAndProducts(user, 1, ''); }} store={store} />
      <CategoryModal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} onSave={async (newCategory) => {
        setShowCategoryModal(false);
        await refreshCategories();
        setNewCategoryId(newCategory.idCategory);
      }} />
      <CategoryManagementModal 
        show={showCategoryManagementModal} 
        onClose={() => setShowCategoryManagementModal(false)} 
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </>
  );
};

export default SellerDashboard;