import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ChatButton from "../components/ChatButton";
import useSearchStore from "../stores/searchStore";
import useProductStore from "../stores/productStore";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const searchName = query.get("name") || "";
  const { results, stores, loading, error, fetchSearchResults, setDummy } = useSearchStore();
  const { fetchProductsWithFilters } = useProductStore();
  
  const [filters, setFilters] = useState({
    categoryId: '',
    generalCategory: '',
    minPrice: '',
    maxPrice: '',
    sortBy: '',
    sortDirection: 'asc',
    productName: searchName
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

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
    if (!searchName) {
      return;
    }
    fetchSearchResults(searchName);
    setFilters(prev => ({ ...prev, productName: searchName }));
  }, [searchName, fetchSearchResults]);

  useEffect(() => {
    if (!isFiltering) {
      setFilteredResults(results);
    }
  }, [results, isFiltering]);

  const applyFilters = async () => {
    if (!searchName) return;
    
    setIsFiltering(true);
    
    try {
      // Build query parameters for backend API
      const queryParams = new URLSearchParams({
        page: '0',
        size: '100'
      });
      
      // Add search name
      if (searchName) {
        queryParams.append('productName', searchName);
      }
      
      // Add filters only if they have values
      if (filters.generalCategory) {
        queryParams.append('generalCategory', filters.generalCategory);
      }
      
      if (filters.minPrice) {
        queryParams.append('minPrice', filters.minPrice);
      }
      
      if (filters.maxPrice) {
        queryParams.append('maxPrice', filters.maxPrice);
      }
      
      if (filters.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
        queryParams.append('sortDirection', filters.sortDirection);
      }
      
      // Always show active products only
      queryParams.append('activeOnly', 'true');
      
      const response = await fetch(`http://localhost:6060/api/products?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Filter response:', data);
      
      // Handle different response structures
      const products = data.data || data.content || data || [];
      setFilteredResults(Array.isArray(products) ? products : []);
      
    } catch (err) {
      console.error('Filter error:', err);
      // Fallback to client-side filtering
      let filtered = [...results];
      
      if (filters.generalCategory) {
        filtered = filtered.filter(product => 
          product.generalCategory === filters.generalCategory
        );
      }
      
      if (filters.minPrice) {
        filtered = filtered.filter(product => 
          product.price >= parseFloat(filters.minPrice)
        );
      }
      
      if (filters.maxPrice) {
        filtered = filtered.filter(product => 
          product.price <= parseFloat(filters.maxPrice)
        );
      }
      
      if (filters.sortBy) {
        filtered.sort((a, b) => {
          const aVal = a[filters.sortBy];
          const bVal = b[filters.sortBy];
          
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const comparison = aVal.localeCompare(bVal);
            return filters.sortDirection === 'desc' ? -comparison : comparison;
          } else {
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return filters.sortDirection === 'desc' ? -comparison : comparison;
          }
        });
      }
      
      setFilteredResults(filtered);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    applyFilters();
  };

  const handleClearFilters = () => {
    setFilters({
      categoryId: '',
      generalCategory: '',
      minPrice: '',
      maxPrice: '',
      sortBy: '',
      sortDirection: 'asc',
      productName: searchName
    });
    setIsFiltering(false);
    setFilteredResults(results);
  };

  const displayResults = isFiltering ? filteredResults : results;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black p-2 rounded-full border border-gray-200 bg-white shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hasil Pencarian untuk: <span className="text-indigo-600">{searchName}</span></h1>
              <p className="text-sm text-gray-600 mt-1">
                Ditemukan {displayResults.length} produk{stores.length > 0 && ` dan ${stores.length} toko`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
          </button>
        </div>
        
        {/* Main Content with Sidebar */}
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
          
          {/* Content Area */}
          <div className="lg:w-3/4">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                <span className="ml-4 text-gray-600 text-lg">Mencari...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            ) : (
              <>
                {/* Hasil Toko */}
                {stores.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Toko Terkait ({stores.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {stores.map(store => (
                        <button 
                          key={store.idToko || store.id} 
                          onClick={() => navigate(`/toko/${store.idToko || store.id}`)}
                          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-center group border border-gray-100 hover:border-blue-200"
                        >
                          {/* Store Image */}
                          <div className="w-16 h-16 mb-4 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            {store.profilePictureToko ? (
                              <img 
                                src={store.profilePictureToko.startsWith('http') 
                                  ? store.profilePictureToko 
                                  : `http://localhost:6060${store.profilePictureToko}`} 
                                alt={store.namaToko || store.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-full h-full flex items-center justify-center text-gray-400"
                              style={{ display: store.profilePictureToko ? 'none' : 'flex' }}
                            >
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          </div>
                          
                          {/* Store Info */}
                          <div className="text-center">
                            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors text-sm mb-2 line-clamp-2">
                              {store.namaToko || store.name}
                            </h3>
                            
                            {/* Store Location */}
                            {store.alamatToko && (
                              <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {store.alamatToko.length > 30 ? `${store.alamatToko.substring(0, 30)}...` : store.alamatToko}
                              </p>
                            )}
                            
                            {/* Store Stats */}
                            <div className="flex items-center justify-center space-x-3 text-xs text-gray-500">
                              {store.createdAt && (
                                <span className="flex items-center">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {new Date(store.createdAt).getFullYear()}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Hover Effect */}
                          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-blue-600 font-medium">Kunjungi Toko →</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {/* Hasil Produk */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Produk ({displayResults.length})
                </h2>
                {displayResults.length === 0 ? (
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <p className="text-gray-500">Tidak ada produk ditemukan untuk kata kunci tersebut.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayResults.map(product => (
                      <ProductCard key={product.productId} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}