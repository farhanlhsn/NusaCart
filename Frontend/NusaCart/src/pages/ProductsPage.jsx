import React, { useEffect } from "react";
import useProductStore from "../stores/productStore";
import ProductCard from "../components/ProductCard";

export default function ProductsPage() {
  const { products, loading, error, fetchProducts, currentPage, totalPages, pageSize, totalItems } = useProductStore();

  useEffect(() => {
    fetchProducts(currentPage - 1, pageSize);
    // eslint-disable-next-line
  }, [currentPage, pageSize]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page - 1, pageSize);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Semua Produk</h1>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
            <span className="ml-4 text-gray-600 text-lg">Memuat produk...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-20">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <p className="text-gray-500">Belum ada produk tersedia.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.productId || product.id} product={product} />
                  ))}
                </div>
                {/* Pagination Info & Controls */}
                <div className="flex flex-col md:flex-row items-center justify-between mt-8 gap-4">
                  <div className="text-gray-500 text-sm">
                    {`Menampilkan data ${(currentPage-1)*pageSize+1} hingga ${Math.min(currentPage*pageSize, totalItems)} dari ${totalItems} entri`}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      &lt;
                    </button>
                    {Array.from({length: totalPages}, (_, i) => i+1).slice(Math.max(0, currentPage-3), currentPage+2).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded border ${currentPage === page ? 'bg-red-500 text-white' : 'hover:bg-gray-100'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
} 