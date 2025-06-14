import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProductStore from '../stores/productStore';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import useWishlistStore from '../stores/wishlistStore';
import useReviewStore from '../stores/reviewStore';
import ReviewSection from './ReviewSection';
import StarRating from './StarRating';
import ChatButton from './ChatButton';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewsUpdated, setReviewsUpdated] = useState(false);
  
  const { 
    currentProduct, 
    loading, 
    error, 
    fetchProductById
  } = useProductStore();

  const { addProductToCart, loading: cartLoading } = useCartStore();
  const { user } = useAuthStore();
  const { 
    addToWishlist, 
    removeFromWishlist, 
    isInWishlist, 
    fetchWishlist,
    loading: wishlistLoading 
  } = useWishlistStore();
  
  const { 
    getReviewsByProduct, 
    getAverageRating,
    fetchReviewsByProduct,
    forceRefreshProductReviews
  } = useReviewStore();

  useEffect(() => {
    // Debug logging untuk development
    if (process.env.NODE_ENV === 'development') {
      console.log('ProductDetail - URL id parameter:', id);
    }
    
    // Validate id parameter
    if (!id) {
      console.error('ProductDetail - No id parameter found in URL');
      navigate('/products', { replace: true });
      return;
    }
    
    const numericId = parseInt(id);
    if (isNaN(numericId) || numericId <= 0) {
      console.error('ProductDetail - Invalid id parameter:', id);
      navigate('/products', { replace: true });
      return;
    }
    
    // Debug logging untuk development
    if (process.env.NODE_ENV === 'development') {
      console.log('ProductDetail - Fetching product with valid id:', numericId);
    }
    
    // Fetch data dengan promise untuk handling error yang lebih baik
    Promise.all([
      fetchProductById(numericId),
      fetchReviewsByProduct(numericId)
    ]).catch(error => {
      console.error('ProductDetail - Error fetching data:', error);
      // Error sudah dihandle di store, tidak perlu action tambahan
    });
  }, [id, fetchProductById, fetchReviewsByProduct, navigate]);

  // Load user's wishlist when component mounts
  useEffect(() => {
    if (user?.userId) {
      fetchWishlist(user.userId);
    }
  }, [user?.userId, fetchWishlist]);

  // Get reviews data from store (moved up to avoid initialization error)
  const numericId = parseInt(id);
  const reviews = (id && !isNaN(numericId)) ? getReviewsByProduct(numericId) || [] : [];
  const averageRating = (id && !isNaN(numericId)) ? getAverageRating(numericId) || 0 : 0;

  // Watch for review changes to trigger update animation
  useEffect(() => {
    if (reviews && reviews.length > 0) {
      setReviewsUpdated(true);
      const timer = setTimeout(() => {
        setReviewsUpdated(false);
      }, 1000); // Animation lasts 1 second
      
      return () => clearTimeout(timer);
    }
  }, [reviews?.length, averageRating]); // Watch for changes in review count and rating with optional chaining

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await addProductToCart(currentProduct.productId, quantity);
      alert('Product added to cart successfully!');
    } catch (error) {
      alert(error.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isInWishlist(currentProduct.productId)) {
        await removeFromWishlist(currentProduct.productId);
      } else {
        await addToWishlist(currentProduct.productId);
      }
    } catch (error) {
      alert(error.message || 'Failed to update wishlist');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

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
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-xl">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <button onClick={() => navigate('/')} className="hover:text-red-600 cursor-pointer transition-colors">Beranda</button>
        <span>|</span>
        <button onClick={() => navigate('/products')} className="hover:text-red-600 cursor-pointer transition-colors">Produk</button>
        <span>|</span>
        <span className="text-red-600 font-medium">{currentProduct.productName}</span>
      </div>
      {/* End Breadcrumbs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={currentProduct.imageUrls?.[selectedImageIndex] 
                ? (currentProduct.imageUrls[selectedImageIndex].startsWith('http') 
                   ? currentProduct.imageUrls[selectedImageIndex] 
                   : `http://localhost:6060${currentProduct.imageUrls[selectedImageIndex]}`)
                : '/placeholder-image.png'}
              alt={currentProduct.productName}
              className="w-full h-full object-cover"
            />
          </div>
          
          {currentProduct.imageUrls && currentProduct.imageUrls.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {currentProduct.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-blue-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={url.startsWith('http') ? url : `http://localhost:6060${url}`}
                    alt={`${currentProduct.productName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentProduct.productName}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className={`flex items-center space-x-1 transition-all duration-500 ${
                reviewsUpdated ? 'scale-105 text-green-600' : ''
              }`}>
                <StarRating rating={averageRating} showNumber={true} />
                <span className="text-gray-600 ml-2">
                  ({reviews?.length || 0} review{(reviews?.length || 0) !== 1 ? 's' : ''})
                </span>
              </div>
              
              <span className="text-gray-400">|</span>
              
              <span className={`px-2 py-1 rounded-full text-sm ${
                currentProduct.stock > 0 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            <p className="text-4xl font-bold text-blue-600 mb-4">
              {formatPrice(currentProduct.price)}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {currentProduct.description || 'No description available.'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Store Information</h3>
            <p className="text-gray-700">
              <span className="font-medium">Store:</span> {currentProduct.tokoName}
            </p>
            {currentProduct.categoryName && (
              <p className="text-gray-700">
                <span className="font-medium">Category:</span> {currentProduct.categoryName}
              </p>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="border-t pt-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentProduct.stock, quantity + 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity >= currentProduct.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600">
                {currentProduct.stock} items available
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={currentProduct.stock === 0 || cartLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </button>
              
              <button
                onClick={handleAddToWishlist}
                disabled={wishlistLoading}
                className={`px-6 py-3 border-2 rounded-lg font-medium transition-all duration-200 ${
                  isInWishlist(currentProduct.productId)
                    ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                    : 'border-red-500 text-red-500 hover:bg-red-50'
                }`}
              >
                {wishlistLoading 
                  ? '...' 
                  : isInWishlist(currentProduct.productId) 
                    ? '❤️ In Wishlist' 
                    : '♡ Add to Wishlist'
                }
              </button>
            </div>

            {/* Chat with Store */}
            <div className="mt-4 pt-4 border-t">
              <ChatButton
                storeId={currentProduct.tokoId}
                storeName={currentProduct.tokoName}
                variant="outline"
                className="w-full justify-center"
                size="large"
              >
                Chat dengan {currentProduct.tokoName}
              </ChatButton>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {id && !isNaN(numericId) && <ReviewSection productId={numericId} />}
    </div>
  );
};

export default ProductDetail; 