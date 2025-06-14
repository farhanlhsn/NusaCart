import React, { useState, useEffect } from 'react';
import { wishlistAPI, discountAPI, reviewAPI } from '../services/api';

const WishlistManager = () => {
  const [wishlists, setWishlists] = useState([]);
  const [selectedWishlist, setSelectedWishlist] = useState(null);
  const [discounts, setDiscounts] = useState({});
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    setLoading(true);
    try {
      const response = await wishlistAPI.getAll();
      setWishlists(response.data);
      setError(null);
    } catch (err) {
      setError('Error loading wishlists: ' + (err.response?.data?.message || err.message));
      console.error('Error loading wishlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWishlist = async (wishlistData) => {
    try {
      await wishlistAPI.create(wishlistData);
      setSuccess('Wishlist created successfully!');
      loadWishlists();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error creating wishlist: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const updateWishlist = async (wishlistId, wishlistData) => {
    try {
      await wishlistAPI.update(wishlistId, wishlistData);
      setSuccess('Wishlist updated successfully!');
      loadWishlists();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error updating wishlist: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const deleteWishlist = async (wishlistId) => {
    if (window.confirm('Are you sure you want to delete this wishlist?')) {
      try {
        await wishlistAPI.delete(wishlistId);
        setSuccess('Wishlist deleted successfully!');
        loadWishlists();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Error deleting wishlist: ' + (err.response?.data?.message || err.message));
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  const addProductToWishlist = async (wishlistId, productId) => {
    try {
      await wishlistAPI.addProduct(wishlistId, productId);
      setSuccess('Product added to wishlist!');
      loadWishlists();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error adding product to wishlist: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const removeProductFromWishlist = async (wishlistId, productId) => {
    try {
      await wishlistAPI.removeProduct(wishlistId, productId);
      setSuccess('Product removed from wishlist!');
      loadWishlists();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error removing product from wishlist: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const checkDiscount = async (promoCode) => {
    try {
      const response = await discountAPI.getByCode(promoCode);
      setDiscounts(prev => ({
        ...prev,
        [promoCode]: response.data
      }));
      setSuccess(`Discount code "${promoCode}" is valid!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error checking discount: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const createDiscount = async (discountData) => {
    try {
      await discountAPI.create(discountData);
      setSuccess('Discount created successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error creating discount: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  const loadProductReviews = async (productId) => {
    try {
      const response = await reviewAPI.getByProduct(productId);
      setReviews(prev => ({
        ...prev,
        [productId]: response.data
      }));
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const createReview = async (reviewData) => {
    try {
      const { productId, ...reviewPayload } = reviewData;
      await reviewAPI.create(productId, reviewPayload);
      setSuccess('Review created successfully!');
      // Reload reviews for the product
      if (productId) {
        loadProductReviews(productId);
      }
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error creating review: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Wishlist & Promotions Manager</h1>

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

      {/* Create Wishlist Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Create New Wishlist</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Wishlist Name</label>
            <input
              type="text"
              id="wishlistName"
              placeholder="Enter wishlist name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              const name = document.getElementById('wishlistName').value;
              if (name.trim()) {
                createWishlist({ name: name.trim() });
                document.getElementById('wishlistName').value = '';
              }
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Create Wishlist
          </button>
        </div>
      </div>

      {/* Discount Code Checker */}
      <div className="mb-8 p-6 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Check Discount Code</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Promo Code</label>
            <input
              type="text"
              id="promoCode"
              placeholder="Enter promo code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button
            onClick={() => {
              const code = document.getElementById('promoCode').value;
              if (code.trim()) {
                checkDiscount(code.trim());
              }
            }}
            className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Check Code
          </button>
        </div>

        {/* Display Discount Info */}
        {Object.keys(discounts).length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Valid Discount Codes:</h4>
            <div className="space-y-2">
              {Object.entries(discounts).map(([code, discount]) => (
                <div key={code} className="p-3 bg-white rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-600">{code}</span>
                    <span className="text-sm text-gray-600">
                      {discount.discountType === 'PERCENTAGE' 
                        ? `${discount.discountValue}% off` 
                        : `Rp ${discount.discountValue?.toLocaleString('id-ID')} off`}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {discount.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Valid until: {new Date(discount.validUntil).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Discount Section */}
      <div className="mb-8 p-6 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Create New Discount</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Promo Code</label>
            <input
              type="text"
              id="newPromoCode"
              placeholder="Enter unique code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              id="discountDescription"
              placeholder="Discount description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount Type</label>
            <select
              id="discountType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Discount Value</label>
            <input
              type="number"
              id="discountValue"
              placeholder="10 (for 10% or Rp 10000)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valid Until</label>
            <input
              type="date"
              id="validUntil"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const promoCode = document.getElementById('newPromoCode').value;
                const description = document.getElementById('discountDescription').value;
                const discountType = document.getElementById('discountType').value;
                const discountValue = document.getElementById('discountValue').value;
                const validUntil = document.getElementById('validUntil').value;

                if (promoCode && description && discountValue && validUntil) {
                  createDiscount({
                    promoCode: promoCode.trim(),
                    description: description.trim(),
                    discountType,
                    discountValue: parseFloat(discountValue),
                    validUntil
                  });
                  
                  // Clear form
                  ['newPromoCode', 'discountDescription', 'discountValue', 'validUntil'].forEach(id => {
                    document.getElementById(id).value = '';
                  });
                }
              }}
              className="w-full px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Create Discount
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading wishlists...</p>
        </div>
      )}

      {/* Wishlists */}
      {!loading && (
        <>
          {wishlists.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💝</div>
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">No wishlists found</h2>
              <p className="text-gray-500">Create your first wishlist to start saving your favorite items!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlists.map(wishlist => (
                <div key={wishlist.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{wishlist.name || 'My Wishlist'}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedWishlist(wishlist)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => deleteWishlist(wishlist.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="text-gray-600 mb-4">
                    {wishlist.products?.length || 0} item(s)
                  </div>

                  {/* Add Product Section */}
                  <div className="border-t pt-4">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Product ID"
                        id={`productId_${wishlist.id}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      />
                      <button
                        onClick={() => {
                          const productId = document.getElementById(`productId_${wishlist.id}`).value;
                          if (productId) {
                            addProductToWishlist(wishlist.id, parseInt(productId));
                            document.getElementById(`productId_${wishlist.id}`).value = '';
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Add Product
                      </button>
                    </div>
                  </div>

                  {/* Products Preview */}
                  {wishlist.products && wishlist.products.length > 0 && (
                    <div className="mt-4">
                      <div className="text-sm font-semibold mb-2">Products:</div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {wishlist.products.slice(0, 3).map(product => (
                          <div key={product.id} className="flex justify-between items-center text-sm">
                            <span className="truncate">{product.productName}</span>
                            <button
                              onClick={() => removeProductFromWishlist(wishlist.id, product.id)}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {wishlist.products.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{wishlist.products.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Wishlist Detail Modal */}
      {selectedWishlist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedWishlist.name || 'My Wishlist'}</h3>
              <button
                onClick={() => setSelectedWishlist(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {!selectedWishlist.products || selectedWishlist.products.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No products in this wishlist.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedWishlist.products.map(product => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <img
                      src={product.imageUrls?.[0] || '/placeholder-image.jpg'}
                      alt={product.productName}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <h4 className="font-semibold text-sm mb-1">{product.productName}</h4>
                    <div className="text-green-600 font-bold mb-2">
                      Rp {product.price?.toLocaleString('id-ID')}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeProductFromWishlist(selectedWishlist.id, product.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => loadProductReviews(product.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Reviews
                      </button>
                    </div>
                    
                    {/* Reviews for this product */}
                    {reviews[product.id] && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <div className="font-semibold mb-1">Reviews ({reviews[product.id].length}):</div>
                        {reviews[product.id].slice(0, 2).map((review, index) => (
                          <div key={index} className="mb-1">
                            <div className="flex items-center gap-1">
                              <span>⭐ {review.rating}/5</span>
                            </div>
                            <div className="text-gray-600">{review.comment}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Review Section */}
      <div className="mt-8 p-6 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Create Product Review</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product ID</label>
            <input
              type="number"
              id="reviewProductId"
              placeholder="Product ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
            <select
              id="reviewRating"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select Rating</option>
              <option value="1">1 ⭐</option>
              <option value="2">2 ⭐⭐</option>
              <option value="3">3 ⭐⭐⭐</option>
              <option value="4">4 ⭐⭐⭐⭐</option>
              <option value="5">5 ⭐⭐⭐⭐⭐</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comment</label>
            <input
              type="text"
              id="reviewComment"
              placeholder="Your review comment"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const productId = document.getElementById('reviewProductId').value;
                const rating = document.getElementById('reviewRating').value;
                const comment = document.getElementById('reviewComment').value;

                if (productId && rating && comment) {
                  createReview({
                    productId: parseInt(productId),
                    rating: parseInt(rating),
                    comment: comment.trim()
                  });
                  
                  // Clear form
                  ['reviewProductId', 'reviewRating', 'reviewComment'].forEach(id => {
                    document.getElementById(id).value = '';
                  });
                }
              }}
              className="w-full px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistManager; 