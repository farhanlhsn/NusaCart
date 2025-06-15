import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useOrderStore from '../stores/orderStore';
import useTrackingStore from '../stores/trackingStore';
import useAuthStore from '../stores/authStore';
import useReviewStore from '../stores/reviewStore';

const PackageIcon = () => (
  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
);
const StoreIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
);
const CheckCircleIcon = (props) => (
  <svg {...props} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
);


const OrderHistoryPage = () => {
  const { orders, loading, error, fetchOrders } = useOrderStore();
  const { fetchTrackingByOrder, loading: trackingLoading } = useTrackingStore();
  const { hasUserReviewedProduct, fetchReviewsByProduct } = useReviewStore();
  const navigate = useNavigate();
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTracking, setShowTracking] = useState(false);
  const [showReviewSelection, setShowReviewSelection] = useState(false);

  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.userId) {
      fetchOrders();
    } else if (user === null) {
      navigate('/login');
    }
  }, [user, fetchOrders, navigate]);

  useEffect(() => {
    if (orders && orders.length > 0 && user?.userId) {
      const deliveredOrders = orders.filter(order => order.orderStatus === 'DELIVERED');
      deliveredOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.productId) {
            fetchReviewsByProduct(item.productId);
          }
        });
      });
    }
  }, [orders, user?.userId, fetchReviewsByProduct]);

  const sortedOrders = orders ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  const handleViewTracking = async (order) => {
    setSelectedOrder(order);
    setShowTracking(true);
    await fetchTrackingByOrder(order.id);
  };

  const handleReviewProduct = (item) => {
    if (item.productId) {
      navigate(`/product/${item.productId}`);
    } else if (item.productName) {
      navigate(`/search?name=${encodeURIComponent(item.productName)}`);
    } else {
      navigate('/products');
      alert('Silakan cari produk secara manual untuk menulis ulasan');
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status) => {
    // Diganti dengan warna yang lebih modern dan konsisten
    switch (status?.toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-sky-100 text-sky-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': case 'cancelled': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const hasUnreviewedProducts = (order) => {
    if (!order.items || !user?.userId) return false;
    return order.items.some(item => item.productId && !hasUserReviewedProduct(item.productId, user.userId));
  };

  const getUnreviewedProductsCount = (order) => {
    if (!order.items || !user?.userId) return 0;
    return order.items.filter(item => item.productId && !hasUserReviewedProduct(item.productId, user.userId)).length;
  };

  if (!user) return null; // Akan redirect ke login

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-rose-600 text-xl mb-4">{error}</p>
          <button onClick={() => fetchOrders()} className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs - Didesain ulang agar lebih bersih */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-8">
          <button onClick={() => navigate('/')} className="flex items-center hover:text-red-600 transition-colors">
            Beranda
          </button>
          <span>|</span>
          <button onClick={() => navigate('/profile')} className="flex items-center hover:text-red-600 transition-colors">
            Profil
          </button>
          <span>|</span>
          <span className="font-medium text-slate-700">Riwayat Pesanan</span>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Riwayat Pesanan Anda</h1>
          <p className="text-slate-600 mt-3 text-lg">Lihat detail, lacak pengiriman, dan berikan ulasan untuk semua pesanan Anda di sini.</p>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md border border-slate-200">
            <PackageIcon />
            <h3 className="text-2xl font-bold text-slate-900 mt-6 mb-2">Anda Belum Memiliki Pesanan</h3>
            <p className="text-slate-600 max-w-md mx-auto mb-8">
              Semua pesanan yang Anda buat akan muncul di halaman ini. Mari mulai berbelanja!
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 font-semibold text-base transition-transform transform hover:scale-105"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedOrders.map((order, orderIndex) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg transition-shadow hover:shadow-2xl border border-slate-200/80 overflow-hidden">
                {/* Bagian Header Kartu Pesanan */}
                <div className="bg-slate-50/70 p-4 sm:p-6 border-b border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Pesanan #{sortedOrders.length - orderIndex}</h3>
                      <p className="text-xs text-slate-500 mt-1">ID: {order.id}</p>
                      <p className="text-sm text-slate-600">Dipesan pada: {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>{order.orderStatus}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>Pembayaran: {order.paymentStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Bagian utama Kartu Pesanan, dipisahkan untuk item dan summary */}
                <div className="divide-y divide-slate-200">
                  {/* Daftar Item */}
                  <div className="p-4 sm:p-6">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                                                 <div key={index} className="flex items-start space-x-4">
                                                         {/* Gambar Produk */}
                             <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-md overflow-hidden">
                               {item.imageUrl ? (
                                 <img
                                   src={item.imageUrl.startsWith('http') 
                                     ? item.imageUrl 
                                     : `http://localhost:6060${item.imageUrl}`}
                                   alt={item.productName}
                                   className="w-full h-full object-cover"
                                   onError={(e) => {
                                     e.target.style.display = 'none';
                                     e.target.nextSibling.style.display = 'flex';
                                   }}
                                 />
                               ) : null}
                               <div 
                                 className="w-full h-full bg-slate-100 flex items-center justify-center"
                                 style={{ display: item.imageUrl ? 'none' : 'flex' }}
                               >
                                 <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                                 </svg>
                               </div>
                             </div>
                          <div className="flex-grow">
                            <p className="font-semibold text-slate-800">{item.productName}</p>
                            {item.storeName && <p className="text-xs text-slate-500 mt-0.5 flex items-center"><StoreIcon /> {item.storeName}</p>}
                            <p className="text-sm text-slate-600 mt-1">{item.quantity} x {formatPrice(item.price)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-slate-800">{formatPrice(item.quantity * item.price)}</p>
                            {order.orderStatus === 'DELIVERED' && item.productId && user?.userId && hasUserReviewedProduct(item.productId, user.userId) && (
                              <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                <CheckCircleIcon className="w-3 h-3 mr-1" /> Direview
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ringkasan & Aksi */}
                  <div className="p-4 sm:p-6 bg-slate-50/70">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                      <div className="text-sm text-slate-600 space-y-2">
                        <p><span className="font-semibold text-slate-700">Alamat:</span> {order.address}</p>
                        <p><span className="font-semibold text-slate-700">Pembayaran:</span> {order.paymentMethod.name}</p>
                        {order.discount && (
                           <div className="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800">
                             <p className="text-sm"><span className="font-bold">Promo:</span> {order.discount.promoCode} (-{order.discount.discountPercentage}%)</p>
                           </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-slate-600">Total Pesanan</p>
                        <p className="text-2xl font-bold text-red-600">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                    
                    {/* Tombol Aksi */}
                    <div className="mt-6 border-t border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                      {order.orderStatus === 'DELIVERED' ? (
                        hasUnreviewedProducts(order) ? (
                          <button
                            onClick={() => {
                              const unreviewedItems = order.items.filter(item => item.productId && !hasUserReviewedProduct(item.productId, user.userId));
                              if (unreviewedItems.length === 1) {
                                handleReviewProduct(unreviewedItems[0]);
                              } else {
                                setSelectedOrder({ ...order, items: unreviewedItems });
                                setShowReviewSelection(true);
                              }
                            }}
                            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Tulis Ulasan ({getUnreviewedProductsCount(order)})
                          </button>
                        ) : (
                          <div className="flex items-center text-emerald-600 font-medium text-sm">
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Semua produk telah direview
                          </div>
                        )
                      ) : null}
                      <button
                        onClick={() => handleViewTracking(order)}
                        className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                      >
                        Lacak Pesanan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODALS (Tracking & Review) --- */}
      {/* Backdrop */}
      {(showTracking || showReviewSelection) && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity" aria-hidden="true"></div>
      )}

      {/* Tracking Modal */}
      {showTracking && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col transform transition-all">
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Lacak Pesanan #{sortedOrders.findIndex(o => o.id === selectedOrder.id) + 1}
                </h2>
                <button onClick={() => setShowTracking(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              {trackingLoading ? (
                <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div></div>
              ) : (
                <OrderTracking orderId={selectedOrder.id} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Selection Modal */}
      {showReviewSelection && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col transform transition-all">
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Pilih Produk untuk Direview</h2>
                <button onClick={() => setShowReviewSelection(false)} className="text-slate-400 hover:text-slate-600 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              <p className="text-slate-600 mb-6">Pilih salah satu produk dari pesanan ini untuk diberi ulasan.</p>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <button
                    key={index}
                                         onClick={() => { handleReviewProduct(item); setShowReviewSelection(false); }}
                     className="w-full p-4 border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left flex items-center space-x-4"
                   >
                     <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-md overflow-hidden">
                       {item.imageUrl ? (
                         <img
                           src={item.imageUrl.startsWith('http') 
                             ? item.imageUrl 
                             : `http://localhost:6060${item.imageUrl}`}
                           alt={item.productName}
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             e.target.style.display = 'none';
                             e.target.nextSibling.style.display = 'flex';
                           }}
                         />
                       ) : null}
                       <div 
                         className="w-full h-full bg-slate-100 flex items-center justify-center"
                         style={{ display: item.imageUrl ? 'none' : 'flex' }}
                       >
                         <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                         </svg>
                       </div>
                     </div>
                    <div className="flex-grow">
                      <p className="font-semibold text-slate-800">{item.productName}</p>
                      <p className="text-sm text-slate-500">{item.quantity} x {formatPrice(item.price)}</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Order Tracking Component - Didesain ulang total untuk visualisasi timeline ---
const OrderTracking = ({ orderId }) => {
  const { getTrackingTimeline } = useTrackingStore();
  const trackingItems = getTrackingTimeline(orderId);

  const formatTrackingDate = (dateString) => new Date(dateString).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

  // Ikon untuk setiap status
  const getStatusIcon = (status) => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;
    if (s.includes('shipped')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17H6a1 1 0 01-1-1V5a1 1 0 011-1h11l3 4v8a1 1 0 01-1 1h-1m-6 0h7m-7 0a1 1 0 01-1-1V5" /></svg>;
    if (s.includes('confirmed')) return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>;
  };

  if (trackingItems.length === 0) {
    return <div className="text-center py-12 text-slate-500">Belum ada informasi pelacakan untuk pesanan ini.</div>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {trackingItems.map((item, index) => (
          <li key={item.trackingId}>
            <div className="relative pb-8">
              {/* Garis Vertikal Timeline */}
              {index !== trackingItems.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
              ) : null}
              
              <div className="relative flex space-x-4">
                {/* Ikon Status */}
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                      index === 0 ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-700'
                    }`}
                  >
                    {getStatusIcon(item.status)}
                  </span>
                </div>
                {/* Detail Status */}
                <div className="min-w-0 flex-1 pt-1.5">
                  <p className={`text-sm font-semibold ${index === 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.status}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    {formatTrackingDate(item.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};


export default OrderHistoryPage;