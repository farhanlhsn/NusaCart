import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EditProfile from "../components/EditProfile";
import useAuthStore from "../stores/authStore";	
import AddressList from "../components/AddressList";
import SellerRegistrationModal from "../components/SellerRegistrationModal";

const PlaceholderContent = ({ title }) => (
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-2xl shadow-inner">
        <div className="text-center p-10">
            <h2 className="text-2xl font-semibold text-gray-700">{title}</h2>
            <p className="text-gray-500 mt-2">Fitur ini sedang dalam pengembangan.</p>
        </div>
    </div>
);


export default function Profile() {
    const navigate = useNavigate();
    const { user, logout, isLoggedIn, login } = useAuthStore();
    const [activeMenu, setActiveMenu] = useState('profile');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showSellerModal, setShowSellerModal] = useState(false);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    const menuItems = [
        { id: 'profile', label: 'Profil Saya' },
        { id: 'address', label: 'Daftar Alamat' },
        { id: 'payment', label: 'Metode Pembayaran' },
        { id: 'cart', label: 'Keranjang Saya' },
        { id: 'wishlist', label: 'Wishlist Saya' }
    ];

    const getMenuLabel = (menuId) => menuItems.find(item => item.id === menuId)?.label || 'Profil Saya';

    const handleLogout = async () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            setIsLoggingOut(true);
            try {
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

    const hasSellerRole = user?.role?.includes('SELLER');

    const renderContent = () => {
        switch (activeMenu) {
            case 'profile':
                return <EditProfile />;
            case 'address':
                return <AddressList />;
            case 'payment':
                return <PlaceholderContent title="Metode Pembayaran" />;
            case 'cart':
                return <PlaceholderContent title="Keranjang Saya" />;
            case 'wishlist':
                return <PlaceholderContent title="Wishlist Saya" />;
            default:
                return <EditProfile />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="ml-6 mr-6 mt-3">
                    <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <button onClick={() => navigate('/')} className="hover:text-red-600 cursor-pointer transition-colors">Beranda</button>
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
                                            if (item.id === 'payment') {
                                                alert('Fitur ini masih dalam pengembangan.');
                                                return;
                                            }
                                            setActiveMenu(item.id);
                                        }}
                                        className={`w-full text-left px-8 rounded ${ activeMenu === item.id ? 'text-red-500 font-semibold' : 'text-gray-400 hover:text-gray-800' } ${ item.id === 'payment' ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        
                        <h3 className="text-lg font-semibold mb-1">Pesanan Saya</h3>
                        <ul className="space-y-3 mb-3">
                            {menuItems.slice(3, 5).map((item) => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => setActiveMenu(item.id)}
                                        className={`w-full text-left px-8 rounded ${activeMenu === item.id ? 'text-red-500 font-semibold' : 'text-gray-400 hover:text-gray-800'}`}
                                    >
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {hasSellerRole ? (
                            <button onClick={() => navigate('/seller')} className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                Pergi ke Toko
                            </button>
                        ) : (
                            <button onClick={() => setShowSellerModal(true)} className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 mb-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                Buat Toko
                            </button>
                        )}

                        <button onClick={handleLogout} disabled={isLoggingOut} className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${ isLoggingOut ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600' } text-white`}>
                            {isLoggingOut ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>}
                            {isLoggingOut ? 'Keluar...' : 'Logout'}
                        </button>
                    </div>

                    {/* Main Content (now dynamic) */}
                    <div className="flex-1 p-6 bg-gray-50">
                        {renderContent()}
                    </div>
                </div>
            </div>

            <SellerRegistrationModal show={showSellerModal} onClose={() => setShowSellerModal(false)} />
        </div>
    );
}