import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Search,
  Grid,
  List,
  MessageCircle,
  Share2,
  Heart,
  ShoppingCart,
  Package,
  X
} from 'lucide-react';
import useTokoStore from '../stores/tokoStore';
import useProductStore from '../stores/productStore';
import useCategoryStore from '../stores/categoryStore';
import useCartStore from '../stores/cartStore';
import useWishlistStore from '../stores/wishlistStore';
import useAuthStore from '../stores/authStore';
import ProductCard from '../components/ProductCard';
import ProductRating from '../components/ProductRating';
import { toast } from 'react-hot-toast';

const TokoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Store hooks
  const { 
    currentStore, 
    loading: tokoLoading, 
    error: tokoError, 
    fetchStoreById 
  } = useTokoStore();
  
  const { 
    products, 
    loading: productsLoading, 
    fetchProductsByTokoId 
  } = useProductStore();
  
  const { 
    categories, 
    fetchCategoriesByTokoId 
  } = useCategoryStore();
  
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist } = useWishlistStore();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('newest');
  const [showStoreInfo, setShowStoreInfo] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    if (id) {
      fetchStoreById(id);
      fetchProductsByTokoId(id, 0, 20);
      fetchCategoriesByTokoId(id);
    }
  }, [id]);
  
  // Debug products data
  useEffect(() => {
    if (products.length > 0) {
      console.log('TokoPage - Products loaded:', products.length);
      products.forEach((product, index) => {
        if (index < 3) { // Only log first 3 products
          console.log(`Product ${product.productId}:`, {
            name: product.productName,
            imageUrls: product.imageUrls,
            hasImages: product.imageUrls && product.imageUrls.length > 0
          });
        }
      });
    }
  }, [products]);
  
  // Filter and search products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.idCategory === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.productName.localeCompare(b.productName);
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
  
  // Handle add to cart
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }
    
    try {
      await addToCart(product.productId, 1);
      toast.success(`${product.productName} ditambahkan ke keranjang`);
    } catch (error) {
      toast.error('Gagal menambahkan ke keranjang');
    }
  };
  
  // Handle add to wishlist
  const handleToggleWishlist = async (product) => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }
    
    try {
      if (product.isWishlisted) {
        await removeFromWishlist(product.productId);
        toast.success('Dihapus dari wishlist');
      } else {
        await addToWishlist(product.productId);
        toast.success('Ditambahkan ke wishlist');
      }
    } catch (error) {
      toast.error('Gagal mengubah wishlist');
    }
  };
  
  // Handle chat with store
  const handleChatWithStore = () => {
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      navigate('/login');
      return;
    }
    
    if (currentStore) {
      navigate(`/chat?storeId=${currentStore.idToko}&storeName=${encodeURIComponent(currentStore.namaToko)}`);
    }
  };
  
  // Handle share store
  const handleShareStore = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentStore?.namaToko || 'Toko',
          text: `Lihat toko ${currentStore?.namaToko || 'ini'} di NusaCart`,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast.success('Link toko disalin ke clipboard');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(url);
      toast.success('Link toko disalin ke clipboard');
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format address to show only city
  const formatAddress = (fullAddress) => {
    if (!fullAddress) return '';
    const parts = fullAddress.split(',');
    return parts.length > 1 ? parts[1].trim() : fullAddress;
  };
  
  // Loading state
  if (tokoLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat toko...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (tokoError || !currentStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Toko Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">
            {tokoError || 'Toko yang Anda cari tidak ditemukan atau tidak tersedia.'}
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Lihat Produk Lainnya
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
            {/* Store Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gray-200 overflow-hidden">
                {currentStore.profilePictureToko ? (
                  <img
                    src={currentStore.profilePictureToko.startsWith('http') 
                      ? currentStore.profilePictureToko 
                      : `http://localhost:6060${currentStore.profilePictureToko}`}
                    alt={currentStore.namaToko}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Store Info */}
            <div className="flex-1 mt-4 lg:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {currentStore.namaToko}
                  </h1>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {formatAddress(currentStore.alamatToko)}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Bergabung {formatDate(currentStore.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {products.length} Produk
                    </div>
                  </div>
                  
                  {currentStore.deskripsiToko && (
                    <p className="mt-3 text-gray-700 leading-relaxed">
                      {showStoreInfo 
                        ? currentStore.deskripsiToko 
                        : `${currentStore.deskripsiToko.substring(0, 150)}${currentStore.deskripsiToko.length > 150 ? '...' : ''}`
                      }
                      {currentStore.deskripsiToko.length > 150 && (
                        <button
                          onClick={() => setShowStoreInfo(!showStoreInfo)}
                          className="ml-2 text-green-600 hover:text-green-700 font-medium"
                        >
                          {showStoreInfo ? 'Sembunyikan' : 'Selengkapnya'}
                        </button>
                      )}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                  <button
                    onClick={handleChatWithStore}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat
                  </button>
                  <button
                    onClick={handleShareStore}
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Bagikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Store Contact Info (Collapsible) */}
      {showStoreInfo && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center text-gray-600">
                <Phone className="h-4 w-4 mr-3" />
                <span>{currentStore.noTelpToko}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-3" />
                <span>{currentStore.emailToko}</span>
              </div>
              <div className="flex items-start text-gray-600 md:col-span-2">
                <MapPin className="h-4 w-4 mr-3 mt-0.5" />
                <span>{currentStore.alamatToko}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk di toko ini..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Filters and View Options */}
            <div className="flex items-center space-x-4">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category.idCategory} value={category.idCategory}>
                    {category.namaCategory}
                  </option>
                ))}
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="newest">Terbaru</option>
                <option value="name">Nama A-Z</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
              </select>
              
              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid/List */}
        {productsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat produk...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory ? 'Produk Tidak Ditemukan' : 'Belum Ada Produk'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory 
                ? 'Coba ubah kata kunci pencarian atau filter kategori.'
                : 'Toko ini belum memiliki produk yang tersedia.'}
            </p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Hapus Filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Menampilkan {sortedProducts.length} dari {products.length} produk
                {(searchTerm || selectedCategory) && (
                  <span className="ml-2">
                    {searchTerm && `untuk "${searchTerm}"`}
                    {selectedCategory && ` dalam kategori "${categories.find(c => c.idCategory === parseInt(selectedCategory))?.namaCategory}"`}
                  </span>
                )}
              </p>
              
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="flex items-center text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Hapus Filter
                </button>
              )}
            </div>
            
            {/* Products */}
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {sortedProducts.map(product => (
                viewMode === 'grid' ? (
                  <ProductCard 
                    key={product.productId} 
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onToggleWishlist={() => handleToggleWishlist(product)}
                  />
                ) : (
                  <div key={product.productId} className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={product.imageUrls && product.imageUrls.length > 0
                          ? (product.imageUrls[0].startsWith('http') 
                             ? product.imageUrls[0] 
                             : `http://localhost:6060${product.imageUrls[0]}`)
                          : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"}
                        alt={product.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          console.log(`Failed to load image for product ${product.productId}:`, e.target.src);
                          e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
                        }}
                        onLoad={() => {
                          console.log(`Successfully loaded image for product ${product.productId}`);
                        }}
                      />
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/product/${product.productId}`}
                        className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
                      >
                        {product.productName}
                      </Link>
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-xl font-bold text-green-600">
                          Rp {product.price?.toLocaleString('id-ID')}
                        </span>
                        <ProductRating productId={product.productId} />
                        <span className="text-sm text-gray-500">
                          Stok: {product.stock}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleWishlist(product)}
                        className={`p-2 rounded-lg transition-colors ${
                          product.isWishlisted 
                            ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${product.isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.stock === 0 ? 'Habis' : 'Keranjang'}
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TokoPage;