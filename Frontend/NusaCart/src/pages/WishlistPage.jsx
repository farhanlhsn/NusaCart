import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Trash2, Filter, Grid3X3, List, Star, Search, ChevronDown, Share2, Check, X, ChevronsUpDown } from "lucide-react";
import useWishlistStore from "../stores/wishlistStore";
import useCartStore from "../stores/cartStore";
import useAuthStore from "../stores/authStore";

export default function WishlistPage() {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { addProductToCart } = useCartStore();
    const { 
        wishlistItems, 
        loading, 
        error, 
        notification,
        fetchWishlist, 
        removeFromWishlist,
        clearNotification 
    } = useWishlistStore();
    
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [selectedItems, setSelectedItems] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    const categories = ['all', 'Gaming', 'Electronics', 'Furniture', 'Real Estate'];
    const sortOptions = [
        { value: 'newest', label: 'Terbaru' },
        { value: 'oldest', label: 'Terlama' },
        { value: 'price-low', label: 'Harga Terendah' },
        { value: 'price-high', label: 'Harga Tertinggi' },
        { value: 'rating', label: 'Rating Tertinggi' },
        { value: 'discount', label: 'Diskon Terbesar' }
    ];

    // Load wishlist when component mounts or user changes
    useEffect(() => {
        if (user?.userId) {
            fetchWishlist(user.userId);
        }
    }, [user?.userId, fetchWishlist]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // Filter and sort items
    const filteredAndSortedItems = wishlistItems
        .filter(item => {
            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
            const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'oldest':
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'discount':
                    return (b.discount || 0) - (a.discount || 0);
                default:
                    return 0;
            }
        });

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === filteredAndSortedItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredAndSortedItems.map(item => item.productId));
        }
    };

    const handleRemoveSelected = async () => {
        if (selectedItems.length === 0) return;
        
        try {
            await Promise.all(
                selectedItems.map(productId => removeFromWishlist(productId))
            );
            setSelectedItems([]);
        } catch (error) {
            console.error('Failed to remove selected items:', error);
        }
    };

    const handleAddToCart = async (item) => {
        try {
            await addProductToCart(item.productId, 1);
            alert('Product added to cart successfully!');
        } catch (error) {
            alert(error.message || 'Failed to add to cart');
        }
    };

    const handleAddAllToCart = async () => {
        try {
            await Promise.all(
                filteredAndSortedItems.map(item => addProductToCart(item.productId, 1))
            );
            alert('All items added to cart successfully!');
        } catch (error) {
            alert('Some items could not be added to cart');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(price);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="text-yellow-400">★</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="text-yellow-400">☆</span>);
        }

        const remainingStars = 5 - Math.ceil(rating || 0);
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>);
        }

        return stars;
    };

    // Notification Component
    const Notification = () => {
        if (!notification) return null;

        return (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
                <div className={`
                    px-6 py-4 rounded-lg shadow-lg max-w-sm
                    ${notification.type === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }
                `}>
                    <div className="flex items-center justify-between">
                        <p className="font-medium">{notification.message}</p>
                        <button 
                            onClick={clearNotification}
                            className="ml-3 text-white hover:text-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Image component with better loading and error handling
    const ProductImage = ({ item, isSelected }) => {
        const [imageLoading, setImageLoading] = useState(true);
        const [imageError, setImageError] = useState(false);
        
        const getImageUrl = () => {
            if (imageError) {
                return 'https://via.placeholder.com/400x400/f3f4f6/6b7280?text=No+Image';
            }
            
            if (item.imageUrls && item.imageUrls.length > 0) {
                const imageUrl = item.imageUrls[0];
                if (imageUrl.startsWith('http')) {
                    return imageUrl;
                } else {
                    return `http://localhost:6060${imageUrl}`;
                }
            }
            
            return 'https://via.placeholder.com/400x400/f3f4f6/6b7280?text=Product';
        };

        const handleImageLoad = () => {
            setImageLoading(false);
        };

        const handleImageError = () => {
            setImageError(true);
            setImageLoading(false);
        };

        return (
            <div className="relative overflow-hidden rounded-t-2xl bg-gray-100">
                {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                )}
                
                <img
                    src={getImageUrl()}
                    alt={item.productName || 'Product'}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                    style={{ display: imageLoading ? 'none' : 'block' }}
                />
                
                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 
                              transition-all duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(`/product/${item.productId}`)}
                        className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center
                                 opacity-0 group-hover:opacity-100 transition-all duration-300 
                                 transform translate-y-4 group-hover:translate-y-0 hover:scale-110"
                    >
                        <Eye className="w-5 h-5 text-gray-700" />
                    </button>
                    
                    <button
                        onClick={() => handleAddToCart(item)}
                        className="w-12 h-12 bg-red-500 rounded-full shadow-lg flex items-center justify-center
                                 opacity-0 group-hover:opacity-100 transition-all duration-300 
                                 transform translate-y-4 group-hover:translate-y-0 hover:scale-110
                                 delay-75"
                    >
                        <ShoppingCart className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        );
    };

    // Wishlist Item Card Component
    const WishlistItemCard = ({ item }) => {
        const isSelected = selectedItems.includes(item.productId);

        return (
            <div className={`
                group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl 
                transition-all duration-300 transform hover:scale-[1.02] border-2
                ${isSelected ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-100 hover:border-red-200'}
            `}>
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                    <button
                        onClick={() => handleSelectItem(item.productId)}
                        className={`
                            w-6 h-6 rounded-lg border-2 flex items-center justify-center
                            transition-all duration-200 shadow-sm
                            ${isSelected 
                                ? 'bg-red-500 border-red-500 text-white' 
                                : 'bg-white border-gray-300 hover:border-red-400'
                            }
                        `}
                    >
                        {isSelected && <Check className="w-4 h-4" />}
                    </button>
                </div>

                {/* Remove Button */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={() => removeFromWishlist(item.productId)}
                        className="w-8 h-8 bg-white rounded-full shadow-md hover:shadow-lg 
                                 flex items-center justify-center hover:bg-red-50 
                                 transition-all duration-200 group"
                    >
                        <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-500" />
                    </button>
                </div>

                {/* Product Image */}
                <ProductImage item={item} isSelected={isSelected} />

                {/* Product Info */}
                <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {item.productName || 'Unknown Product'}
                    </h3>
                    
                    <div className="flex items-center mb-3">
                        <div className="flex items-center space-x-1">
                            {renderStars(item.rating)}
                        </div>
                        <span className="text-gray-500 text-sm ml-2">
                            ({item.reviewCount || 0} reviews)
                        </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold text-red-600">
                                {item.price ? formatPrice(item.price) : 'Price not available'}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 line-through">
                                        {formatPrice(item.originalPrice)}
                                    </span>
                                    <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                                        -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <span className={`
                            px-3 py-1 rounded-full text-sm font-medium
                            ${(item.stock || 0) > 0 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }
                        `}>
                            {(item.stock || 0) > 0 ? 'Tersedia' : 'Habis'}
                        </span>
                    </div>

                    <button
                        onClick={() => handleAddToCart(item)}
                        disabled={(item.stock || 0) === 0}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 
                                 text-white py-3 rounded-xl font-semibold
                                 hover:from-red-600 hover:to-red-700 
                                 disabled:from-gray-300 disabled:to-gray-400
                                 disabled:cursor-not-allowed
                                 transition-all duration-200 shadow-lg hover:shadow-xl
                                 transform hover:scale-[1.02]"
                    >
                        {(item.stock || 0) > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
                    </button>
                </div>
            </div>
        );
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading wishlist...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !wishlistItems.length) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">💔</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => fetchWishlist(user?.userId)}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                        Try Again
                    </button>
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
                                {filteredAndSortedItems.length > 0 && (
                                    <button
                                        onClick={handleAddAllToCart}
                                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        Tambah Semua ke Keranjang
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {filteredAndSortedItems.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-gray-300 text-8xl mb-6">💝</div>
                            <h2 className="text-3xl font-bold text-gray-600 mb-4">Wishlist Kosong</h2>
                            <p className="text-gray-500 text-lg mb-8">
                                Belum ada produk yang ditambahkan ke wishlist
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                            >
                                Mulai Belanja
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Controls */}
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    {/* Search and Filters */}
                                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                        <div className="relative flex-1 max-w-md">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Cari produk..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>

                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
                                        >
                                            {sortOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Selection Actions */}
                                    {selectedItems.length > 0 && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-gray-600">
                                                {selectedItems.length} dipilih
                                            </span>
                                            <button
                                                onClick={handleRemoveSelected}
                                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                Hapus Dipilih
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleSelectAll}
                                            className="text-red-600 hover:text-red-700 font-medium"
                                        >
                                            {selectedItems.length === filteredAndSortedItems.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                                        </button>
                                        
                                        <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-2 rounded-md transition-all duration-200 ${
                                                    viewMode === 'grid' 
                                                        ? 'bg-red-500 text-white shadow-md' 
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                <Grid3X3 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-2 rounded-md transition-all duration-200 ${
                                                    viewMode === 'list' 
                                                        ? 'bg-red-500 text-white shadow-md' 
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                <List className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredAndSortedItems.map(item => (
                                    <WishlistItemCard key={item.productId} item={item} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}