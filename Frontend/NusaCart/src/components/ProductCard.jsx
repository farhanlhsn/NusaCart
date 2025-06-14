import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    const originalPrice = product.price * 1.35;
    const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

    // Ambil gambar produk: imageUrl (string) atau imageUrls[0] (array)
    let imageSrc = null;
    if (product.imageUrl) {
        imageSrc = `http://localhost:6060${product.imageUrl}`;
    } else if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
        imageSrc = product.imageUrls[0].startsWith('http')
            ? product.imageUrls[0]
            : `http://localhost:6060${product.imageUrls[0]}`;
    }

    return (
        <div 
            onClick={() => navigate(`/product/${product.productId}`)}
            className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer flex flex-col transform hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]"
        >
            {/* Badge diskon */}
            {discount > 5 && (
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
                    />
                ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                        <svg className="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                
            </div>
            
            {/* Informasi produk */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-1">
                    <h3 className="text-base font-bold text-gray-800 line-clamp-2 leading-tight min-h-[2.5rem]">
                        {product.productName}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                        <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{product.tokoName || 'Toko Populer'}</span>
                    </div>
                </div>
                
                <div className="mt-auto">
                    <div className="mb-1">
                        <p className="text-xl font-bold text-[#E64646]">
                            Rp{product.price?.toLocaleString('id-ID')}
                        </p>
                        {discount > 5 && (
                            <p className="text-sm text-gray-400 line-through mt-1">
                                Rp{Math.floor(originalPrice)?.toLocaleString('id-ID')}
                            </p>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                            <div className="flex mr-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg 
                                        key={star} 
                                        className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                                        fill="currentColor" 
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                ))}
                            </div>
                            <span>4.8</span>
                        </div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{product.terjual || 0} terjual</span>
                    </div>
                    
                    {/* <button
                        className="w-full bg-gradient-to-r from-[#E64646] to-[#FF6B6B] text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 text-sm group-hover:from-[#FF6B6B] group-hover:to-[#E64646] transform group-hover:-translate-y-0.5 shadow-md group-hover:shadow-lg flex items-center justify-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.productId}`);
                        }}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Lihat Detail
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;