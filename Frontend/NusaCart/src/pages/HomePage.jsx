import React, { useEffect, useRef } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import useProductStore from "../stores/productStore";

export default function HomePage() {
    const navigate = useNavigate();
    const bannerRef = useRef(null);
    const [showBanner, setShowBanner] = React.useState(false);
    const { products, loading, error, fetchProducts } = useProductStore();

    const categories = [
        { name: "Fashion", icon: "👗", color: "bg-gradient-to-r from-pink-500 to-rose-500" },
        { name: "Elektronik", icon: "📱", color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
        { name: "Makanan", icon: "🍕", color: "bg-gradient-to-r from-amber-500 to-orange-500" },
        { name: "Kesehatan", icon: "💊", color: "bg-gradient-to-r from-emerald-500 to-green-500" },
        { name: "Olahraga", icon: "⚽", color: "bg-gradient-to-r from-red-500 to-orange-500" },
        { name: "Hobi", icon: "🎨", color: "bg-gradient-to-r from-purple-500 to-indigo-500" },
        { name: "Rumah", icon: "🏠", color: "bg-gradient-to-r from-yellow-500 to-amber-500" },
        { name: "Lainnya", icon: "📦", color: "bg-gradient-to-r from-gray-500 to-slate-500" }
    ];

    // Gambar contoh untuk hero section
    const heroImages = [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    ];

    useEffect(() => {
        setShowBanner(true);
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="py-10 md:py-16 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 transform rotate-6 scale-125"></div>
                    <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                                Temukan Produk Terbaik <br />
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Harga Terjangkau
                                </span>
                            </h1>
                            <p className="mt-6 text-xl text-gray-600 max-w-xl mx-auto md:mx-0">
                                Belanja mudah dan cepat dengan penawaran spesial setiap hari. Gratis ongkir tanpa minimum pembelian!
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button 
                                    onClick={() => navigate('/products')}
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
                                >
                                    Mulai Belanja
                                </button>
                                <button 
                                    onClick={() => window.scrollTo({top: document.querySelector('#categories').offsetTop - 100, behavior: 'smooth'})}
                                    className="px-8 py-4 bg-white text-gray-900 font-bold border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
                                >
                                    Lihat Kategori
                                </button>
                            </div>
                        </div>
                        <div className="md:w-1/2 flex justify-center relative">
                            <div className="relative w-full max-w-md">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
                                <div className="relative grid grid-cols-2 gap-4">
                                    {heroImages.map((src, i) => (
                                        <div
                                            key={i}
                                            className={`bg-white rounded-2xl p-4 shadow-lg transform transition-all duration-500 hover:scale-105 ${i === 0 ? 'rotate-3' : i === 1 ? '-rotate-3' : i === 2 ? '-rotate-2' : 'rotate-2'}`}
                                        >
                                            <img src={src} alt={`Hero Produk ${i+1}`} className="rounded-xl w-full h-40 object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Access Categories Section */}
                <section id="categories" className="py-2">
                    <div className="flex items-center justify-between m-3">
                        <h2 className="text-3xl font-extrabold text-gray-900">Jelajahi Kategori</h2>
                        <button 
                            onClick={() => navigate('/categories')}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center transition-colors group"
                        >
                            Lihat Semua Kategori
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                onClick={() => navigate(`/category/${category.name.toLowerCase()}`)}
                                className="group flex flex-col items-center p-4 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform text-white`}>
                                    {category.icon}
                                </div>
                                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-gray-900 group-hover:font-bold transition-all">
                                    {category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Promo Banner Section */}
                <section ref={bannerRef} className={`py-8 transition-opacity duration-700 ${showBanner ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <div className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold mb-4 animate-pulse">
                                    PROMO AKHIR SEMESTER
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold mb-2">Diskon Hingga 80%!</h3>
                                <p className="text-lg opacity-90 mb-6 max-w-xl">Nikmati diskon spesial dan gratis ongkir tanpa minimum belanja. Berakhir 31 July.</p>
                                <button 
                                    onClick={() => navigate('/promo')}
                                    className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
                                >
                                    Klaim Promo Sekarang
                                </button>
                            </div>
                            <div className="flex items-center justify-center">
                                <div className="relative">
                                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white/20 rounded-full flex items-center justify-center">
                                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/30 rounded-full flex items-center justify-center">
                                            <div className="w-16 h-16 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-4xl md:text-5xl">
                                                🎁
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -top-4 -right-4 animate-bounce">
                                        <div className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm">HOT</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Products Section */}
                <section className="py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">Rekomendasi Untukmu</h2>
                        </div>
                        <button 
                            onClick={() => navigate('/products')}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center transition-colors group"
                        >
                            Lihat Semua Produk
                            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    {loading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                                    <div className="bg-gray-200 border-2 border-dashed rounded-t-2xl w-full h-48" />
                                    <div className="p-4">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-16 bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-2xl shadow-sm">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-xl font-bold text-red-800">{error}</h3>
                            <p className="mt-2 text-red-600 max-w-md mx-auto">Terjadi kesalahan saat mengambil data produk. Silakan coba beberapa saat lagi.</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-8 bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg font-semibold"
                            >
                                Muat Ulang Halaman
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {products.length === 0 ? (
                                <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
                                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
                                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-2xl font-bold text-gray-800">Belum Ada Produk Tersedia</h3>
                                    <p className="mt-2 text-gray-600 max-w-md mx-auto">Saat ini belum ada produk yang tersedia. Kami akan segera menambahkan produk terbaru.</p>
                                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                        <button 
                                            onClick={() => navigate('/')}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-md"
                                        >
                                            Kembali ke Beranda
                                        </button>
                                        <button 
                                            onClick={() => window.location.reload()}
                                            className="px-6 py-3 bg-white text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                                        >
                                            Coba Lagi
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {products.slice(0, 5).map(product => (
                                        <ProductCard key={product.productId} product={product} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}