import React, { useEffect, useState } from "react";
import useProductStore from "../stores/productStore";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  const { products, loading, error, fetchProducts, fetchProductsWithFilters, pagination } = useProductStore();
  const [filters, setFilters] = useState({
    categoryId: '',
    generalCategory: '',
    minPrice: '',
    maxPrice: '',
    sortBy: '',
    sortDirection: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [globalTotal, setGlobalTotal] = useState(0);
  
  // Extract pagination data with defaults
  const currentPage = (pagination.currentPage || 0) + 1; // Convert from 0-based to 1-based
  const totalPages = pagination.totalPages || 0;
  const pageSize = pagination.size || 12; // Changed from 20 to 12 products per page
  const totalItems = pagination.totalElements || 0;

  // General categories from backend enum
  const generalCategories = [
    { value: 'ELEKTRONIK', label: 'Elektronik' },
    { value: 'FURNITUR', label: 'Furnitur' },
    { value: 'PAKAIAN', label: 'Pakaian' },
    { value: 'MAKANAN_MINUMAN', label: 'Makanan & Minuman' },
    { value: 'KESEHATAN_KECANTIKAN', label: 'Kesehatan & Kecantikan' },
    { value: 'OLAHRAGA_OUTDOOR', label: 'Olahraga & Outdoor' },
    { value: 'OTOMOTIF', label: 'Otomotif' },
    { value: 'BUKU_ALAT_TULIS', label: 'Buku & Alat Tulis' },
    { value: 'MAINAN_HOBI', label: 'Mainan & Hobi' },
    { value: 'RUMAH_TANGGA', label: 'Rumah Tangga' },
    { value: 'PERHIASAN_AKSESORIS', label: 'Perhiasan & Aksesoris' },
    { value: 'LAINNYA', label: 'Lainnya' }
  ];

  const sortOptions = [
    { value: 'productName', label: 'Nama Produk' },
    { value: 'price', label: 'Harga' },
    { value: 'stock', label: 'Stok' },
    { value: 'createdAt', label: 'Tanggal Dibuat' }
  ];

  useEffect(() => {
    applyFilters(0); // Start with page 0
    // eslint-disable-next-line
  }, []);

  // Update global total when pagination changes
  useEffect(() => {
    if (totalItems > 0) {
      setGlobalTotal(totalItems);
    }
  }, [totalItems]);

  const applyFilters = (page = 0) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    );
    
    if (Object.keys(cleanFilters).length === 0) {
      fetchProducts(page, 12);
    } else {
      fetchProductsWithFilters(page, 12, cleanFilters);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    applyFilters(0); // Reset to first page when applying filters
  };

  const handleClearFilters = () => {
    setFilters({
      categoryId: '',
      generalCategory: '',
      minPrice: '',
      maxPrice: '',
      sortBy: '',
      sortDirection: ''
    });
    fetchProducts(0, 12); // Fetch without filters, 12 products per page
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    applyFilters(page - 1); // Convert from 1-based to 0-based for API
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top when changing page
  };

  // Generate pagination numbers with ellipsis for better UX
  const generatePaginationNumbers = () => {
    const delta = 2; // Number of pages to show around current page
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
    }

    return rangeWithDots;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button onClick={() => window.location.href = '/'} className="hover:text-red-600 cursor-pointer transition-colors">Beranda</button>
          <span>|</span>
          <span className="text-red-600 font-medium">Produk</span>
        </div>
        {/* End Breadcrumbs */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Semua Produk</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Filter Produk</h2>
              
              {/* General Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select
                  value={filters.generalCategory}
                  onChange={(e) => handleFilterChange('generalCategory', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Kategori</option>
                  {generalCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Harga</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* Sort Options */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan Berdasarkan</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                >
                  <option value="">Default</option>
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                {filters.sortBy && (
                  <select
                    value={filters.sortDirection}
                    onChange={(e) => handleFilterChange('sortDirection', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                )}
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Terapkan
                </button>
                <button
                  onClick={handleClearFilters}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
                <span className="ml-4 text-gray-600 text-lg">Memuat produk...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-lg shadow-md p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <p>Kemungkinan penyebab:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Server backend tidak berjalan</li>
                    <li>Koneksi internet bermasalah</li>
                    <li>Database tidak tersedia</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Muat Ulang Halaman
                  </button>
                  <button 
                    onClick={() => applyFilters(0)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-lg shadow-md p-8">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Tidak Ada Produk Ditemukan</h3>
                    <p className="text-gray-500 mb-6">Belum ada produk yang tersedia saat ini.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button 
                        onClick={() => applyFilters(0)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Refresh Data
                      </button>
                      <button 
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Kembali ke Beranda
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.map(product => (
                        <ProductCard key={product.productId || product.id} product={product} />
                      ))}
                    </div>
                    
                    {/* Pagination Info & Controls */}
                    {products.length > 0 && (
                      <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
                        <div className="text-gray-500 text-sm">
                          {products.length > 0 ? (
                            (() => {
                              const startItem = (currentPage - 1) * 12 + 1;
                              const endItem = (currentPage - 1) * 12 + products.length;
                              const total = globalTotal > 0 ? globalTotal : (totalItems > 0 ? totalItems : ((currentPage - 1) * 12 + products.length));
                              
                              return <>Menampilkan {startItem} - {endItem} dari {total} produk</>;
                            })()
                          ) : (
                            <>Tidak ada produk ditemukan</>
                          )}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              ← Sebelumnya
                            </button>
                            
                            {generatePaginationNumbers().map((page, index) => (
                              page === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400">...</span>
                              ) : (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                                    page === currentPage
                                      ? 'bg-red-500 text-white border-red-500 shadow-md'
                                      : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                                  }`}
                                >
                                  {page}
                                </button>
                              )
                            ))}
                            
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Selanjutnya →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}