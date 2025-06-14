import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ isValid }) => {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";
  if (isValid) {
    return (
      <span className={`${baseClasses} bg-green-100 text-green-800`}>
        Aktif
      </span>
    );
  }
  return (
    <span className={`${baseClasses} bg-red-100 text-red-800`}>
      Tidak Aktif
    </span>
  );
};

/**
 * Komponen untuk baris tabel skeleton saat data sedang dimuat.
 */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="p-4 border-b border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </td>
    <td className="p-4 border-b border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
    </td>
    <td className="p-4 border-b border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </td>
    <td className="p-4 border-b border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </td>
    <td className="p-4 border-b border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </td>
    <td className="p-4 border-b border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </td>
  </tr>
);

/**
 * Komponen untuk menampilkan pesan error dengan gaya yang lebih baik.
 * @param {{ message: string }} props
 */
const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border-l-4 border-red-400 p-4" role="alert">
    <div className="flex">
      <div className="py-1">
        {/* SVG Icon for alert */}
        <svg className="h-6 w-6 text-red-400 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-red-800">Terjadi Kesalahan</p>
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  </div>
);


// --- Main Component (Komponen Utama) ---

export default function PromoListPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/api/discounts");
        const sortedPromos = [...(res.data.data || [])].sort((a, b) => {
          const dateA = new Date(a.validUntil).getTime();
          const dateB = new Date(b.validUntil).getTime();
          return dateA - dateB;
        });
        setPromos(sortedPromos);
      } catch (err) {
        setError(err.response?.data?.message || "Gagal memuat daftar promo.");
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const handleCopy = (promoCode) => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(promoCode);
    setTimeout(() => setCopiedCode(null), 2000); // Reset afrer 2 seconds
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />);
    }
    
    if (promos.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center py-10 text-gray-500">
            <p className="text-lg">Belum ada promo yang tersedia.</p>
            <p className="text-sm">Silakan cek kembali nanti.</p>
          </td>
        </tr>
      );
    }

    return promos.map((promo) => (
      <tr key={promo.promoCode} className="hover:bg-gray-50 transition-colors">
        <td className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-indigo-600 font-semibold">{promo.promoCode}</span>
            <button
              onClick={() => handleCopy(promo.promoCode)}
              className="p-1 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              title="Salin kode"
            >
              {copiedCode === promo.promoCode ? (
                // Checkmark Icon
                <svg className="h-4 w-4 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                // Copy Icon
                <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </td>
        <td className="p-4 border-b border-gray-200 text-sm text-gray-600">{promo.description}</td>
        <td className="p-4 border-b border-gray-200 text-center font-medium text-gray-800">{promo.discountPercentage}%</td>
        <td className="p-4 border-b border-gray-200 text-sm text-gray-600">{formatDate(promo.validUntil)}</td>
        <td className="p-4 border-b border-gray-200 text-center text-sm text-gray-600">{promo.usageLimit ?? 'Tak Terbatas'}</td>
        <td className="p-4 border-b border-gray-200 text-center">
          <StatusBadge isValid={promo.valid} />
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Breadcrumb */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-red-600 cursor-pointer transition-colors"
            >
              Beranda
            </button>
            <span>|</span>
            <span className="text-red-600 font-medium">Promo</span>
          </div>
        </div>
        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Daftar Promo</h1>
            <p className="mt-1 text-md text-gray-600">
              Gunakan kode promo berikut untuk mendapatkan diskon spesial.
            </p>
          </header>
          {error && <ErrorMessage message={error} />}
          {!error && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Promo</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                      <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Diskon</th>
                      <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berlaku Hingga</th>
                      <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Batas Pakai</th>
                      <th className="p-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {renderContent()}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}