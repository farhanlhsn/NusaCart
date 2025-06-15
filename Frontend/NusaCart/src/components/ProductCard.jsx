import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductRating from './ProductRating';
import ChatButton from './ChatButton';

const ProductCard = ({ product, disabled = false, onAddToCart, onToggleWishlist }) => {
    const navigate = useNavigate();

    // Validate product data
    if (!product || !product.productId) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('ProductCard: Invalid product data', product);
        }
        return null;
    }

    const handleProductClick = () => {
        if (disabled || !product.isActive) return;
        if (product.productId) {
            navigate(`/product/${product.productId}`);
        } else {
            console.error('ProductCard: Missing productId for navigation');
        }
    };

    const originalPrice = product.price * 1.35;
    const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

    // Ambil gambar produk: imageUrl (string) atau imageUrls[0] (array)
    let imageSrc = null;
    
    // Debug log untuk melihat data gambar (hanya untuk produk pertama)
    if (process.env.NODE_ENV === 'development' && product.productId && product.productId <= 3) {
        console.log(`ProductCard ${product.productId}:`, {
            imageUrl: product.imageUrl,
            imageUrls: product.imageUrls,
            hasImageUrls: product.imageUrls && product.imageUrls.length > 0,
            terjual: product.terjual // Debug data terjual
        });
    }
    
    if (product.imageUrl) {
        imageSrc = product.imageUrl.startsWith('http') 
            ? product.imageUrl 
            : `http://localhost:6060${product.imageUrl}`;
    } else if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
        const firstImage = product.imageUrls[0];
        if (firstImage) {
            imageSrc = firstImage.startsWith('http')
                ? firstImage
                : `http://localhost:6060${firstImage}`;
        }
    }

    return (
        <div 
            onClick={handleProductClick}
            className={`group relative bg-white rounded-2xl shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full ${
                disabled || !product.isActive 
                    ? 'cursor-not-allowed opacity-75' 
                    : 'cursor-pointer hover:shadow-2xl transform hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]'
            } shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]`}
        >
            {/* Badge diskon atau status tidak tersedia */}
            {!product.isActive ? (
                <div className="absolute top-3 left-3 z-10">
                    <div className="bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        Tidak Tersedia
                    </div>
                </div>
            ) : discount > 5 && (
                <div className="absolute top-3 left-3 z-10">
                    <div className="bg-gradient-to-r from-[#E64646] to-[#FF6B6B] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                        <span className="mr-1">-{discount}%</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>
            )}
            
            {/* Gambar produk */}
            <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                {imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={product.productName}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            console.log(`Failed to load image: ${imageSrc}`);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={() => {
                            if (process.env.NODE_ENV === 'development') {
                                console.log(`Successfully loaded image: ${imageSrc}`);
                            }
                        }}
                    />
                ) : null}
                <div 
                    className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400"
                    style={{ display: imageSrc ? 'none' : 'flex' }}
                >
                    <svg className="w-14 h-14 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-center px-2">Tidak ada gambar</span>
                </div>
            </div>
            
            {/* Informasi produk */}
            <div className="p-4 sm:p-5 flex flex-col flex-grow">
                {/* Nama produk */}
                <div className="mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-gray-800 line-clamp-2 leading-tight min-h-[2.5rem] mb-2">
                        {product.productName}
                    </h3>
                    
                    {/* Info toko dan chat button */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center flex-1 min-w-0 mr-2">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <button 
                                className="truncate hover:text-red-600 transition-colors text-left"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/toko/${product.idToko}`);
                                }}
                            >
                                {product.tokoName || 'Toko Populer'}
                            </button>
                        </div>
                        <ChatButton
                            storeId={product.idToko}
                            storeName={product.tokoName}
                            variant="ghost"
                            size="small"
                            className="!p-1 flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span className="sr-only">Chat</span>
                        </ChatButton>
                    </div>
                </div>
                
                {/* Bagian bawah - harga, rating, terjual */}
                <div className="mt-auto space-y-3">
                    {/* Harga */}
                    <div>
                        <p className="text-lg sm:text-xl font-bold text-[#E64646]">
                            Rp{product.price?.toLocaleString('id-ID')}
                        </p>
                        {discount > 5 && (
                            <p className="text-xs sm:text-sm text-gray-400 line-through mt-1">
                                Rp{Math.floor(originalPrice)?.toLocaleString('id-ID')}
                            </p>
                        )}
                    </div>
                    
                    {/* Rating dan Terjual - Layout responsif */}
                    <div className="space-y-2">
                        {/* Rating */}
                        <div className="flex items-center">
                            <ProductRating 
                                productId={product.productId} 
                                showReviewCount={true}
                                size="sm"
                            />
                        </div>
                        
                        {/* Terjual */}
                        <div className="flex justify-end">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                                {product.terjual || 0} terjual
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;