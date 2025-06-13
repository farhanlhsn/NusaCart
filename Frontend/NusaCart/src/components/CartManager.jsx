import React, { useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

const CartManager = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await cartAPI.get();
      setCartItems(response.data);
      setError(null);
    } catch (err) {
      setError('Error loading cart: ' + (err.response?.data?.message || err.message));
      console.error('Error loading cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      await cartAPI.updateQuantity(cartItemId, newQuantity);
      setSuccess('Quantity updated successfully!');
      loadCart(); // Reload cart after update
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error updating quantity: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (window.confirm('Are you sure you want to remove this item from cart?')) {
      try {
        await cartAPI.remove(cartItemId);
        setSuccess('Item removed from cart!');
        loadCart(); // Reload cart after removal
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Error removing item: ' + (err.response?.data?.message || err.message));
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await cartAPI.add({ productId, quantity });
      setSuccess('Item added to cart!');
      loadCart(); // Reload cart after adding
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error adding to cart: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>

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

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading cart...</p>
        </div>
      )}

      {/* Cart Content */}
      {!loading && (
        <>
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
              <p className="text-gray-500">Start shopping to add items to your cart!</p>
            </div>
          ) : (
            <>
              {/* Cart Summary */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Items: {getTotalItems()}</span>
                  <span>Total Price: Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md p-6 flex items-center gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.imageUrl 
                          ? (item.imageUrl.startsWith('http') 
                             ? item.imageUrl 
                             : `http://localhost:6060${item.imageUrl}`)
                          : '/placeholder-image.jpg'}
                        alt={item.productName || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold mb-1">
                        {item.productName || 'Unknown Product'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Product in cart
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-green-600">
                          Rp {(item.price || 0).toLocaleString('id-ID')}
                        </span>
                        <span className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-lg font-bold"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      
                      <span className="w-12 text-center font-semibold text-lg">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-lg font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        Rp {((item.price || 0) * item.quantity).toLocaleString('id-ID')}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={loadCart}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Refresh Cart
                </button>
                
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Continue Shopping
                  </button>
                  <button className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Add Item Demo Section (for testing) */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add Item to Cart (Demo)</h3>
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Product ID</label>
            <input
              type="number"
              id="productId"
              placeholder="Enter product ID"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input
              type="number"
              id="quantity"
              min="1"
              defaultValue="1"
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              const productId = document.getElementById('productId').value;
              const quantity = document.getElementById('quantity').value;
              if (productId) {
                addToCart(parseInt(productId), parseInt(quantity) || 1);
              }
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartManager; 