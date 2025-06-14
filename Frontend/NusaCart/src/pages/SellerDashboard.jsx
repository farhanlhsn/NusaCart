import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { Search, Plus, ChevronLeft, ChevronRight, TrendingUp, DollarSign, Package, Users, Calendar, BarChart3 } from 'lucide-react';
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
    storeImage,
    showCategoryModal,
    newCategoryId,
    totalPages,
    setCurrentPage,
    setSearchTerm,
    setShowProductModal,
    setEditProduct,
    setShowStoreModal,
    setStoreImage,
    setShowCategoryModal,
    setNewCategoryId,
    setCategories,
    fetchStoreAndProducts,
    refreshCategories
  } = useSellerStore();
  const [activeMenu, setActiveMenu] = React.useState('produk');
  const itemsPerPage = 8;
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = React.useState(null);
  const [summaryData, setSummaryData] = React.useState(null);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);
  const [analyticsError, setAnalyticsError] = React.useState('');
  const [selectedPeriod, setSelectedPeriod] = React.useState('7_days');
  const [customStartDate, setCustomStartDate] = React.useState('');
  const [customEndDate, setCustomEndDate] = React.useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    
    // Better role checking - handle both array and set formats
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
      // FIX: Refresh data untuk halaman saat ini agar tidak kembali ke halaman 1
      fetchStoreAndProducts(user, currentPage, searchTerm);
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
      alert('Gagal menghapus produk');
    }
  };
  const handleEditStore = () => {
    setShowStoreModal(true);
  };
  const handleStoreImageUpdate = (newImageUrl) => {
    setStoreImage(newImageUrl);
  };

  const sidebarItems = [
    { id: 'beranda', label: 'Beranda', icon: '🏠' },
    { id: 'produk', label: 'Produk', icon: '📦', active: true },
    { id: 'chat', label: 'Chat Pelanggan', icon: '💬', link: '/seller/chat' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'analisis', label: 'Analisis', icon: '📊' },
    { id: 'help', label: 'Help', icon: '❓' },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };
  
  // Fetch analytics data
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
  
  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      fetchAnalytics(period);
    }
  };
  
  // Handle custom date filter
  const handleCustomDateFilter = () => {
    if (customStartDate && customEndDate) {
      fetchAnalytics('custom', customStartDate, customEndDate);
    }
  };
  
  // Load analytics when menu changes to analisis
  React.useEffect(() => {
    if (activeMenu === 'analisis' && store?.idToko) {
      fetchAnalytics();
    }
  }, [activeMenu, store?.idToko]);
  
  // No need for startIndex, endIndex, or currentProducts slicing if pagination is handled by the API
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const currentProducts = products.slice(startIndex, endIndex);

  // Modal Product Form - Wrapped with React.memo to prevent unnecessary re-renders
  const ProductModal = ({ show, onClose, onSave, product, tokoId, onCategoryAdded, newCategoryId }) => {
    const [form, setForm] = React.useState(product || {
      productName: '',
      description: '',
      price: 0,
      stock: 0,
      idCategory: '',
      imageUrl: '',
      isActive: true,
      generalCategory: 'LAINNYA',
      imageUrls: []
    });
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState('');
    const [selectedImages, setSelectedImages] = React.useState([]);

    React.useEffect(() => {
      if (product) {
        setForm({
          ...product,
          imageUrls: product.imageUrls || (product.imageUrl ? [product.imageUrl] : [])
        });
      } else {
        setForm({
          productName: '',
          description: '',
          price: 0,
          stock: 0,
          idCategory: '',
          imageUrl: '',
          isActive: true,
          generalCategory: 'LAINNYA',
          imageUrls: []
        });
        setSelectedImages([]);
      }
    }, [product]);
    
    React.useEffect(() => {
      if (newCategoryId) {
        setForm(f => ({ ...f, idCategory: newCategoryId }));
      }
    }, [newCategoryId]);


    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };
    
    const handleImage = (url) => {
      setForm({ ...form, imageUrl: url });
    };
    
    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      const existingImagesCount = product && form.imageUrls ? form.imageUrls.length : 0;
      const totalImages = existingImagesCount + files.length;
      
      if (totalImages > 5) {
        setErr(`Maksimal 5 gambar total. Anda sudah memiliki ${existingImagesCount} gambar, hanya bisa menambah ${5 - existingImagesCount} gambar lagi.`);
        return;
      }
      
      // Validasi ukuran file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const invalidFiles = files.filter(file => file.size > maxSize);
      if (invalidFiles.length > 0) {
        setErr('Beberapa file melebihi ukuran maksimal 5MB');
        return;
      }
      
      setSelectedImages(files);
      setErr('');
    };
    
    const handleDragOver = (e) => {
      e.preventDefault();
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      const existingImagesCount = product && form.imageUrls ? form.imageUrls.length : 0;
      const totalImages = existingImagesCount + files.length;
      
      if (totalImages > 5) {
        setErr(`Maksimal 5 gambar total. Anda sudah memiliki ${existingImagesCount} gambar, hanya bisa menambah ${5 - existingImagesCount} gambar lagi.`);
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      const invalidFiles = files.filter(file => file.size > maxSize);
      if (invalidFiles.length > 0) {
        setErr('Beberapa file melebihi ukuran maksimal 5MB');
        return;
      }
      
      setSelectedImages(files);
      setErr('');
    };
    
    const removeImage = (index) => {
      const newImages = selectedImages.filter((_, i) => i !== index);
      setSelectedImages(newImages);
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setErr('');
      try {
        // Selalu gunakan FormData
        const formData = new FormData();
        
        if (product && product.productId) {
          // UPDATE produk - field sesuai ProductUpdateDTO (TANPA idToko)
          const productDataJson = {
            productName: form.productName,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            idCategory: form.idCategory ? Number(form.idCategory) : undefined,
            isActive: form.isActive,
            generalCategory: form.generalCategory,
            existingImageUrls: form.imageUrls || [] // Kirim gambar yang sudah ada
          };
          formData.append('productData', JSON.stringify(productDataJson));
          if (selectedImages.length > 0) {
            selectedImages.forEach(img => formData.append('images', img));
          }
          await api.put(`/api/products/${product.productId}`, formData);
        } else {
          // CREATE produk - field sesuai ProductCreateDTO (DENGAN idToko)
          if (selectedImages.length === 0) {
            throw new Error('Gambar produk wajib diisi untuk produk baru');
          }
          const productDataJson = {
            productName: form.productName,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            idToko: tokoId,
            idCategory: form.idCategory ? Number(form.idCategory) : undefined,
            isActive: form.isActive,
            generalCategory: form.generalCategory
          };
          formData.append('productData', JSON.stringify(productDataJson));
          selectedImages.forEach(img => formData.append('images', img));
          await api.post('/api/products', formData);
        }
        
        // Reset state setelah submit berhasil
        setSelectedImages([]);
        setForm({
          productName: '',
          description: '',
          price: 0,
          stock: 0,
          idCategory: '',
          imageUrl: '',
          isActive: true,
          generalCategory: 'LAINNYA',
          imageUrls: []
        });
        
        onSave();
        if (onCategoryAdded) {
          onCategoryAdded(form);
        }
      } catch (error) {
        console.error('Upload error:', error);
        let errorMessage = 'Gagal menyimpan produk';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Upload timeout. Coba dengan gambar yang lebih kecil atau koneksi yang lebih stabil.';
        } else if (error.response?.status === 413) {
          errorMessage = 'File terlalu besar. Maksimal ukuran file adalah 10MB per gambar.';
        } else if (error.response?.status === 400) {
          errorMessage = error.response?.data?.message || 'Data tidak valid. Periksa kembali form Anda.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setErr(errorMessage);
      } finally {
        setSaving(false);
      }
    };
    if (!show) return null;
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-all">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-500">{product ? 'Edit Produk' : 'Tambah Produk'}</h2>
          {err && <div className="text-red-500 mb-4 text-center p-3 bg-red-50 rounded-lg border border-red-200">{err}</div>}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Nama Produk</label>
                <input name="productName" value={form.productName} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition" required />
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-gray-700">Deskripsi</label>
                <textarea name="description" value={form.description} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition" rows={4} placeholder="Deskripsikan produk Anda..." />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Harga</label>
                  <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition" required min={0} placeholder="0" />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Stok</label>
                  <input name="stock" type="number" value={form.stock} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition" required min={0} placeholder="0" />
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="font-medium text-gray-700">Kategori</label>
                  <button type="button" onClick={() => setShowCategoryModal(true)} className="px-3 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition">
                    + Tambah
                  </button>
                </div>
                <select name="idCategory" value={form.idCategory} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition">
                  <option value="">Pilih Kategori</option>
                  {categories.map(cat => (
                    <option key={cat.idCategory} value={cat.idCategory}>{cat.namaCategory}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block mb-2 font-medium text-gray-700">Kategori Umum *</label>
                <select name="generalCategory" value={form.generalCategory} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition" required>
                  <option value="ELEKTRONIK">Elektronik</option>
                  <option value="FURNITUR">Furnitur</option>
                  <option value="PAKAIAN">Pakaian</option>
                  <option value="MAKANAN_MINUMAN">Makanan & Minuman</option>
                  <option value="KESEHATAN_KECANTIKAN">Kesehatan & Kecantikan</option>
                  <option value="OLAHRAGA_OUTDOOR">Olahraga & Outdoor</option>
                  <option value="OTOMOTIF">Otomotif</option>
                  <option value="BUKU_ALAT_TULIS">Buku & Alat Tulis</option>
                  <option value="MAINAN_HOBI">Mainan & Hobi</option>
                  <option value="RUMAH_TANGGA">Rumah Tangga</option>
                  <option value="PERHIASAN_AKSESORIS">Perhiasan & Aksesoris</option>
                  <option value="LAINNYA">Lainnya</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActiveMain" className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                <label htmlFor="isActiveMain" className="font-medium text-gray-700">Aktifkan Produk</label>
              </div>
            </div>
            
            {/* Right Column - Images */}
            <div>
              <label className="block mb-3 font-medium text-gray-700">Gambar Produk {!product && '*'}</label>
              <div className="text-xs text-gray-500 mb-4 p-2 bg-blue-50 rounded border border-blue-200">
                📸 Maksimal 5 gambar (JPG, PNG, JPEG) • Ukuran maksimal 5MB per gambar
              </div>
              
              {/* Show existing images for edit mode */}
              {product && form.imageUrls && form.imageUrls.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-3 text-gray-700">Gambar saat ini ({form.imageUrls.length}/5):</div>
                  <div className="grid grid-cols-3 gap-3">
                    {form.imageUrls.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200">
                          <img 
                            src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:6060${imageUrl}`} 
                            alt={`Existing ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newImageUrls = form.imageUrls.filter((_, i) => i !== index);
                            setForm({ ...form, imageUrls: newImageUrls });
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          title="Hapus gambar"
                        >
                          ×
                        </button>
                        <div className="text-xs text-center mt-1 text-gray-600">Foto {index + 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 hover:bg-red-50 transition-all duration-200"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  max="5"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-base font-medium text-gray-700 mb-1">Klik untuk upload atau drag & drop</p>
                    <p className="text-sm text-gray-500">PNG, JPG, JPEG hingga 5MB per file</p>
                    <p className="text-xs text-gray-400 mt-1">Maksimal 5 gambar total (termasuk gambar yang sudah ada)</p>
                  </div>
                </label>
              </div>

              {/* Preview New Images */}
              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-3 text-gray-700">Gambar baru yang dipilih ({selectedImages.length}/5):</div>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                          title="Hapus gambar"
                        >
                          ×
                        </button>
                        <div className="text-xs text-center mt-1 truncate px-1 text-gray-600">{file.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Show remaining slots */}
              {(product ? (form.imageUrls?.length || 0) + selectedImages.length : selectedImages.length) < 5 && (
                <div className="mt-4">
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 5 - ((product ? (form.imageUrls?.length || 0) : 0) + selectedImages.length) }).map((_, index) => (
                      <div key={`empty-slot-${index}`} className="w-full h-24 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Foto {((product ? (form.imageUrls?.length || 0) : 0) + selectedImages.length) + index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving} className="px-8 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </div>
              ) : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Modal Store Form
  const StoreModal = ({ show, onClose, onSave, store }) => {
    const [form, setForm] = React.useState(store || { namaToko: '', profilePictureToko: '' });
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState('');
    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleImage = (url) => {
      setForm({ ...form, profilePictureToko: url });
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setErr('');
      try {
        await api.put(`/api/toko/${store.idToko}`, form);
        onSave();
      } catch (error) {
        setErr('Gagal menyimpan toko');
      } finally {
        setSaving(false);
      }
    };
    if (!show) return null;
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border w-full max-w-md transition-all">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Edit Toko</h2>
          {err && <div className="text-red-500 mb-4 text-center">{err}</div>}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Nama Toko</label>
            <input name="namaToko" value={form.namaToko || ''} onChange={handleChange} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition" required />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Gambar Toko</label>
            <ImageUpload imageType="store" currentImageUrl={form.profilePictureToko} onImageUpdate={handleImage} />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">Batal</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    );
  };

  // Category Modal
  const CategoryModal = ({ show, onClose, onSave }) => {
    const [newCategoryName, setNewCategoryName] = React.useState('');
    const [savingCategory, setSavingCategory] = React.useState(false);
    const [categoryError, setCategoryError] = React.useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSavingCategory(true);
      setCategoryError('');
      try {
        const res = await api.post('/api/categories', {
          namaCategory: newCategoryName,
          idToko: store.idToko,
        });
        onSave(res.data.idCategory);
        setNewCategoryName('');
      } catch (error) {
        setCategoryError('Gagal menambah kategori');
      } finally {
        setSavingCategory(false);
      }
    };

    if (!show) return null;
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border w-full max-w-md transition-all">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-500">Tambah Kategori</h2>
          {categoryError && <div className="text-red-500 mb-4 text-center">{categoryError}</div>}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Nama Kategori</label>
            <input 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition" 
              required 
              placeholder="Masukkan nama kategori"
            />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">Batal</button>
            <button type="submit" disabled={savingCategory} className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60">
              {savingCategory ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Main component return

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-200">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 min-h-screen flex flex-col bg-white text-black shadow-xl sticky top-0 z-20">
            <div className="p-8 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white border-4 border-red-600 shadow-lg flex items-center justify-center mb-3 overflow-hidden">
                {store?.profilePictureToko ? (
                  <img src={`http://localhost:6060${store.profilePictureToko}`} alt="Toko" className="w-20 h-20 object-cover rounded-full" />
                ) : (
                  <span className="text-red-600 font-bold text-2xl">NT</span>
                )}
              </div>
              <h2 className="font-extrabold text-lg text-center mb-1">{store?.namaToko || 'Nama Toko'}</h2>
              <button onClick={handleEditStore} className="text-xs text-white bg-red-500 hover:bg-white hover:text-red-600 border border-white rounded-full px-4 py-1 mt-2 transition font-bold shadow">Edit Toko</button>
            </div>
            <nav className="flex-1 px-4 space-y-2">
              {sidebarItems.map((item) => (
                item.link ? (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.link)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 font-semibold text-base border-l-4 text-gray-700 border-transparent hover:bg-gray-100 hover:scale-105`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-xl transition-all duration-200 font-semibold text-base border-l-4 ${
                      activeMenu === item.id
                        ? 'bg-red-50 text-red-600 border-red-600 shadow scale-105'
                        : 'text-gray-700 border-transparent hover:bg-gray-100 hover:scale-105'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {item.id !== 'produk' && item.id !== 'beranda' && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                )
              ))}
            </nav>
            <div className="mt-auto p-6 border-t border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profilePicture ? (
                  <img src={`http://localhost:6060${user.profilePicture}`} alt={user.name} className="w-12 h-12 object-cover rounded-full" />
                ) : (
                  <span className="text-red-600 font-bold text-lg">{user?.name?.slice(0,2).toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-black text-sm">{user.name}</p>
                <button
                  onClick={() => navigate('/profile')}
                  className="text-xs text-gray-600 hover:text-red-500 mt-1"
                >
                  Ke Profil
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 bg-white/90 shadow-sm border-b p-6 flex justify-end">
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="text-orange-500">👋</span>
                <span className="font-bold">Halo, {user.name}</span>
              </div>
            </header>

            <section className="max-w-4xl mx-auto w-full mt-8 px-4">
              <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-8 mb-8">
                <div className="w-28 h-28 rounded-full bg-red-100 border-4 border-red-500 shadow flex items-center justify-center overflow-hidden shrink-0">
                  {store?.profilePictureToko ? (
                    <img src={`http://localhost:6060${store.profilePictureToko}`} alt="Toko" className="w-28 h-28 object-cover" />
                  ) : (
                    <span className="text-red-600 font-bold text-3xl">{store?.namaToko?.slice(0,2).toUpperCase() || 'NT'}</span>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-extrabold mb-2 text-gray-900">{store?.namaToko || 'Nama Toko'}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-2">
                    <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm shadow">Produk: {products.length}</div>
                    <div className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm shadow">Penjualan: 0</div>
                    <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm shadow">Kategori: {categories.length}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-5xl mx-auto w-full px-2 md:px-0">
              {activeMenu === 'produk' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-16">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Daftar Produk</h2>
                      <p className="text-red-500 text-sm mt-1">Atur produkmu disini</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari Produk"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {loading && <div className="p-6 text-center text-gray-500">Memuat data...</div>}
                {error && <div className="p-6 text-center text-red-500">{error}</div>}

                {!loading && !error && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-6">
                      {products.map((product) => (
                        <div key={product.productId} className="bg-gray-50 rounded-xl shadow hover:shadow-xl transition-all p-4 flex flex-col gap-2 border border-gray-100">
                           <div className="w-full h-40 bg-gray-200 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                              <img src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:6060${product.imageUrls[0]}`} alt={product.productName} className="w-full h-full object-cover" />
                            ) : product.imageUrl ? (
                              <img src={`http://localhost:6060${product.imageUrl}`} alt={product.productName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                            )}
                          </div>
                          <div className="font-bold text-lg text-gray-900 line-clamp-2">{product.productName}</div>
                          <div className="text-sm text-gray-500 mb-1">{product.categoryName || 'Tanpa Kategori'}</div>
                          <div className="text-base font-bold text-red-600">{formatCurrency(product.price)}</div>
                          <div className="text-xs text-gray-500 mb-2">Stok: {product.stock}</div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description || '-'}</p>
                          <div className="flex gap-2 mt-auto">
                            <button onClick={() => handleEditProduct(product)} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition">Edit</button>
                            <button onClick={() => handleDeleteProduct(product.productId)} className="flex-1 bg-gray-200 text-red-500 py-2 rounded-lg font-bold hover:bg-red-100 transition">Hapus</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* FIX: Struktur tabel yang rusak diperbaiki seluruhnya */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3">Produk</th>
                            <th scope="col" className="px-6 py-3">Stok</th>
                            <th scope="col" className="px-6 py-3">Harga</th>
                            <th scope="col" className="px-6 py-3">Deskripsi</th>
                            <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {products.map((product) => (
                            <tr key={product.productId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                                      {product.imageUrls && product.imageUrls.length > 0 ? (
                                        <img src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:6060${product.imageUrls[0]}`} alt={product.productName} className="w-14 h-14 object-cover" />
                                      ) : product.imageUrl ? (
                                        <img src={`http://localhost:6060${product.imageUrl}`} alt={product.productName} className="w-14 h-14 object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">IMG</div>
                                      )}
                                  </div>
                                  <div>
                                    <div className="font-bold">{product.productName}</div>
                                    <div className="text-xs text-gray-500">{product.categoryName || 'Tanpa Kategori'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(product.price)}</td>
                              <td className="px-6 py-4 max-w-xs">
                                <p className="truncate">{product.description || '-'}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex justify-center items-center gap-4">
                                    <button onClick={() => handleEditProduct(product)} className="font-medium text-indigo-600 hover:text-indigo-900">Edit</button>
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

                <div className="pt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 font-medium">{currentPage}</span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  </div>
                </div>
              )}
              
              {activeMenu === 'analisis' && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-16">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-red-500" />
                        Analisis Penjualan
                      </h2>
                      <p className="text-red-500 text-sm mt-1">Pantau performa toko Anda</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <select 
                        value={selectedPeriod} 
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="7_days">7 Hari Terakhir</option>
                        <option value="30_days">30 Hari Terakhir</option>
                        <option value="90_days">3 Bulan Terakhir</option>
                        <option value="1_year">1 Tahun Terakhir</option>
                        <option value="custom">Periode Kustom</option>
                      </select>
                      {selectedPeriod === 'custom' && (
                        <div className="flex items-center gap-2">
                          <input 
                            type="date" 
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <span className="text-gray-500">-</span>
                          <input 
                            type="date" 
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          <button 
                            onClick={handleCustomDateFilter}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            Filter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {analyticsLoading && (
                    <div className="p-8 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                      Memuat data analisis...
                    </div>
                  )}
                  
                  {analyticsError && (
                    <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg">
                      {analyticsError}
                    </div>
                  )}
                  
                  {!analyticsLoading && !analyticsError && summaryData && (
                    <div className="space-y-6">
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-blue-100 text-sm">Total Pesanan</p>
                              <p className="text-2xl font-bold">{summaryData.totalOrders || 0}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-200" />
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-green-100 text-sm">Total Pendapatan</p>
                              <p className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue || 0)}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-200" />
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-purple-100 text-sm">Produk Terjual</p>
                              <p className="text-2xl font-bold">{summaryData.totalProductsSold || 0}</p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-purple-200" />
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-orange-100 text-sm">Rata-rata Pesanan</p>
                              <p className="text-2xl font-bold">{formatCurrency(summaryData.averageOrderValue || 0)}</p>
                            </div>
                            <Users className="w-8 h-8 text-orange-200" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Analytics */}
                      {analyticsData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Top Products */}
                          {analyticsData.topProducts && analyticsData.topProducts.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                🏆 <span>Produk Terlaris</span>
                              </h3>
                              <div className="space-y-4">
                                {analyticsData.topProducts.slice(0, 5).map((product, index) => (
                                  <div key={product.productId} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                        'bg-gradient-to-r from-blue-400 to-blue-600'
                                      }`}>
                                        <span className="text-sm">#{index + 1}</span>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-gray-900">{product.productName}</p>
                                        <p className="text-sm text-gray-600 flex items-center gap-1">
                                          <Package className="w-3 h-3" />
                                          {product.quantitySold} terjual
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                                      <p className="text-xs text-gray-500">Total Revenue</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Category Sales */}
                          {analyticsData.categorySales && analyticsData.categorySales.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                              <h3 className="text-lg font-bold text-gray-900 mb-6">Distribusi Penjualan per Kategori</h3>
                              <div className="h-80 flex items-center justify-center">
                                <Doughnut
                                  data={{
                                    labels: analyticsData.categorySales.slice(0, 5).map(category => category.categoryName),
                                    datasets: [
                                      {
                                        data: analyticsData.categorySales.slice(0, 5).map(category => category.revenue),
                                        backgroundColor: [
                                          'rgba(59, 130, 246, 0.8)',
                                          'rgba(16, 185, 129, 0.8)',
                                          'rgba(245, 158, 11, 0.8)',
                                          'rgba(239, 68, 68, 0.8)',
                                          'rgba(139, 92, 246, 0.8)',
                                        ],
                                        borderColor: [
                                          'rgba(59, 130, 246, 1)',
                                          'rgba(16, 185, 129, 1)',
                                          'rgba(245, 158, 11, 1)',
                                          'rgba(239, 68, 68, 1)',
                                          'rgba(139, 92, 246, 1)',
                                        ],
                                        borderWidth: 3,
                                        hoverOffset: 10,
                                      }
                                    ]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        position: 'bottom',
                                        labels: {
                                          usePointStyle: true,
                                          padding: 20,
                                          font: {
                                            size: 12,
                                            weight: 'bold'
                                          },
                                          generateLabels: function(chart) {
                                            const data = chart.data;
                                            if (data.labels.length && data.datasets.length) {
                                              return data.labels.map((label, i) => {
                                                const value = data.datasets[0].data[i];
                                                const category = analyticsData.categorySales[i];
                                                return {
                                                  text: `${label} (${category.orderCount} pesanan)`,
                                                  fillStyle: data.datasets[0].backgroundColor[i],
                                                  strokeStyle: data.datasets[0].borderColor[i],
                                                  lineWidth: data.datasets[0].borderWidth,
                                                  pointStyle: 'circle',
                                                  hidden: false,
                                                  index: i
                                                };
                                              });
                                            }
                                            return [];
                                          }
                                        }
                                      },
                                      tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleColor: 'white',
                                        bodyColor: 'white',
                                        borderColor: 'rgba(59, 130, 246, 1)',
                                        borderWidth: 1,
                                        cornerRadius: 8,
                                        callbacks: {
                                          label: function(context) {
                                            const category = analyticsData.categorySales[context.dataIndex];
                                            const total = analyticsData.categorySales.reduce((sum, cat) => sum + cat.revenue, 0);
                                            const percentage = ((category.revenue / total) * 100).toFixed(1);
                                            return [
                                              `${category.categoryName}`,
                                              `Pendapatan: ${formatCurrency(category.revenue)}`,
                                              `Pesanan: ${category.orderCount}`,
                                              `Persentase: ${percentage}%`
                                            ];
                                          }
                                        }
                                      }
                                    },
                                    animation: {
                                      animateRotate: true,
                                      duration: 1000
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Daily Sales Chart */}
                          {analyticsData.dailySales && analyticsData.dailySales.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
                              <h3 className="text-lg font-bold text-gray-900 mb-6">Grafik Penjualan Harian</h3>
                              <div className="h-80">
                                <Bar
                                  data={{
                                    labels: analyticsData.dailySales.slice(-7).map(day => {
                                      const date = new Date(day.date);
                                      return date.toLocaleDateString('id-ID', { 
                                        weekday: 'short', 
                                        day: 'numeric', 
                                        month: 'short' 
                                      });
                                    }),
                                    datasets: [
                                      {
                                        label: 'Pendapatan (Rp)',
                                        data: analyticsData.dailySales.slice(-7).map(day => day.revenue),
                                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                                        borderColor: 'rgba(59, 130, 246, 1)',
                                        borderWidth: 2,
                                        borderRadius: 8,
                                        borderSkipped: false,
                                      },
                                      {
                                        label: 'Jumlah Pesanan',
                                        data: analyticsData.dailySales.slice(-7).map(day => day.orderCount * 50000), // Scale for visibility
                                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                        borderColor: 'rgba(16, 185, 129, 1)',
                                        borderWidth: 2,
                                        borderRadius: 8,
                                        borderSkipped: false,
                                      }
                                    ]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        position: 'top',
                                        labels: {
                                          usePointStyle: true,
                                          padding: 20,
                                          font: {
                                            size: 12,
                                            weight: 'bold'
                                          }
                                        }
                                      },
                                      tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleColor: 'white',
                                        bodyColor: 'white',
                                        borderColor: 'rgba(59, 130, 246, 1)',
                                        borderWidth: 1,
                                        cornerRadius: 8,
                                        callbacks: {
                                          label: function(context) {
                                            if (context.datasetIndex === 0) {
                                              return `Pendapatan: ${formatCurrency(context.parsed.y)}`;
                                            } else {
                                              return `Pesanan: ${Math.round(context.parsed.y / 50000)} order`;
                                            }
                                          }
                                        }
                                      }
                                    },
                                    scales: {
                                      y: {
                                        beginAtZero: true,
                                        grid: {
                                          color: 'rgba(0, 0, 0, 0.1)',
                                        },
                                        ticks: {
                                          callback: function(value) {
                                            return formatCurrency(value);
                                          },
                                          font: {
                                            size: 11
                                          }
                                        }
                                      },
                                      x: {
                                        grid: {
                                          display: false,
                                        },
                                        ticks: {
                                          font: {
                                            size: 11,
                                            weight: 'bold'
                                          }
                                        }
                                      }
                                    },
                                    animation: {
                                      duration: 1000,
                                      easing: 'easeInOutQuart'
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Monthly Sales Trend */}
                          {analyticsData.monthlySales && analyticsData.monthlySales.length > 0 && (
                            <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
                              <h3 className="text-lg font-bold text-gray-900 mb-6">📈 Trend Penjualan Bulanan</h3>
                              <div className="h-80">
                                <Line
                                  data={{
                                    labels: analyticsData.monthlySales.map(month => {
                                      const date = new Date(month.month + '-01');
                                      return date.toLocaleDateString('id-ID', { 
                                        month: 'short', 
                                        year: 'numeric' 
                                      });
                                    }),
                                    datasets: [
                                      {
                                        label: 'Pendapatan Bulanan',
                                        data: analyticsData.monthlySales.map(month => month.revenue),
                                        borderColor: 'rgba(59, 130, 246, 1)',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                                        pointBorderColor: 'white',
                                        pointBorderWidth: 2,
                                        pointRadius: 6,
                                        pointHoverRadius: 8,
                                      },
                                      {
                                        label: 'Jumlah Pesanan',
                                        data: analyticsData.monthlySales.map(month => month.orderCount * 100000), // Scale for visibility
                                        borderColor: 'rgba(16, 185, 129, 1)',
                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                        borderWidth: 3,
                                        fill: true,
                                        tension: 0.4,
                                        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                                        pointBorderColor: 'white',
                                        pointBorderWidth: 2,
                                        pointRadius: 6,
                                        pointHoverRadius: 8,
                                      }
                                    ]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        position: 'top',
                                        labels: {
                                          usePointStyle: true,
                                          padding: 20,
                                          font: {
                                            size: 12,
                                            weight: 'bold'
                                          }
                                        }
                                      },
                                      tooltip: {
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        titleColor: 'white',
                                        bodyColor: 'white',
                                        borderColor: 'rgba(59, 130, 246, 1)',
                                        borderWidth: 1,
                                        cornerRadius: 8,
                                        callbacks: {
                                          label: function(context) {
                                            if (context.datasetIndex === 0) {
                                              return `Pendapatan: ${formatCurrency(context.parsed.y)}`;
                                            } else {
                                              return `Pesanan: ${Math.round(context.parsed.y / 100000)} order`;
                                            }
                                          }
                                        }
                                      }
                                    },
                                    scales: {
                                      y: {
                                        beginAtZero: true,
                                        grid: {
                                          color: 'rgba(0, 0, 0, 0.1)',
                                        },
                                        ticks: {
                                          callback: function(value) {
                                            return formatCurrency(value);
                                          },
                                          font: {
                                            size: 11
                                          }
                                        }
                                      },
                                      x: {
                                        grid: {
                                          color: 'rgba(0, 0, 0, 0.05)',
                                        },
                                        ticks: {
                                          font: {
                                            size: 11,
                                            weight: 'bold'
                                          }
                                        }
                                      }
                                    },
                                    animation: {
                                      duration: 1500,
                                      easing: 'easeInOutQuart'
                                    },
                                    interaction: {
                                      intersect: false,
                                      mode: 'index'
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Growth Rate */}
                      {summaryData.growthRate !== undefined && (
                        <div className={`p-6 rounded-xl shadow-lg border-l-4 ${
                          summaryData.growthRate >= 0 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500' 
                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500'
                        }`}>
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            📊 <span>Tingkat Pertumbuhan</span>
                          </h3>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-full ${
                                summaryData.growthRate >= 0 ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                <TrendingUp className={`w-6 h-6 ${
                                  summaryData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                                } ${summaryData.growthRate < 0 ? 'rotate-180' : ''}`} />
                              </div>
                              <div>
                                <span className={`text-3xl font-bold ${
                                  summaryData.growthRate >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {summaryData.growthRate >= 0 ? '+' : ''}{summaryData.growthRate.toFixed(1)}%
                                </span>
                                <p className="text-sm text-gray-600 mt-1">dibanding periode sebelumnya</p>
                              </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              summaryData.growthRate >= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {summaryData.growthRate >= 0 ? '📈 Naik' : '📉 Turun'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!analyticsLoading && !analyticsError && !summaryData && (
                    <div className="p-8 text-center text-gray-500">
                      <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium">Belum ada data penjualan</p>
                      <p className="text-sm">Data analisis akan muncul setelah Anda memiliki pesanan</p>
                    </div>
                  )}
                </div>
              )}

              <div className="fixed bottom-8 right-8 z-30 flex flex-col items-end gap-4">
                <button
                  onClick={() => navigate('/seller/chat')}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 text-sm font-bold transition-all duration-200 shadow-blue-300 hover:scale-110 group"
                >
                  <span className="text-lg">💬</span>
                  <span className="hidden group-hover:block md:block">Chat</span>
                </button>
                <button
                  onClick={handleAddProduct}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg p-5 flex items-center gap-2 text-lg font-bold transition-all duration-200 shadow-red-300 hover:scale-110 group"
                >
                  <Plus className="w-6 h-6" />
                  <span className="hidden group-hover:block md:block">Tambah Produk</span>
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>

      <ProductModal 
        show={showProductModal} 
        onClose={() => setShowProductModal(false)} 
        onSave={() => { 
          setShowProductModal(false); 
          fetchStoreAndProducts(user, currentPage, searchTerm, false); 
          setNewCategoryId(null); 
        }} 
        product={editProduct} 
        tokoId={store?.idToko} 
        onCategoryAdded={() => {}} 
        newCategoryId={newCategoryId} 
      />
      <StoreModal show={showStoreModal} onClose={() => setShowStoreModal(false)} onSave={() => { setShowStoreModal(false); fetchStoreAndProducts(user, 1, ''); }} store={store} />
      <CategoryModal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} onSave={async (newCategory) => {
        setShowCategoryModal(false);
        await refreshCategories(); // Refresh list kategori global
        setNewCategoryId(newCategory.idCategory); // Trigger update di modal produk
      }} />
    </>
  );
};

export default SellerDashboard;