import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
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
            <h1 className="text-2xl font-bold text-gray-900">Hasil Pencarian untuk: <span className="text-indigo-600">{searchName}</span></h1>
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
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Toko Terkait</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {stores.map(store => (
                        <div key={store.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg transition-all">
                          <img src={store.image} alt={store.name} className="w-16 h-16 rounded-full object-cover mb-2" />
                          <div className="font-bold text-gray-800 text-center">{store.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Hasil Produk */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Produk</h2>
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