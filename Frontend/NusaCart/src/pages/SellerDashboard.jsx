import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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
    setLoading(true);
    try {
      await api.delete(`/api/products/${productId}`);
      fetchStoreAndProducts();
    } catch (err) {
      setError('Gagal menghapus produk');
    } finally {
      setLoading(false);
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  // Modal Product Form - Wrapped with React.memo to prevent unnecessary re-renders
  const ProductModal = React.memo(({ show, onClose, onSave, product, tokoId, onCategoryAdded, newCategoryId }) => {
    const [form, setForm] = React.useState(product || {
      productName: '',
      description: '',
      price: 0,
      stock: 0,
      idCategory: '',
      imageUrl: '',
      isActive: true,
      generalCategory: 'LAINNYA'
    });
    const [saving, setSaving] = React.useState(false);
    const [err, setErr] = React.useState('');
    const [selectedImages, setSelectedImages] = React.useState([]);
    const [modalCategories, setModalCategories] = React.useState([]);
    
    // Use ref to store form state to prevent loss during re-renders
    const formRef = React.useRef(form);
    const selectedImagesRef = React.useRef(selectedImages);
    const isRestoringRef = React.useRef(false);
    
    // Update refs when form changes (but not during restoration)
    React.useEffect(() => {
      if (!isRestoringRef.current) {
        formRef.current = form;
        // Save to localStorage as backup
        if (show) {
          localStorage.setItem('productFormBackup', JSON.stringify(form));
        }
      }
    }, [form, show]);
    
    React.useEffect(() => {
      if (!isRestoringRef.current) {
        selectedImagesRef.current = selectedImages;
      }
    }, [selectedImages]);

    // Initialize modal categories when modal opens
    React.useEffect(() => {
      if (show) {
        console.log('=== ProductModal OPENED ===');
        console.log('Current form state:', form);
        console.log('Product prop:', product);
        console.log('Categories available:', categories?.length || 0);
        
        const currentCategories = Array.isArray(categories) ? categories : [];
        setModalCategories([...currentCategories]);
        
        // Try to restore from localStorage if available
        const backup = localStorage.getItem('productFormBackup');
        if (backup && !product) {
          try {
            const backupForm = JSON.parse(backup);
            console.log('📦 Restoring form from localStorage backup:', backupForm);
            isRestoringRef.current = true;
            setForm(backupForm);
            setTimeout(() => {
              isRestoringRef.current = false;
            }, 100);
          } catch (e) {
            console.log('❌ Failed to restore from backup:', e);
          }
        }
      } else {
        console.log('=== ProductModal CLOSED ===');
        // Clear backup when modal closes
        localStorage.removeItem('productFormBackup');
      }
    }, [show]); // Removed product dependency to prevent re-initialization

    React.useEffect(() => {
      if (product && show) {
        console.log('Setting form from product:', product);
        isRestoringRef.current = true;
        setForm(product);
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      }
    }, [product, show]); // Added show dependency to only update when modal is open
    
    React.useEffect(() => {
      if (newCategoryId) {
        console.log('Setting new category ID:', newCategoryId);
        setForm(f => ({ ...f, idCategory: newCategoryId }));
        
        // Add new category to modal categories if not already present
        const currentCategories = Array.isArray(categories) ? categories : [];
        const newCategory = currentCategories.find(cat => cat.idCategory === newCategoryId);
        console.log('Found new category:', newCategory);
        if (newCategory) {
          setModalCategories(prev => {
            const exists = prev.find(cat => cat.idCategory === newCategoryId);
            if (!exists) {
              console.log('Adding new category to modal categories:', newCategory);
              return [...prev, newCategory];
            }
            return prev;
          });
        }
      }
    }, [newCategoryId]); // Removed categories and modalCategories dependencies
    
    // Update modalCategories when global categories change (after adding new category)
    React.useEffect(() => {
      if (show && Array.isArray(categories)) {
        console.log('🔄 Updating modal categories from global categories:', categories.length);
        console.log('Current modal categories:', modalCategories.length);
        console.log('Global categories:', categories.map(c => ({ id: c.idCategory, name: c.namaCategory })));
        
        // Always update modalCategories to match global categories
        setModalCategories([...categories]);
        console.log('✅ Modal categories updated successfully');
      }
    }, [categories, show]);
    
    // Additional effect to ensure modalCategories is updated after new category is added
    React.useEffect(() => {
      if (newCategoryId && Array.isArray(categories) && categories.length > 0) {
        console.log('🆕 New category detected, forcing modalCategories update');
        const updatedCategories = [...categories];
        setModalCategories(updatedCategories);
        console.log('Updated modalCategories:', updatedCategories.map(c => ({ id: c.idCategory, name: c.namaCategory })));
      }
    }, [newCategoryId, categories]);
    
    // Handle opening category modal
    const handleOpenCategoryModal = React.useCallback(() => {
      console.log('🏷️ Opening category modal');
      console.log('Current form before category modal:', formRef.current);
      console.log('Current selected images:', selectedImagesRef.current);
      // Save current state before opening category modal
      localStorage.setItem('productFormBeforeCategory', JSON.stringify({
        form: formRef.current,
        selectedImages: selectedImagesRef.current.length
      }));
      setShowCategoryModal(true);
    }, []);
    
    // Handle category modal close - restore form if needed
    React.useEffect(() => {
      if (!showCategoryModal && show) {
        console.log('🏷️ Category modal closed, checking form state');
        // Small delay to ensure category updates are processed
        setTimeout(() => {
          const backup = localStorage.getItem('productFormBeforeCategory');
          if (backup) {
            try {
              const { form: backupForm } = JSON.parse(backup);
              console.log('📦 Backup form found:', backupForm);
              
              // Only restore if current form is different and seems to be reset
              const currentFormEmpty = !form.productName && !form.description && form.price === 0;
              const backupFormHasData = backupForm.productName || backupForm.description || backupForm.price > 0;
              
              console.log('Form comparison:', { currentFormEmpty, backupFormHasData });
              
              if (currentFormEmpty && backupFormHasData) {
                console.log('🔄 Form appears to be reset, restoring from backup');
                isRestoringRef.current = true;
                setForm(backupForm);
                setTimeout(() => {
                  isRestoringRef.current = false;
                }, 100);
              } else {
                console.log('✅ Form state is preserved, no restoration needed');
              }
              
              localStorage.removeItem('productFormBeforeCategory');
            } catch (e) {
              console.log('❌ Failed to restore from category backup:', e);
            }
          }
        }, 100);
      }
    }, [showCategoryModal, show]); // Removed form dependency to prevent excessive re-renders

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      const newForm = { ...form, [name]: type === 'checkbox' ? checked : value };
      setForm(newForm);
    };
    
    const handleImage = (url) => {
      setForm({ ...form, imageUrl: url });
    };
    
    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      setSelectedImages(files);
    };
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setErr('');
      try {
        // Clear backup on successful submit
        localStorage.removeItem('productFormBackup');
        localStorage.removeItem('productFormBeforeCategory');
        
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
            generalCategory: form.generalCategory
          };
          formData.append('productData', JSON.stringify(productDataJson));
          if (selectedImages.length > 0) {
            selectedImages.forEach(img => formData.append('images', img));
          }
          await api.put(`/api/products/${product.productId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
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
          await api.post('/api/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
        
        onSave();
        if (onCategoryAdded) {
          onCategoryAdded(form);
        }
      } catch (error) {
        setErr(error.response?.data?.message || error.message || 'Gagal menyimpan produk');
      } finally {
        setSaving(false);
      }
    };
    
    if (!show) return null;
    
    return (
      <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border w-full max-w-md transition-all">
          <h2 className="text-2xl font-bold mb-6 text-center text-red-500">{product ? 'Edit Produk' : 'Tambah Produk'}</h2>
          {err && <div className="text-red-500 mb-4 text-center">{err}</div>}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Nama Produk</label>
            <input name="productName" value={form.productName || ''} onChange={handleChange} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition" required />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Deskripsi</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition" rows={2} />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Harga</label>
            <input name="price" type="number" value={form.price || 0} onChange={handleChange} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition" required min={0} />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Stok</label>
            <input name="stock" type="number" value={form.stock || 0} onChange={handleChange} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition" required min={0} />
          </div>
          <div className="mb-4 flex items-center gap-2">
            <label className="block mb-2 font-medium">Kategori</label>
            <select name="idCategory" value={form.idCategory || ''} onChange={handleChange} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition">
              <option value="">Pilih Kategori</option>
              {Array.isArray(modalCategories) && modalCategories.map(cat => (
                <option key={cat.idCategory} value={cat.idCategory}>{cat.namaCategory}</option>
              ))}
            </select>
            <button type="button" onClick={handleOpenCategoryModal} className="ml-2 px-3 py-2 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition">Tambah Kategori</button>
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium">Kategori Umum *</label>
            <select name="generalCategory" value={form.generalCategory || 'LAINNYA'} onChange={handleChange} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition" required>
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
          <div className="mb-4">
            <label className="block mb-2 font-medium">Gambar Produk {!product && '*'}</label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition"
            />
            {form.imageUrl && (
              <img 
                src={form.imageUrl.startsWith('http') ? form.imageUrl : `http://localhost:6060${form.imageUrl}`} 
                alt="Current" 
                className="w-24 h-24 mt-2 object-cover rounded border" 
              />
            )}
            {selectedImages.length > 0 && (
              <div className="mt-2 text-sm text-green-600">
                {selectedImages.length} gambar dipilih
              </div>
            )}
          </div>
          <div className="mb-4 flex items-center gap-2">
            <input type="checkbox" name="isActive" checked={form.isActive || false} onChange={handleChange} id="isActive" />
            <label htmlFor="isActive">Aktifkan Produk</label>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">Batal</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    );
  }, (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.show === nextProps.show &&
      prevProps.product === nextProps.product &&
      prevProps.tokoId === nextProps.tokoId &&
      prevProps.newCategoryId === nextProps.newCategoryId
    );
  });

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
            <input name="namaToko" value={form.namaToko} onChange={handleChange} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition" required />
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

  // Modal Tambah Kategori
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
        setNewCategoryName('');
        onSave(res.data);
      } catch (err) {
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
            <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-200 transition" required />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition">Batal</button>
            <button type="submit" disabled={savingCategory} className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-60">{savingCategory ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    );
  };

  return (
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
          {/* User Profile at Bottom */}
          <div className="mt-auto p-6 border-t border-white/20 flex items-center gap-3">
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center overflow-hidden">
              {user?.profilePicture ? (
                <img src={`http://localhost:6060${user.profilePicture}`} alt={user.name} className="w-12 h-12 object-cover rounded-full" />
              ) : (
                <span className="text-red-600 font-bold text-lg">{user?.name?.slice(0,2) || 'U'}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-black text-sm">{user.name}</p>
              <button
                onClick={() => navigate('/profile')}
                className="text-xs text-black/80 hover:text-red-500 mt-1"
              >
                Ke Profil
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/90 shadow-sm border-b p-6 flex justify-end">
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-orange-500">👋</span>
              <span className="font-bold">Halo, {user.name}</span>
            </div>
          </header>

          {/* Store Info Card & Statistik */}
          <section className="max-w-4xl mx-auto w-full mt-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-8 mb-8">
              <div className="w-28 h-28 rounded-full bg-red-100 border-4 border-red-500 shadow flex items-center justify-center overflow-hidden">
                {store?.profilePictureToko ? (
                  <img src={`http://localhost:6060${store.profilePictureToko}`} alt="Toko" className="w-28 h-28 object-cover rounded-full" />
                ) : (
                  <span className="text-red-600 font-bold text-3xl">{store?.namaToko?.slice(0,2) || 'NT'}</span>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-extrabold mb-2 text-gray-900">{store?.namaToko || 'Nama Toko'}</h1>
                <div className="flex flex-wrap gap-4 mb-2">
                  <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm shadow">Produk: {products.length}</div>
                  <div className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm shadow">Penjualan: 0</div>
                  <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm shadow">Kategori: {categories.length}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Product Management Section */}
          <section className="max-w-5xl mx-auto w-full px-2 md:px-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-16">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Daftar Produk</h2>
                  <p className="text-red-500 text-sm mt-1">Atur produkmu disini</p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Search */}
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

              {/* Loading/Error */}
              {loading && <div className="p-6 text-center text-gray-500">Memuat data...</div>}
              {error && <div className="p-6 text-center text-red-500">{error}</div>}

              {/* Product List: Card view on mobile, table on desktop */}
              {!loading && !error && (
                <>
                  {/* Card view for mobile */}
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
                        <div className="text-sm text-gray-500 mb-1">{product.category}</div>
                        <div className="text-base font-bold text-red-600">{formatCurrency(product.price)}</div>
                        <div className="text-xs text-gray-500 mb-2">Stok: {product.stock}</div>
                        <div className="text-xs text-gray-500 mb-2">{product.description && product.description.length > 30 ? product.description.slice(0, 30) + '...' : product.description}</div>
                        <div className="flex gap-2 mt-auto">
                          <button onClick={() => handleEditProduct(product)} className="flex-1 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600 transition">Edit</button>
                          <button onClick={() => handleDeleteProduct(product)} className="flex-1 bg-gray-200 text-red-500 py-2 rounded-lg font-bold hover:bg-red-100 transition">Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Table view for desktop */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full rounded-xl overflow-hidden">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Produk</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stok</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Harga</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Deskripsi</th>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                          <tr key={product.productId} className="hover:bg-red-50 transition-all">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0 mr-4 overflow-hidden">
                                  {product.imageUrls && product.imageUrls.length > 0 ? (
                                    <img src={product.imageUrls[0].startsWith('http') ? product.imageUrls[0] : `http://localhost:6060${product.imageUrls[0]}`} alt={product.productName} className="w-14 h-14 rounded-lg object-cover" />
                                  ) : product.imageUrl ? (
                                    <img src={`http://localhost:6060${product.imageUrl}`} alt={product.productName} className="w-14 h-14 rounded-lg object-cover" />
                                  ) : (
                                    <div className="w-14 h-14 bg-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-xs">IMG</div>
                                  )}
                                </div>
                                <div>
                                  <div className="text-base font-bold text-gray-900">{product.productName}</div>
                                  <div className="text-xs text-gray-500">{product.category}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">{product.stock}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-base text-red-600 font-bold">{formatCurrency(product.price)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.description && product.description.length > 30 ? product.description.slice(0, 30) + '...' : product.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                              <button onClick={() => handleEditProduct(product)} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition">Edit</button>
                              <button onClick={() => handleDeleteProduct(product)} className="bg-gray-200 text-red-500 px-4 py-2 rounded-lg font-bold hover:bg-red-100 transition">Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Pagination */}
              <div className="pt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Menampilkan data {(currentPage-1)*itemsPerPage+1} hingga {Math.min(currentPage*itemsPerPage, products.length)} dari {products.length} entri
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({length: totalPages}, (_, i) => i+1).slice(0, 5).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded ${currentPage === page ? 'bg-red-500 text-white border-red-500' : 'hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  ))}
                  {totalPages > 5 && <span className="px-2">...</span>}
                  {totalPages > 5 && (
                    <button className="px-3 py-1 border rounded hover:bg-gray-50">{totalPages}</button>
                  )}
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
            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 right-8 z-30 flex flex-col gap-4">
              <button
                onClick={() => navigate('/seller/chat')}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2 text-sm font-bold transition-all duration-200 shadow-blue-300 hover:scale-110"
              >
                <span className="text-lg">💬</span>
                <span className="hidden md:inline">Chat</span>
              </button>
              <button
                onClick={handleAddProduct}
                className="bg-red-600 hover:bg-black text-white rounded-full shadow-lg p-5 flex items-center gap-2 text-lg font-bold transition-all duration-200 shadow-red-300 hover:scale-110"
              >
                <Plus className="w-6 h-6" />
                <span className="hidden md:inline">Tambah Produk</span>
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Modals */}
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
        onCategoryAdded={cat => {
          // Kategori sudah ditambahkan ke state melalui CategoryModal onSave
          // Tidak perlu refresh lagi di sini
        }} 
        newCategoryId={newCategoryId} 
      />
      <StoreModal show={showStoreModal} onClose={() => setShowStoreModal(false)} onSave={() => { setShowStoreModal(false); fetchStoreAndProducts(); }} store={store} />
      <CategoryModal show={showCategoryModal} onClose={() => setShowCategoryModal(false)} onSave={async cat => {
        // Hanya tutup CategoryModal dan update kategori baru
        setShowCategoryModal(false);
        setNewCategoryId(cat.idCategory);
        await refreshCategories();
        // Jangan pernah setShowProductModal(false) atau setEditProduct(null) di sini!
      }} />
    </div>
  );
};

export default SellerDashboard;