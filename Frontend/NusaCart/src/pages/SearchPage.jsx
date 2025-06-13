import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ChatButton from "../components/ChatButton";
import useSearchStore from "../stores/searchStore";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SearchPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const searchName = query.get("name") || "";
  const { results, stores, loading, error, fetchSearchResults, setDummy } = useSearchStore();

  useEffect(() => {
    if (!searchName) {
      return;
    }
    fetchSearchResults(searchName);
  }, [searchName, fetchSearchResults]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black p-2 rounded-full border border-gray-200 bg-white shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Hasil Pencarian untuk: <span className="text-indigo-600">{searchName}</span></h1>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            <span className="ml-4 text-gray-600 text-lg">Mencari...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 font-semibold">{error}</p>
          </div>
        ) : (
          <>
            {/* Hasil Toko */}
            {stores.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Toko Terkait</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {stores.map(store => (
                    <div key={store.id} className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg transition-all">
                      <img src={store.image} alt={store.name} className="w-16 h-16 rounded-full object-cover mb-2" />
                      <div className="font-bold text-gray-800 text-center mb-3">{store.name}</div>
                      <ChatButton
                        storeId={store.id}
                        storeName={store.name}
                        variant="secondary"
                        size="small"
                        className="w-full"
                      >
                        Chat
                      </ChatButton>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Hasil Produk */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Produk</h2>
            {console.log('results', results)}
            {results.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <p className="text-gray-500">Tidak ada produk ditemukan untuk kata kunci tersebut.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {results.map(product => (
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