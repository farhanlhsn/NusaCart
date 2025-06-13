import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import useOrderStore from '../stores/orderStore';
import usePaymentMethodStore from '../stores/paymentMethodStore';
import useAuthStore from '../stores/authStore';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  const { fetchOrders, loading, error } = useOrderStore();
  const { activePaymentMethods, fetchActivePaymentMethods } = usePaymentMethodStore();
  const { user } = useAuthStore();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
    bankAccount: '',
    ewallet: '',
    qrisCode: ''
  });
  const [paymentStep, setPaymentStep] = useState('select'); // select, details, processing, success, failed
  const [countdown, setCountdown] = useState(600); // 10 minutes in seconds
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchActivePaymentMethods();
    
    if (!orderData) {
      navigate('/cart');
    }
  }, [orderId, user, navigate]);

  useEffect(() => {
    // Countdown timer for payment
    if (paymentStep === 'details' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setPaymentStep('expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStep, countdown]);

  // Order details are passed via state from checkout page
  useEffect(() => {
    if (orderData) {
      setOrder(orderData);
      console.log('Order data received:', orderData);
    }
  }, [orderData]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setPaymentStep('details');
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPaymentMethod) {
      alert('Silakan pilih metode pembayaran');
      return;
    }

    setPaymentStep('processing');

    try {
      // Simulate payment processing for now
      // In real implementation, this would call payment gateway API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always succeed
      setPaymentStep('success');
      
      // Clear checkout items and redirect after success
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      setPaymentStep('failed');
    }
  };

  const getPaymentMethodIcon = (method) => {
    // Fallback emoji icons
    switch (method.type) {
      case 'credit_card':
      case 'debit_card':
        return '💳';
      case 'bank_transfer':
        return '🏦';
      case 'ewallet':
        return '📱';
      case 'qris':
        return '📱';
      default:
        return '💰';
    }
  };

  const getPaymentMethodImageUrl = (method) => {
    if (method.iconUrl) {
      return method.iconUrl.startsWith('http') 
        ? method.iconUrl 
        : `http://localhost:6060${method.iconUrl}`;
    }
    return null;
  };

  const renderPaymentDetails = () => {
    const method = activePaymentMethods.find(m => m.id === selectedPaymentMethod);
    if (!method) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">Metode pembayaran tidak ditemukan</p>
        </div>
      );
    }

    // Always show method header with icon and name
    const methodHeader = (
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          {method.iconUrl ? (
            <img 
              src={getPaymentMethodImageUrl(method)} 
              alt={method.name}
              className="w-8 h-8 mr-3 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
          ) : null}
          <span className="text-2xl mr-3" style={{ display: method.iconUrl ? 'none' : 'inline' }}>
            {getPaymentMethodIcon(method)}
          </span>
          <div>
            <h3 className="font-semibold text-gray-800">{method.name}</h3>
            <p className="text-sm text-gray-600">{method.description}</p>
          </div>
        </div>
      </div>
    );

    switch (method.type) {
      case 'credit_card':
      case 'debit_card':
        return (
          <div>
            {methodHeader}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Kartu
                </label>
                <input
                  type="text"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength="19"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Kadaluarsa
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.cvv}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="4"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pemegang Kartu
                </label>
                <input
                  type="text"
                  value={paymentDetails.cardHolderName}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardHolderName: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div>
            {methodHeader}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Instruksi Transfer Bank</h4>
                <div className="text-sm text-blue-700">
                  <p>Bank: {method.name}</p>
                  <p>No. Rekening: 1234567890</p>
                  <p>Atas Nama: NusaCart Indonesia</p>
                  <p className="mt-2 font-semibold">
                    Jumlah: Rp {(orderData?.total || order?.total || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Rekening Anda (untuk verifikasi)
                </label>
                <input
                  type="text"
                  value={paymentDetails.bankAccount}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, bankAccount: e.target.value }))}
                  placeholder="Masukkan nomor rekening Anda"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'ewallet':
        return (
          <div>
            {methodHeader}
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Pembayaran E-Wallet</h4>
                <p className="text-sm text-green-700">
                  Anda akan diarahkan ke aplikasi {method.name} untuk menyelesaikan pembayaran.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Handphone
                </label>
                <input
                  type="text"
                  value={paymentDetails.ewallet}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, ewallet: e.target.value }))}
                  placeholder="Masukkan nomor handphone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'qris':
        return (
          <div>
            {methodHeader}
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-purple-800 mb-4">Scan QR Code untuk Membayar</h4>
                <div className="bg-white p-4 inline-block rounded-lg shadow">
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">QR Code akan muncul di sini</span>
                  </div>
                </div>
                <p className="text-sm text-purple-700 mt-4">
                  Buka aplikasi mobile banking atau e-wallet Anda dan scan QR code ini
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            {methodHeader}
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-gray-600">
                Silakan ikuti instruksi pembayaran untuk metode {method.name}
              </p>
            </div>
          </div>
        );
    }
  };

  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment has been processed successfully. You will be redirected to your orders page.
          </p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  if (paymentStep === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-4">
            There was an issue processing your payment. Please try again.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => setPaymentStep('select')}
              className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Selesaikan Pembayaran</h1>
            {paymentStep === 'details' && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Waktu tersisa</p>
                <p className="text-2xl font-bold text-red-500">{formatTime(countdown)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {paymentStep === 'select' ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Pilih Metode Pembayaran</h2>
                  <div className="space-y-3">
                    {activePaymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center">
                          {method.iconUrl ? (
                            <img 
                              src={getPaymentMethodImageUrl(method)} 
                              alt={method.name}
                              className="w-8 h-8 mr-3 object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'inline';
                              }}
                            />
                          ) : null}
                          <span className="text-2xl mr-3" style={{ display: method.iconUrl ? 'none' : 'inline' }}>
                            {getPaymentMethodIcon(method)}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-800">{method.name}</h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Detail Pembayaran</h2>
                    <button
                      onClick={() => setPaymentStep('select')}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Ganti Metode
                    </button>
                  </div>
                  
                  {renderPaymentDetails()}
                  
                  <div className="mt-6">
                    <button
                      onClick={handlePaymentSubmit}
                      disabled={loading}
                      className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Memproses...' : 'Selesaikan Pembayaran'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h2>
              
              {/* Order Items */}
              {(orderData?.items || order?.items) && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-800 mb-2">Items:</h3>
                  <div className="space-y-2">
                    {(orderData?.items || order?.items || []).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} x{item.qty}</span>
                        <span>Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                  <hr className="my-3" />
                </div>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rp {((orderData?.subtotal || order?.subtotal || 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pengiriman</span>
                  <span>Gratis</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rp {((orderData?.total || order?.total || 0)).toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              {/* Address */}
              {(orderData?.address || order?.address) && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-medium text-gray-800 mb-2">Alamat Pengiriman:</h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{orderData?.address?.namaPenerima || order?.address?.namaPenerima}</p>
                    <p>{orderData?.address?.phoneNumber || order?.address?.phoneNumber}</p>
                    <p>
                      {orderData?.address?.jalan || order?.address?.jalan}, {orderData?.address?.kelurahan || order?.address?.kelurahan}, {orderData?.address?.kecamatan || order?.address?.kecamatan}, {orderData?.address?.kotaKabupaten || order?.address?.kotaKabupaten}, {orderData?.address?.provinsi || order?.address?.provinsi} {orderData?.address?.kodePos || order?.address?.kodePos}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 