import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../stores/cartStore";

export default function CartPage() {
    const navigate = useNavigate();
    
    // Zustand store
    const {
        products,
        isLoading,
        error,
        getProductsByStore,
        getSubtotal,
        getCheckedItems,
        toggleProductCheck,
        toggleSelectAll,
        toggleStoreSelection,
        updateQuantity,
        removeProduct,
        proceedToCheckout,
        fetchCartItems,
        clearError
    } = useCartStore();

    const [storeSelections, setStoreSelections] = useState({});

    // Memoize computed values to prevent infinite loops
    const productsByStore = useMemo(() => getProductsByStore(), [products]);
    const subtotal = getSubtotal();
    const allSelected = products.length > 0 && products.every(p => p.checked);

    // Fetch cart items on mount
    useEffect(() => {
        fetchCartItems();
    }, []); // Remove fetchCartItems from dependency array

    useEffect(() => {
        // Update store selections
        const newStoreSelections = {};
        Object.entries(productsByStore).forEach(([storeId, storeData]) => {
            newStoreSelections[storeId] = storeData.products.every(p => p.checked);
        });
        setStoreSelections(newStoreSelections);
    }, [productsByStore]); // Only depend on memoized productsByStore

    const handleCheckout = () => {
        const checkedItems = getCheckedItems();
        if (checkedItems.length === 0) {
            alert("Silakan pilih setidaknya satu produk untuk checkout");
            return;
        }
        
        // Set checkout items in store and navigate
        proceedToCheckout();
        navigate('/checkout');
    };

    const handleClearError = () => {
        clearError();
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Memuat keranjang...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L4 4m0 0H2" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <button 
                                onClick={() => {
                                    window.location.href = '/';
                                }}
                                className="hover:text-red-600 cursor-pointer transition-colors"
                            >
                                Beranda
                            </button>
                            <span>•</span>
                            <span className="text-red-600 font-medium">Keranjang</span>
                        </div>
                    </div> 
                    
                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="w-6 h-6 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-medium text-red-800">Terjadi Kesalahan</h3>
                                        <p className="text-red-700">{error}</p>
                                    </div>
                                </div>
                                <button onClick={handleClearError} className="text-red-600 hover:text-red-800 transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty Cart State */}
                    {products.length === 0 && !isLoading && (
                        <div className="text-center py-20">
                            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L4 4m0 0H2" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Keranjang Masih Kosong</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">Belum ada produk di keranjang Anda. Yuk mulai berbelanja produk-produk terbaik dari berbagai toko di NusaCart!</p>
                            <button 
                                onClick={() => {
                                    window.location.href = '/';
                                }}
                                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-semibold"
                            >
                                Mulai Belanja Sekarang
                            </button>
                        </div>
                    )}

                    {/* Cart Content */}
                    {products.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Product List */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Select All */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            checked={allSelected} 
                                            onChange={toggleSelectAll} 
                                            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 mr-4" 
                                        />
                                        <span className="text-lg font-semibold text-gray-800">Pilih Semua Produk</span>
                                        <span className="ml-2 text-sm text-gray-500">({products.length} item)</span>
                                    </div>
                                </div>
                                
                                {/* Products by Store */}
                                <div className="space-y-6">
                                    {Object.entries(productsByStore).map(([storeId, storeData]) => (
                                        <div key={storeId} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                            {/* Store Header */}
                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                                                <div className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={storeSelections[storeId] || false}
                                                        onChange={() => toggleStoreSelection(parseInt(storeId))}
                                                        className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 mr-4" 
                                                    />
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 mr-4 shadow-lg">
                                                            {storeData.store.profilePictureToko ? (
                                                                <img 
                                                                    src={storeData.store.profilePictureToko.startsWith('http') 
                                                                        ? storeData.store.profilePictureToko 
                                                                        : `http://localhost:6060${storeData.store.profilePictureToko}`} 
                                                                    alt={storeData.store.name} 
                                                                    className="w-12 h-12 rounded-xl object-cover" 
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                                                                <div>
                                            <h3 className="text-xl font-bold text-gray-800">
                                                <button 
                                                    onClick={() => navigate(`/toko/${storeId}`)}
                                                    className="hover:text-red-600 transition-colors cursor-pointer"
                                                >
                                                    {storeData.store.name}
                                                </button>
                                            </h3>
                                            <p className="text-sm text-gray-600 flex items-center mt-1">
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                {storeData.store.location}
                                            </p>
                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Store Products */}
                                            <div className="p-6 space-y-4">
                                                {storeData.products.map(product => (
                                                    <div key={product.id} className="flex items-center bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors duration-200 border border-gray-100">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={product.checked} 
                                                            onChange={() => toggleProductCheck(product.id)} 
                                                            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500 mr-5" 
                                                        />
                                                        <img 
                                                            src={product.image} 
                                                            alt={product.name} 
                                                            className="w-20 h-20 rounded-xl object-cover mr-5 shadow-md" 
                                                        />
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h4>
                                                            <p className="text-xl font-bold text-red-600">Rp {product.price.toLocaleString('id-ID')}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                                                <button 
                                                                    onClick={() => updateQuantity(product.id, -1)}
                                                                    className="px-4 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="px-4 py-2 font-semibold text-gray-800 bg-gray-50 min-w-[3rem] text-center">{product.qty}</span>
                                                                <button 
                                                                    onClick={() => updateQuantity(product.id, 1)}
                                                                    className="px-4 py-2 text-lg font-semibold text-gray-600 hover:bg-gray-100 hover:text-red-600 transition-colors"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <button 
                                                                onClick={() => removeProduct(product.id)} 
                                                                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                                title="Hapus dari keranjang"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg p-8 text-white sticky top-8">
                                    <div className="flex items-center mb-6">
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <h2 className="text-xl font-bold">Ringkasan Pesanan</h2>
                                    </div>
                                    
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center py-2 border-b border-red-500">
                                            <span className="text-red-100">Subtotal:</span>
                                            <span className="font-semibold">Rp {subtotal.toLocaleString('id-ID')}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-red-500">
                                            <span className="text-red-100">Pengiriman:</span>
                                            <span className="font-semibold text-green-300">Gratis</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4">
                                            <span className="text-xl font-bold">Total:</span>
                                            <span className="text-2xl font-bold">Rp {subtotal.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handleCheckout}
                                        className="w-full bg-white text-red-600 rounded-xl py-4 font-bold text-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        Lanjut ke Pembayaran
                                    </button>
                                    
                                    <div className="mt-4 text-center text-red-100 text-sm">
                                        <p>Secure checkout dengan enkripsi SSL</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}