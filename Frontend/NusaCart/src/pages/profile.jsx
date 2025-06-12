import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditProfile from "../components/EditProfile";
import useAuthStore from "../stores/authStore";	


export default function Profile() {
    const navigate = useNavigate();
    const { user, logout, isLoggedIn } = useAuthStore();
    const [showEditProfile, setShowEditProfile] = useState(true);
    const [activeMenu, setActiveMenu] = useState('profile');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

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

    // Handle logout
    const handleLogout = async () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            setIsLoggingOut(true);
            try {
                // Add a small delay to show loading state
                await new Promise(resolve => setTimeout(resolve, 500));
                logout();
                navigate('/login');
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                setIsLoggingOut(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">

            {/* Main Container with rounded and shadow */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="ml-6 mr-6 mt-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <button 
                                onClick={() => navigate('/')}
                                className="hover:text-red-600 cursor-pointer transition-colors"
                            >
                                Beranda
                            </button>
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

                        <button className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 mb-3">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Buat Toko
                        </button>

                        <button 
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                isLoggingOut 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-gray-500 hover:bg-gray-600'
                            } text-white`}
                        >
                            {isLoggingOut ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            )}
                            {isLoggingOut ? 'Keluar...' : 'Logout'}
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
