import React, { useState } from "react";
import EditProfile from "../components/EditProfile";
import useAuthStore from "../stores/authStore";	


export default function Profile() {
    const { user } = useAuthStore();
    const [showEditProfile, setShowEditProfile] = useState(true);
    const [activeMenu, setActiveMenu] = useState('profile');

    const menuItems = [
        { id: 'profile', label: 'Profil Saya', active: true },
        { id: 'address', label: 'Daftar Alamat', active: false },
        { id: 'payment', label: 'Metode Pembayaran', active: false },
        { id: 'cart', label: 'Keranjang Saya', active: false },
        { id: 'wishlist', label: 'Wishlist Saya', active: false }
    ];

    // Function to get label by id
    const getMenuLabel = (menuId) => {
        const menuItem = menuItems.find(item => item.id === menuId);
        return menuItem ? menuItem.label : 'Profil Saya';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">

            {/* Main Container with rounded and shadow */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="ml-6 mr-6 mt-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <span>Beranda</span>
                            <span>|</span>
                            <span>Akun Saya</span>
                            <span>|</span>
                            <span className="text-black">{getMenuLabel(activeMenu)}</span>
                        </div>
                        <div className="text-black">
                            Selamat Datang! <span className="text-red-500">{user?.name || 'User'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex">
                    {/* Sidebar */}
                    <div className="w-80 bg-white p-6 ">
                        <h3 className="text-lg font-semibold mb-1">Kelola Akun Saya</h3>
                        <ul className="space-y-3 mb-2">
                            {menuItems.slice(0, 3).map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            setActiveMenu(item.id);
                                            if (item.id === 'profile') {
                                                setShowEditProfile(true);
                                            }
                                        }}
                                        className={`w-full text-left px-8 rounded ${
                                            activeMenu === item.id ? 'text-red-500 font-small' : 'text-gray-400 hover:text-gray-800'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        
                        <h3 className="text-lg font-semibold mb-1">Keranjang Saya</h3>
                        <ul className="space-y-3 mb-3">
                            {menuItems.slice(3).map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveMenu(item.id)}
                                        className={`w-full text-left px-8 rounded ${
                                            activeMenu === item.id ? 'text-red-500 font-small' : 'text-gray-400 hover:text-gray-800'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <button className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Buat Toko
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6">
                        <EditProfile onClose={() => setShowEditProfile(false)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
