import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../stores/cartStore";
import useAddressStore from "../stores/addressStore";
import useAuthStore from "../stores/authStore";
import AddressSelectionModal from "../components/AddressSelectionModal";

export default function CheckoutPage() {
    const navigate = useNavigate();
    
    // Zustand stores
    const { checkoutItems, updateCheckoutQuantity, clearCheckoutItems, createOrder } = useCartStore();
    const { addresses, fetchAddresses, loading: addressLoading } = useAddressStore();
    const { user, isLoggedIn } = useAuthStore();
    
    const [kuponCode, setKuponCode] = useState("");
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Group cart items by store
    const itemsByStore = checkoutItems.reduce((acc, item) => {
        const storeId = item.store?.id || 1;
        if (!acc[storeId]) {
            acc[storeId] = {
                store: item.store || { id: 1, name: "Nama Toko", location: "Jakarta" },
                items: []
            };
        }
        acc[storeId].items.push(item);
        return acc;
    }, {});

    // Calculate totals
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shippingCost = 0; // Free shipping
    const total = subtotal + shippingCost;

    // Initialize data and check authentication
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        
        if (checkoutItems.length === 0) {
            navigate('/cart');
            return;
        }
        
        fetchAddresses();
    }, [checkoutItems, isLoggedIn, navigate, fetchAddresses]);

    // Debug data
    useEffect(() => {
        console.log('Checkout items:', checkoutItems);
        console.log('Selected address:', selectedAddress);
    }, [checkoutItems, selectedAddress]);
    
    // Set default selected address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            const primaryAddress = addresses.find(addr => addr.isUtama) || addresses[0];
            setSelectedAddress(primaryAddress);
        }
    }, [addresses, selectedAddress]);

    const handleQuantityChange = (id, delta) => {
        updateCheckoutQuantity(id, delta);
    };

    const handleApplyKupon = () => {
        // Implementation for applying coupon code
        console.log("Applying coupon:", kuponCode);
    };

    const handleCreateOrder = async () => {
        if (!selectedAddress) {
            alert("Silakan pilih alamat pengiriman");
            return;
        }
        
        if (!selectedAddress.addressId) {
            alert("ID alamat tidak valid. Silakan pilih alamat lain.");
            return;
        }
        
        console.log('Selected Address:', selectedAddress);
        
        // Construct address string as required by backend
        const addressString = `${selectedAddress.jalan}, ${selectedAddress.kelurahan}, ${selectedAddress.kecamatan}, ${selectedAddress.kotaKabupaten}, ${selectedAddress.provinsi} ${selectedAddress.kodePos}`;
        
        const orderData = {
            address: addressString, // Required by backend validation
            addressId: selectedAddress.addressId,
            paymentMethodId: 1, // Default payment method ID - will be selected properly in payment page
            items: checkoutItems.map(item => ({
                productId: item.productId || item.id, // Use productId if available
                quantity: item.qty
            }))
        };
        
        console.log('Order Data being sent:', orderData);
        
        try {
            const result = await createOrder(orderData);
            console.log("Order created successfully:", result);
            
            // Navigate to payment page with order details
            navigate('/payment', { 
                state: { 
                    orderData: {
                        ...result,
                        orderId: result.orderId || result.id,
                        subtotal,
                        shippingCost,
                        total,
                        items: checkoutItems,
                        address: selectedAddress
                    }
                } 
            });
        } catch (error) {
            console.error("Failed to create order:", error);
            alert("Gagal membuat pesanan. Silakan coba lagi.");
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Breadcrumb */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <button 
                            onClick={() => navigate('/')}
                            className="hover:text-red-600 cursor-pointer transition-colors"
                        >
                            Beranda
                        </button>
                        <span>|</span>
                        <button 
                            onClick={() => navigate('/cart')}
                            className="hover:text-red-600 cursor-pointer transition-colors"
                        >
                            Keranjang
                        </button>
                        <span>|</span>
                        <span className="text-red-600 font-medium">Checkout</span>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Side - Shipping Address & Products */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">Alamat Pengiriman</h2>
                                    <button
                                        onClick={() => setShowAddressModal(true)}
                                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Ubah Alamat
                                    </button>
                                </div>
                                
                                {addressLoading ? (
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                    </div>
                                ) : selectedAddress ? (
                                    <div className="space-y-2">
                                        <p className="font-semibold text-gray-800">{selectedAddress.namaPenerima}</p>
                                        <p className="text-gray-600">{selectedAddress.phoneNumber}</p>
                                        <p className="text-gray-600">
                                            {selectedAddress.jalan}, {selectedAddress.kelurahan}, {selectedAddress.kecamatan}, {selectedAddress.kotaKabupaten}, {selectedAddress.provinsi} {selectedAddress.kodePos}
                                        </p>
                                        {selectedAddress.isUtama && (
                                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                Alamat Utama
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500 mb-2">Belum ada alamat pengiriman</p>
                                        <button
                                            onClick={() => setShowAddressModal(true)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            Tambah Alamat
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Product List */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                                <div className="space-y-6">
                                    {Object.entries(itemsByStore).map(([storeId, storeData]) => (
                                        <div key={storeId} className="border border-gray-200 rounded-xl overflow-hidden">
                                            {/* Store Header */}
                                            <div className="bg-gray-50 p-4 border-b border-gray-200">
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 bg-gray-800 rounded mr-3 flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg font-bold text-gray-800">{storeData.store.name}</h2>
                                                        <p className="text-sm text-gray-500">{storeData.store.location}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Store Items */}
                                            <div className="p-4 space-y-4">
                                                {storeData.items.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                        <div className="flex items-center">
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name}
                                                                className="w-16 h-16 rounded-lg object-cover mr-4"
                                                            />
                                                            <div>
                                                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-4">
                                                            <span className="text-lg font-bold">Rp. {item.price.toLocaleString('id-ID')}</span>
                                                            <div className="flex items-center border rounded-lg">
                                                                <button 
                                                                    onClick={() => handleQuantityChange(item.id, -1)}
                                                                    className="px-3 py-1 text-lg hover:bg-gray-100"
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="px-3 py-1 border-x">{item.qty}</span>
                                                                <button 
                                                                    onClick={() => handleQuantityChange(item.id, 1)}
                                                                    className="px-3 py-1 text-lg hover:bg-gray-100"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Summary */}
                        <div className="space-y-6">
                            {/* Coupon Code */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Kode Promo</h2>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Masukkan kode kupon"
                                        value={kuponCode}
                                        onChange={(e) => setKuponCode(e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                    <button
                                        onClick={handleApplyKupon}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Terapkan
                                    </button>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>Rp. {subtotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Biaya Pengiriman:</span>
                                        <span>Gratis</span>
                                    </div>
                                    <hr className="my-3" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total:</span>
                                        <span>Rp. {total.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateOrder}
                                    className="w-full mt-6 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Lanjut ke Pembayaran
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Selection Modal */}
            <AddressSelectionModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSelectAddress={setSelectedAddress}
                selectedAddressId={selectedAddress?.addressId}
            />
        </div>
    );
}