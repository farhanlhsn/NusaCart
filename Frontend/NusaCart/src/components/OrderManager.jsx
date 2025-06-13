import React, { useState, useEffect } from 'react';
import { orderAPI, paymentAPI, trackingAPI, paymentMethodAPI } from '../services/api';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState([]);

  useEffect(() => {
    loadOrders();
    loadPaymentMethods();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Error loading orders: ' + (err.response?.data?.message || err.message));
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentMethodAPI.getActive();
      setPaymentMethods(response.data.data || response.data);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    }
  };

  const loadTrackingInfo = async (orderId) => {
    try {
      const response = await trackingAPI.getByOrder(orderId);
      setTrackingInfo(response.data);
    } catch (err) {
      console.error('Error loading tracking info:', err);
    }
  };

  const placeOrder = async (orderData) => {
    try {
      setLoading(true);
      const response = await orderAPI.place(orderData);
      setSuccess('Order placed successfully! Order ID: ' + (response.data.orderId || 'N/A'));
      loadOrders(); // Reload orders
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError('Error placing order: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      await paymentAPI.updatePaymentStatus(orderId, { paymentStatus });
      setSuccess('Payment status updated successfully!');
      loadOrders(); // Reload orders
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error updating payment status: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    try {
      await paymentAPI.updateOrderStatus(orderId, { orderStatus });
      setSuccess('Order status updated successfully!');
      loadOrders(); // Reload orders
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error updating order status: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const addTracking = async (orderId, status, description) => {
    try {
      await trackingAPI.add(orderId, { status, description });
      setSuccess('Tracking info added successfully!');
      if (selectedOrder && selectedOrder.id === orderId) {
        loadTrackingInfo(orderId); // Reload tracking info
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error adding tracking info: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PAID': 'bg-green-100 text-green-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Order Manager</h1>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Create Order Demo Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Place New Order (Demo)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select
              id="paymentMethodId"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Payment Method</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.methodName} - {method.type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address ID</label>
            <input
              type="number"
              id="addressId"
              placeholder="Address ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Promo Code (Optional)</label>
            <input
              type="text"
              id="promoCode"
              placeholder="Enter promo code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const paymentMethodId = document.getElementById('paymentMethodId').value;
                const addressId = document.getElementById('addressId').value;
                const promoCode = document.getElementById('promoCode').value;
                
                if (paymentMethodId && addressId) {
                  const orderData = {
                    paymentMethodId: parseInt(paymentMethodId),
                    addressId: parseInt(addressId),
                    ...(promoCode && { promoCode })
                  };
                  placeOrder(orderData);
                }
              }}
              className="w-full px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading orders...</p>
        </div>
      )}

      {/* Orders List */}
      {!loading && (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">No orders found</h2>
              <p className="text-gray-500">Place your first order to see it here!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  {/* Order Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Order #{order.id}</h3>
                      <p className="text-gray-600">
                        Ordered on: {new Date(order.orderDate).toLocaleDateString('id-ID')}
                      </p>
                      <p className="text-gray-600">
                        Total: Rp {order.totalPrice?.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <br />
                      <span className={`px-3 py-1 rounded-full text-sm mt-2 inline-block ${getStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Items:</h4>
                      <div className="space-y-2">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span>{item.product?.productName || 'Unknown Product'}</span>
                            <span>Qty: {item.quantity} × Rp {item.price?.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        loadTrackingInfo(order.id);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      View Tracking
                    </button>
                    
                    {/* Payment Status Actions */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          updatePaymentStatus(order.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="">Update Payment Status</option>
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                    </select>

                    {/* Order Status Actions */}
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          updateOrderStatus(order.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="">Update Order Status</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  {/* Add Tracking */}
                  <div className="border-t pt-4">
                    <h5 className="font-semibold mb-2">Add Tracking Update:</h5>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Status"
                        id={`trackingStatus_${order.id}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        id={`trackingDesc_${order.id}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => {
                          const status = document.getElementById(`trackingStatus_${order.id}`).value;
                          const description = document.getElementById(`trackingDesc_${order.id}`).value;
                          if (status && description) {
                            addTracking(order.id, status, description);
                            document.getElementById(`trackingStatus_${order.id}`).value = '';
                            document.getElementById(`trackingDesc_${order.id}`).value = '';
                          }
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                      >
                        Add Tracking
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Tracking Information - Order #{selectedOrder.id}</h3>
              <button
                onClick={() => {
                  setSelectedOrder(null);
                  setTrackingInfo([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {trackingInfo.length === 0 ? (
              <p className="text-gray-500">No tracking information available.</p>
            ) : (
              <div className="space-y-4">
                {trackingInfo.map((tracking, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-semibold">{tracking.status}</div>
                      <div className="text-gray-600 text-sm">{tracking.description}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {new Date(tracking.timestamp).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager; 