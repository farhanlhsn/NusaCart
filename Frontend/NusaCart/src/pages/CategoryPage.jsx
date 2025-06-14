import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useProductStore from "../stores/productStore";
import ProductCard from "../components/ProductCard";

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

export default function CategoryPage() {
    const { categoryValue } = useParams();
    const navigate = useNavigate();
    const { products, loading, error, fetchProductsWithFilters } = useProductStore();

    const category = generalCategories.find(cat => cat.value === categoryValue);

    useEffect(() => {
        if (categoryValue) {
            fetchProductsWithFilters(0, 20, { generalCategory: categoryValue });
        }
    }, [categoryValue, fetchProductsWithFilters]);

    if (!category) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Kategori tidak ditemukan</h2>
                <button onClick={() => navigate('/categories')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-md">
                    Kembali ke Daftar Kategori
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                    <button onClick={() => navigate('/')} className="hover:text-red-600 cursor-pointer transition-colors">Beranda</button>
                    <span>|</span>
                    <button onClick={() => navigate('/categories')} className="hover:text-red-600 cursor-pointer transition-colors">Kategori</button>
                    <span>|</span>
                    <span className="text-red-600 font-medium">{category.label}</span>
                </div>
                {/* End Breadcrumbs */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center text-3xl text-white`}>
                        {category.icon}
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">{category.label}</h1>
                        <p className="text-gray-600">Lihat produk-produk terbaik di kategori {category.label}.</p>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                        <span className="ml-4 text-gray-600 text-lg">Memuat produk...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-600 font-semibold">{error}</p>
                    </div>
                ) : (
                    <>
                        {products.length === 0 ? (
                            <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
                                <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="mt-6 text-2xl font-bold text-gray-800">Belum Ada Produk di Kategori Ini</h3>
                                <p className="mt-2 text-gray-600 max-w-md mx-auto">Saat ini belum ada produk di kategori {category.label}. Silakan cek kembali nanti.</p>
                                <button onClick={() => navigate('/products')} className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-md">
                                    Lihat Semua Produk
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {products.map(product => (
                                    <ProductCard key={product.productId} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 