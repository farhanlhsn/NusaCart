import React, { useEffect, useState } from "react";
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

    // Get computed values
    const productsByStore = getProductsByStore();
    const subtotal = getSubtotal();
    const allSelected = products.length > 0 && products.every(p => p.checked);

    // Fetch cart items on mount
    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    useEffect(() => {
        // Update store selections
        const newStoreSelections = {};
        Object.entries(productsByStore).forEach(([storeId, storeData]) => {
            newStoreSelections[storeId] = storeData.products.every(p => p.checked);
        });
        setStoreSelections(newStoreSelections);
    }, [products, productsByStore]);

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
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Beranda</span>
                        <span>|</span>
                        <span className="text-red-600 font-medium">Keranjang</span>
                    </div>
                </div>
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Keranjang</h1>
                    
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-red-800">{error}</span>
                                </div>
                                <button onClick={handleClearError} className="text-red-600 hover:text-red-800">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Empty Cart State */}
                    {products.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L4 4m0 0H2" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Keranjang Kosong</h3>
                            <p className="text-gray-500 mb-6">Belum ada produk di keranjang Anda</p>
                            <button 
                                onClick={() => navigate('/')}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Mulai Belanja
                            </button>
                        </div>
                    )}

                    {/* Cart Content */}
                    {products.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                            {/* Daftar Produk Berdasarkan Toko */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center mb-6">
                                    <input 
                                        type="checkbox" 
                                        checked={allSelected} 
                                        onChange={toggleSelectAll} 
                                        className="w-5 h-5 mr-2" 
                                    />
                                    <span className="text-lg font-medium">Select All</span>
                                </div>
                                
                                <div className="space-y-8">
                                    {Object.entries(productsByStore).map(([storeId, storeData]) => (
                                        <div key={storeId} className="border border-gray-200 rounded-2xl overflow-hidden">
                                            {/* Store Header */}
                                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                                                <div className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={storeSelections[storeId] || false}
                                                        onChange={() => toggleStoreSelection(parseInt(storeId))}
                                                        className="w-5 h-5 mr-3" 
                                                    />
                                                    <div className="flex items-center">
                                                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                                                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-800">{storeData.store.name}</h3>
                                                            <p className="text-sm text-gray-500">{storeData.store.location}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Store Products */}
                                            <div className="p-4 space-y-4">
                                                {storeData.products.map(product => (
                                                    <div key={product.id} className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-4 justify-between hover:shadow-md transition-shadow">
                                                        <div className="flex items-center">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={product.checked} 
                                                                onChange={() => toggleProductCheck(product.id)} 
                                                                className="w-4 h-4 mr-4" 
                                                            />
                                                            <img 
                                                                src={product.image} 
                                                                alt={product.name} 
                                                                className="w-16 h-16 rounded-lg object-cover mr-4" 
                                                            />
                                                            <div>
                                                                <h4 className="text-base font-semibold text-gray-800">{product.name}</h4>
                                                                <p className="text-sm text-gray-500">{product.desc}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex items-center border rounded-lg">
                                                                <button 
                                                                    onClick={() => updateQuantity(product.id, -1)} 
                                                                    className="px-3 py-1 text-lg hover:bg-gray-50"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="px-3 py-1 border-x">{product.qty}</span>
                                                                <button 
                                                                    onClick={() => updateQuantity(product.id, 1)} 
                                                                    className="px-3 py-1 text-lg hover:bg-gray-50"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                            <span className="text-base font-semibold w-24 text-right">
                                                                Rp. {product.price.toLocaleString('id-ID')}
                                                            </span>
                                                            <button 
                                                                onClick={() => removeProduct(product.id)} 
                                                                className="text-gray-400 hover:text-red-500 p-1"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
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
                            
                            {/* Ringkasan Total */}
                            <div className="bg-[#E64646] rounded-2xl shadow-lg p-8 text-white flex flex-col justify-between min-h-[260px]">
                                <div>
                                    <h2 className="text-lg font-semibold mb-4">Total Keranjang</h2>
                                    <div className="flex justify-between mb-2">
                                        <span>Subtotal:</span>
                                        <span>Rp. {subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span>Pengiriman:</span>
                                        <span>Gratis</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg mt-4">
                                        <span>Total:</span>
                                        <span>Rp. {subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    className="mt-8 bg-[#3E3E3E] text-white rounded-full py-3 font-semibold text-base hover:bg-gray-800 transition"
                                >
                                    Lanjut ke Pembayaran
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}