import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useOrderStore from '../stores/orderStore';
import useTrackingStore from '../stores/trackingStore';
import useAuthStore from '../stores/authStore';
import useReviewStore from '../stores/reviewStore';

const OrderHistoryPage = () => {
  const { orders, loading, error, fetchOrders } = useOrderStore();
  const { getTrackingTimeline, fetchTrackingByOrder, loading: trackingLoading } = useTrackingStore();
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
      // Only navigate to login if user is explicitly null (not loading)
      navigate('/login');
    }
  }, [user, fetchOrders, navigate]);

  // Fetch reviews for products in delivered orders to check review status
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

  // Debug logging untuk melihat struktur data order
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && orders && orders.length > 0) {
      console.log('OrderHistory - Sample order structure:', orders[0]);
      console.log('OrderHistory - Sample order items:', orders[0]?.items);
    }
  }, [orders]);

  const handleViewTracking = async (order) => {
    setSelectedOrder(order);
    setShowTracking(true);
    await fetchTrackingByOrder(order.id);
  };

  const handleReviewProduct = (item) => {
    // Check if we have productId, otherwise search by product name
    if (item.productId) {
      navigate(`/product/${item.productId}`);
    } else if (item.productName) {
      // Fallback: search by product name if no productId
      navigate(`/search?name=${encodeURIComponent(item.productName)}`);
    } else {
      // Last resort: go to products page
      navigate('/products');
      alert('Silakan cari produk secara manual untuk menulis ulasan');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if there are products in the order that haven't been reviewed yet
  const hasUnreviewedProducts = (order) => {
    if (!order.items || !user?.userId) return false;
    
    return order.items.some(item => {
      if (!item.productId) return false;
      return !hasUserReviewedProduct(item.productId, user.userId);
    });
  };

  // Get count of unreviewed products in an order
  const getUnreviewedProductsCount = (order) => {
    if (!order.items || !user?.userId) return 0;
    
    return order.items.filter(item => {
      if (!item.productId) return false;
      return !hasUserReviewedProduct(item.productId, user.userId);
    }).length;
  };

  if (!user) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="hover:text-red-600 cursor-pointer transition-colors"
        >
          Beranda
        </button>
        <span>|</span>
        <button 
          onClick={() => navigate('/profile')} 
          className="hover:text-red-600 cursor-pointer transition-colors"
        >
          Profil
        </button>
        <span>|</span>
        <span className="text-red-600 font-medium">Riwayat Pesanan</span>
      </div>
      {/* End Breadcrumbs */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
        <p className="text-gray-600 mt-2">Lihat dan lacak semua pesanan Anda</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Belum ada pesanan</h3>
          <p className="text-gray-600 mb-6">
            Anda belum memesan apa-apa. Mulai berbelanja untuk melihat pesanan Anda di sini.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Mulai Berbelanja
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Barang yang dipesan</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {item.productName}
                            </p>
                            {order.orderStatus === 'DELIVERED' && item.productId && user?.userId && hasUserReviewedProduct(item.productId, user.userId) && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Sudah direview
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(item.quantity * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Payment Method:</span> {order.paymentMethod.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Delivery Address:</span> {order.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Total: {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                    <button
                      onClick={() => handleViewTracking(order)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium w-full md:w-auto"
                    >
                      Lacak Pesanan
                    </button>
                    
                    {order.orderStatus === 'DELIVERED' && hasUnreviewedProducts(order) && (
                      <button
                        onClick={() => {
                          if (order.items && order.items.length > 0) {
                            const unreviewedItems = order.items.filter(item => {
                              if (!item.productId || !user?.userId) return false;
                              return !hasUserReviewedProduct(item.productId, user.userId);
                            });
                            
                            if (unreviewedItems.length === 0) {
                              alert('Semua produk dalam order ini sudah direview');
                              return;
                            }
                            
                            if (unreviewedItems.length === 1) {
                              // Jika hanya 1 produk yang belum direview, langsung handle review
                              handleReviewProduct(unreviewedItems[0]);
                            } else {
                              // Jika multiple products yang belum direview, tampilkan modal untuk pilih produk
                              setSelectedOrder({
                                ...order,
                                items: unreviewedItems // Only show unreviewed items in modal
                              });
                              setShowReviewSelection(true);
                            }
                          } else {
                            alert('Tidak ada produk dalam order ini');
                          }
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium w-full md:w-auto"
                      >
                        {(() => {
                          const unreviewedCount = getUnreviewedProductsCount(order);
                          return unreviewedCount > 1 
                            ? `Tulis Ulasan (${unreviewedCount} produk)` 
                            : 'Tulis Ulasan';
                        })()}
                      </button>
                    )}
                    
                    {order.orderStatus === 'DELIVERED' && !hasUnreviewedProducts(order) && (
                      <div className="flex items-center text-green-600 font-medium">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Semua produk sudah direview
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracking Modal */}
      {showTracking && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Tracking - #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => {
                    setShowTracking(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {trackingLoading ? (
                <div className="flex items-center justify-center py-8 ">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <OrderTracking orderId={selectedOrder.id} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Selection Modal */}
      {showReviewSelection && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Pilih Produk untuk Direview
                </h2>
                <button
                  onClick={() => {
                    setShowReviewSelection(false);
                    setSelectedOrder(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Order ini memiliki beberapa produk. Pilih produk yang ingin Anda review:
              </p>
              
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      handleReviewProduct(item);
                      setShowReviewSelection(false);
                      setSelectedOrder(null);
                    }}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × {formatPrice(item.price / item.quantity)}
                        </p>
                      </div>
                      <div className="text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => {
                    setShowReviewSelection(false);
                    setSelectedOrder(null);
                  }}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Order Tracking Component
const OrderTracking = ({ orderId }) => {
  const { getTrackingTimeline } = useTrackingStore();
  const trackingItems = getTrackingTimeline(orderId);

  const formatTrackingDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (trackingItems.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Belum ada informasi pelacakan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Jadwal Pelacakan</h3>
      
      <div className="relative">
        {trackingItems.map((item, index) => (
          <div key={item.trackingId} className="flex items-start space-x-4 pb-6">
            <div className="flex-shrink-0">
              <div className={`w-4 h-4 rounded-full ${
                index === 0 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>
              {index < trackingItems.length - 1 && (
                <div className="w-0.5 h-6 bg-gray-300 mt-2 ml-1.5"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {item.status}
                </p>
                <p className="text-sm text-gray-600">
                  {formatTrackingDate(item.updatedAt)}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistoryPage; 