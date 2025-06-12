import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../stores/cartStore";

export default function CheckoutPage() {
    const navigate = useNavigate();
    
    // Zustand store
    const { checkoutItems, updateQuantity, clearCheckoutItems, createOrder } = useCartStore();
    
    const [kuponCode, setKuponCode] = useState("");
    const [selectedPayment, setSelectedPayment] = useState("");
    
    // Shipping address data (you can make this editable)
    const [shippingAddress, setShippingAddress] = useState({
        name: "Nama User",
        phone: "081234567890",
        address: "Jl. Telekomunikasi No.1, Sukapura, Kec. Dayeuhkolot, Kabupaten Bandung, Jawa Barat 40267"
    });

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

    // Redirect to cart if no checkout items
    useEffect(() => {
        if (checkoutItems.length === 0) {
            navigate('/cart');
        }
    }, [checkoutItems, navigate]);

    const handleQuantityChange = (id, delta) => {
        updateQuantity(id, delta);
    };

    const handleApplyKupon = () => {
        // Implementation for applying coupon code
        console.log("Applying coupon:", kuponCode);
    };

    const handleCreateOrder = async () => {
        if (!selectedPayment) {
            alert("Silakan pilih metode pembayaran");
            return;
        }
        
        const orderData = {
            shippingAddress,
            paymentMethod: selectedPayment,
            addressId: 1, // Default address ID - should be dynamic based on user's addresses
            address: shippingAddress.address
        };
        
        try {
            const result = await createOrder(orderData);
            console.log("Order created successfully:", result);
            
            // Navigate to success page or process payment
            alert("Pesanan berhasil dibuat!");
            navigate('/cart'); // Redirect back to cart
        } catch (error) {
            console.error("Failed to create order:", error);
            alert("Gagal membuat pesanan. Silakan coba lagi.");
        }
    };

    const paymentMethods = [
        {
            id: "mandiri",
            name: "Mandiri",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/2560px-Bank_Mandiri_logo_2016.svg.png"
        },
        {
            id: "bca",
            name: "BCA", 
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/2560px-Bank_Central_Asia.svg.png"
        },
        {
            id: "bri",
            name: "BRI",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/BRI_2020.svg/2560px-BRI_2020.svg.png"
        },
        {
            id: "qris",
            name: "QRIS",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/QRIS_logo.svg/2560px-QRIS_logo.svg.png"
        },
        {
            id: "dana",
            name: "E-Wallet",
            logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/2560px-Logo_dana_blue.svg.png"
        }
    ];

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
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Alamat Pengiriman</h2>
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-800">Rumah - {shippingAddress.name}</p>
                                    <p className="text-gray-600">{shippingAddress.phone}</p>
                                    <p className="text-gray-600">{shippingAddress.address}</p>
                                </div>
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

                        {/* Right Side - Payment & Summary */}
                        <div className="space-y-6">
                            {/* Payment Methods */}
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Metode Pembayaran</h2>
                                <div className="space-y-4">
                                    {paymentMethods.map(method => (
                                        <label 
                                            key={method.id} 
                                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={method.id}
                                                    checked={selectedPayment === method.id}
                                                    onChange={(e) => setSelectedPayment(e.target.value)}
                                                    className="mr-3"
                                                />
                                                <span className="font-medium">{method.name}</span>
                                            </div>
                                            <img 
                                                src={method.logo} 
                                                alt={method.name}
                                                className="h-8 w-auto object-contain"
                                            />
                                        </label>
                                    ))}
                                </div>

                                {/* Coupon Code */}
                                <div className="mt-6">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Kode Kupon"
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
                                    Buat Pesanan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}