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

  const { processPayment, getOrder, loading, error } = useOrderStore();
  const { paymentMethods, fetchPaymentMethods } = usePaymentMethodStore();
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

    fetchPaymentMethods();
    
    if (orderId) {
      fetchOrderDetails();
    } else if (!orderData) {
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

  const fetchOrderDetails = async () => {
    try {
      const orderDetails = await getOrder(orderId);
      setOrder(orderDetails);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

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
      alert('Please select a payment method');
      return;
    }

    setPaymentStep('processing');

    try {
      const paymentData = {
        orderId: orderId || orderData?.id,
        paymentMethodId: selectedPaymentMethod,
        amount: orderData?.total || order?.total,
        ...paymentDetails
      };

      const result = await processPayment(paymentData);
      
      if (result.success) {
        setPaymentStep('success');
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        setPaymentStep('failed');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      setPaymentStep('failed');
    }
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
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

  const renderPaymentDetails = () => {
    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
    if (!method) return null;

    switch (method.type) {
      case 'credit_card':
      case 'debit_card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
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
                  Expiry Date
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
                Card Holder Name
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
        );

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Bank Transfer Instructions</h4>
              <div className="text-sm text-blue-700">
                <p>Bank: {method.name}</p>
                <p>Account Number: {method.accountNumber}</p>
                <p>Account Name: NusaCart Indonesia</p>
                <p className="mt-2 font-semibold">
                  Amount: Rp {(orderData?.total || order?.total || 0).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Bank Account Number (for verification)
              </label>
              <input
                type="text"
                value={paymentDetails.bankAccount}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, bankAccount: e.target.value }))}
                placeholder="Enter your bank account number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'ewallet':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">E-Wallet Payment</h4>
              <p className="text-sm text-green-700">
                You will be redirected to {method.name} app to complete the payment.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={paymentDetails.ewallet}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, ewallet: e.target.value }))}
                placeholder="Enter your phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'qris':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <h4 className="font-semibold text-purple-800 mb-4">Scan QR Code to Pay</h4>
              <div className="bg-white p-4 inline-block rounded-lg shadow">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">QR Code will appear here</span>
                </div>
              </div>
              <p className="text-sm text-purple-700 mt-4">
                Open your mobile banking or e-wallet app and scan this QR code
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Payment method details not available</p>
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
            <h1 className="text-2xl font-bold text-gray-800">Complete Payment</h1>
            {paymentStep === 'details' && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Time remaining</p>
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
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Payment Method</h2>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handlePaymentMethodSelect(method.id)}
                        className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getPaymentMethodIcon(method.type)}</span>
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
                    <h2 className="text-xl font-semibold text-gray-800">Payment Details</h2>
                    <button
                      onClick={() => setPaymentStep('select')}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Change Method
                    </button>
                  </div>
                  
                  {renderPaymentDetails()}
                  
                  <div className="mt-6">
                    <button
                      onClick={handlePaymentSubmit}
                      disabled={loading}
                      className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Complete Payment'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Rp {((orderData?.subtotal || order?.subtotal || 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Rp {((orderData?.shippingCost || order?.shippingCost || 0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>Rp {((orderData?.tax || order?.tax || 0)).toLocaleString('id-ID')}</span>
                </div>
                {(orderData?.discount || order?.discount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-Rp {((orderData?.discount || order?.discount || 0)).toLocaleString('id-ID')}</span>
                  </div>
                )}
                <hr className="my-2" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rp {((orderData?.total || order?.total || 0)).toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 