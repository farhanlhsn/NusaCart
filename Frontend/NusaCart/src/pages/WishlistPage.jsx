import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Trash2, Filter, Grid3X3, List, Star, Search, ChevronDown, Share2, Check, X, ChevronsUpDown } from "lucide-react";
import useWishlistStore from "../stores/wishlistStore";
import useCartStore from "../stores/cartStore";

export default function WishlistPage() {
    const navigate = useNavigate();
    const {
        wishlistItems,
        filterCategory,
        searchQuery,
        sortBy,
        selectedItems,
        viewMode,
        showFilters,
        notification,
        setWishlistItems,
        addToWishlist,
        removeFromWishlist,
        setFilterCategory,
        setSearchQuery,
        setSortBy,
        setSelectedItems,
        setViewMode,
        setShowFilters,
        setNotification,
        clearNotification
    } = useWishlistStore();
    
    const { addProductToCart } = useCartStore();

    const categories = ['all', 'Gaming', 'Electronics', 'Furniture', 'Real Estate'];
    const sortOptions = [
        { value: 'newest', label: 'Terbaru' },
        { value: 'oldest', label: 'Terlama' },
        { value: 'price-low', label: 'Harga Terendah' },
        { value: 'price-high', label: 'Harga Tertinggi' },
        { value: 'rating', label: 'Rating Tertinggi' },
        { value: 'discount', label: 'Diskon Terbesar' }
    ];

    // Filter and sort items
    const filteredAndSortedItems = wishlistItems
        .filter(item => {
            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.addedDate) - new Date(a.addedDate);
                case 'oldest':
                    return new Date(a.addedDate) - new Date(b.addedDate);
                case 'price-low':
                    return a.currentPrice - b.currentPrice;
                case 'price-high':
                    return b.currentPrice - a.currentPrice;
                case 'rating':
                    return b.rating - a.rating;
                case 'discount':
                    return b.discount - a.discount;
                default:
                    return 0;
            }
        });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = () => {
        setSelectedItems(
            selectedItems.length === filteredAndSortedItems.length 
                ? [] 
                : filteredAndSortedItems.map(item => item.id)
        );
    };

    const handleRemoveSelected = () => {
        if (selectedItems.length === 0) return;
        showNotification(`${selectedItems.length} item berhasil dihapus dari wishlist`);
        setSelectedItems([]);
    };

    const handleAddToCart = async (item) => {
        try {
            // Assume item has a productId property, or use id if it's the product ID
            const productId = item.productId || item.id;
            await addProductToCart(productId, 1);
            showNotification(`${item.name} ditambahkan ke keranjang`);
        } catch (error) {
            showNotification(`Gagal menambahkan ${item.name} ke keranjang`, 'error');
        }
    };

    const handleRemoveItem = (itemId) => {
        const item = wishlistItems.find(i => i.id === itemId);
        showNotification(`${item.name} dihapus dari wishlist`);
    };

    const handleAddAllToCart = async () => {
        const inStockItems = filteredAndSortedItems.filter(item => item.inStock);
        if (inStockItems.length === 0) {
            showNotification('Tidak ada item yang tersedia untuk ditambahkan ke keranjang', 'error');
            return;
        }
        
        try {
            // Add all items to cart
            for (const item of inStockItems) {
                const productId = item.productId || item.id;
                await addProductToCart(productId, 1);
            }
            showNotification(`${inStockItems.length} item ditambahkan ke keranjang`);
        } catch (error) {
            showNotification('Gagal menambahkan beberapa item ke keranjang', 'error');
        }
    };

    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `Rp ${(price / 1000000).toFixed(price % 1000000 === 0 ? 0 : 1)}jt`;
        } else if (price >= 1000) {
            return `Rp ${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`;
        }
        return `Rp ${price}`;
    };

    const WishlistItemCard = ({ item }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-1">
            {/* Image Section */}
            <div className="relative overflow-hidden">
                <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Discount Badge */}
                {item.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        -{item.discount}%
                    </div>
                )}

                {/* Stock Status */}
                {!item.inStock && (
                    <div className="absolute top-3 right-3 bg-gray-900 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                        Stok Habis
                    </div>
                )}

                {/* Action Buttons */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex gap-3">
                        <button 
                            onClick={() => handleAddToCart(item)}
                            disabled={!item.inStock}
                            className="bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-110"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </button>
                        <button className="bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-gray-800 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110">
                            <Eye className="w-5 h-5" />
                        </button>
                        <button className="bg-white/90 backdrop-blur-sm text-gray-800 p-3 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Selection Checkbox */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                            selectedItems.includes(item.id)
                                ? 'bg-red-500 border-red-500'
                                : 'bg-white/80 border-gray-300 hover:border-red-400'
                        }`}>
                            {selectedItems.includes(item.id) && (
                                <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                            )}
                        </div>
                    </label>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 flex-1 group-hover:text-red-600 transition-colors duration-200">
                        {item.name}
                    </h3>
                    <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 ml-2 hover:bg-red-50 p-1 rounded-lg"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Category Badge */}
                <div className="mb-3">
                    <span className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {item.category}
                    </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{item.rating}</span>
                    <span className="text-sm text-gray-400">({item.reviewCount})</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-xl font-bold text-red-600">
                        {formatPrice(item.currentPrice)}
                    </span>
                    {item.originalPrice > item.currentPrice && (
                        <span className="text-sm text-gray-500 line-through">
                            {formatPrice(item.originalPrice)}
                        </span>
                    )}
                </div>

                {/* Action Button */}
                <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.inStock}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                        item.inStock 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:shadow-lg transform hover:scale-105' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {item.inStock ? 'Tambah ke Keranjang' : 'Stok Habis'}
                </button>
            </div>
        </div>
    );

    const WishlistItemRow = ({ item }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:border-red-200">
            <div className="flex items-center gap-6">
                {/* Checkbox */}
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                        selectedItems.includes(item.id)
                            ? 'bg-red-500 border-red-500'
                            : 'bg-white border-gray-300 hover:border-red-400'
                    }`}>
                        {selectedItems.includes(item.id) && (
                            <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                        )}
                    </div>
                </label>

                {/* Image */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 group">
                    <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {item.discount > 0 && (
                        <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            -{item.discount}%
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate hover:text-red-600 transition-colors duration-200">{item.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star 
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">{item.rating}</span>
                        <span className="text-sm text-gray-400">({item.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-block bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                            {item.category}
                        </span>
                        {!item.inStock && (
                            <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                                Stok Habis
                            </span>
                        )}
                    </div>
                </div>

                {/* Price */}
                <div className="text-right">
                    <div className="text-xl font-bold text-red-600 mb-1">
                        {formatPrice(item.currentPrice)}
                    </div>
                    {item.originalPrice > item.currentPrice && (
                        <div className="text-sm text-gray-500 line-through">
                            {formatPrice(item.originalPrice)}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleAddToCart(item)}
                        disabled={!item.inStock}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            item.inStock 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {item.inStock ? 'Tambah ke Keranjang' : 'Stok Habis'}
                    </button>
                    <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Notification Component
    const Notification = () => {
        if (!notification) return null;

        return (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
                    notification.type === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                }`}>
                    {notification.type === 'success' ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <X className="w-5 h-5" />
                    )}
                    <span className="font-medium">{notification.message}</span>
                    <button 
                        onClick={() => setNotification(null)}
                        className="text-white/80 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-8">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Wishlist</h1>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <button 
                                    onClick={() => navigate('/')}
                                    className="hover:text-red-600 cursor-pointer transition-colors font-medium"
                                >
                                    Beranda
                                </button>
                                <span>|</span>
                                <span className="text-red-600 font-medium">Wishlist</span>
                            </div>
                        </div>

                        {/* Empty State */}
                        <div className="text-center py-20">
                            <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-red-100 via-red-200 to-red-300 rounded-full flex items-center justify-center shadow-2xl relative">
                                <Heart className="w-20 h-20 text-red-500" />
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Wishlist Masih Kosong</h3>
                            <p className="text-gray-600 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                                Belum ada produk di wishlist Anda. Mulai tambahkan produk favorit untuk dibeli nanti!
                            </p>
                            <button 
                                onClick={() => navigate('/')}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-10 py-4 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 font-semibold text-lg"
                            >
                                Mulai Belanja Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <Notification />
            
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Wishlist</h1>
                                <span className="bg-gradient-to-r from-red-100 to-red-200 text-red-700 px-4 py-2 rounded-full text-sm font-bold shadow-sm">
                                    {filteredAndSortedItems.length} item
                                </span>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAddAllToCart}
                                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                    Tambah Semua ke Keranjang
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <button 
                                onClick={() => navigate('/')}
                                className="hover:text-red-600 cursor-pointer transition-colors font-medium"
                            >
                                Beranda
                            </button>
                            <span>|</span>
                            <span className="text-red-600 font-medium">Wishlist</span>
                        </div>
                    </div>

                    {/* Enhanced Search and Filter Bar */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari produk di wishlist..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-3">
                                {/* Category Filter */}
                                <div className="relative">
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer min-w-[150px]"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category === 'all' ? 'Semua Kategori' : category}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>

                                {/* Sort */}
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer min-w-[150px]"
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronsUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {/* Left Controls */}
                            <div className="flex items-center gap-4">
                                {/* Select All */}
                                <div className="flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer mr-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
                                            onChange={handleSelectAll}
                                            className="sr-only"
                                        />
                                        <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                                            selectedItems.length === filteredAndSortedItems.length && filteredAndSortedItems.length > 0
                                                ? 'bg-red-500 border-red-500'
                                                : 'bg-white border-gray-300 hover:border-red-400'
                                        }`}>
                                            {selectedItems.length === filteredAndSortedItems.length && filteredAndSortedItems.length > 0 && (
                                                <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />
                                            )}
                                        </div>
                                    </label>
                                    <span className="text-gray-700 font-medium">Pilih Semua</span>
                                </div>

                                {/* Remove Selected */}
                                {selectedItems.length > 0 && (
                                    <button
                                        onClick={handleRemoveSelected}
                                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg transform hover:scale-105"
                                    >
                                        Hapus Terpilih ({selectedItems.length})
                                    </button>
                                )}
                            </div>

                            {/* Right Controls */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 mr-2 font-medium">Tampilan:</span>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-3 rounded-lg transition-all duration-200 ${
                                        viewMode === 'grid' 
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <Grid3X3 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-3 rounded-lg transition-all duration-200 ${
                                        viewMode === 'list' 
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg' 
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Info */}
                    {searchQuery && (
                        <div className="mb-6">
                            <p className="text-gray-600">
                                Menampilkan <span className="font-semibold text-gray-900">{filteredAndSortedItems.length}</span> hasil 
                                {searchQuery && <span> untuk "<span className="font-semibold text-red-600">{searchQuery}</span>"</span>}
                                {filterCategory !== 'all' && <span> dalam kategori <span className="font-semibold text-gray-900">{filterCategory}</span></span>}
                            </p>
                        </div>
                    )}

                    {/* Products */}
                    {filteredAndSortedItems.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                <Search className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Tidak Ada Hasil</h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery 
                                    ? `Tidak ditemukan produk untuk "${searchQuery}"`
                                    : 'Tidak ada produk dalam kategori ini'
                                }
                            </p>
                            <button 
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterCategory('all');
                                }}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                            >
                                Reset Filter
                            </button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredAndSortedItems.map(item => (
                                <WishlistItemCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAndSortedItems.map(item => (
                                <WishlistItemRow key={item.id} item={item} />
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}