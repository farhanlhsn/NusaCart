import React from "react";
import { useNavigate } from "react-router-dom";

const generalCategories = [
    { value: 'ELEKTRONIK', label: 'Elektronik', icon: '📱', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
    { value: 'FURNITUR', label: 'Furnitur', icon: '🏠', color: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
    { value: 'PAKAIAN', label: 'Pakaian', icon: '👗', color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
    { value: 'MAKANAN_MINUMAN', label: 'Makanan & Minuman', icon: '🍕', color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
    { value: 'KESEHATAN_KECANTIKAN', label: 'Kesehatan & Kecantikan', icon: '💊', color: 'bg-gradient-to-r from-emerald-500 to-green-500' },
    { value: 'OLAHRAGA_OUTDOOR', label: 'Olahraga & Outdoor', icon: '⚽', color: 'bg-gradient-to-r from-red-500 to-orange-500' },
    { value: 'MAINAN_HOBI', label: 'Mainan & Hobi', icon: '🎨', color: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
    { value: 'RUMAH_TANGGA', label: 'Rumah Tangga', icon: '🏡', color: 'bg-gradient-to-r from-yellow-500 to-amber-500' },
    { value: 'PERHIASAN_AKSESORIS', label: 'Perhiasan & Aksesoris', icon: '💍', color: 'bg-gradient-to-r from-pink-400 to-yellow-400' },
    { value: 'OTOMOTIF', label: 'Otomotif', icon: '🚗', color: 'bg-gradient-to-r from-gray-500 to-slate-500' },
    { value: 'BUKU_ALAT_TULIS', label: 'Buku & Alat Tulis', icon: '📚', color: 'bg-gradient-to-r from-green-400 to-blue-400' },
    { value: 'LAINNYA', label: 'Lainnya', icon: '📦', color: 'bg-gradient-to-r from-gray-500 to-slate-500' }
];

export default function CategoriesListPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
                    <button onClick={() => navigate('/')} className="hover:underline text-indigo-600 font-medium">Beranda</button>
                    <span className="mx-2">|</span>
                    <span className="text-gray-800 font-semibold">Kategori</span>
                </nav>
                {/* End Breadcrumbs */}
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Semua Kategori</h1>
                <p className="text-gray-600 mb-8">Jelajahi berbagai kategori produk yang tersedia di NusaCart.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {generalCategories.map(category => (
                        <div key={category.value} className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-all">
                            <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center text-3xl mb-4 text-white`}>
                                {category.icon}
                            </div>
                            <div className="font-bold text-lg mb-2 text-gray-900">{category.label}</div>
                            <button
                                onClick={() => navigate(`/categories/${category.value}`)}
                                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow"
                            >
                                Lihat Produk
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 