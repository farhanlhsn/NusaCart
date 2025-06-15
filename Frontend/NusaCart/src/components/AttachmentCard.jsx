import React from 'react';
import { Package, ShoppingCart, ExternalLink } from 'lucide-react';

const AttachmentCard = ({ type, data, orderId, productId }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'confirmed': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-600 bg-red-50 border-red-200';
      case 'paid': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (type === 'order' || orderId) {
    return (
      <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm max-w-xs">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
            <ShoppingCart className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900">
              Pesanan #{orderId || data?.id}
            </div>
            <div className="text-xs text-gray-500">
              Lampiran Transaksi
            </div>
          </div>
        </div>
        
        {data && (
          <>
            <div className="text-xs text-gray-600 mb-2">
              {data.items?.length || 0} item • {formatPrice(data.totalAmount || 0)}
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getOrderStatusColor(data.orderStatus)}`}>
                {data.orderStatus || 'Pending'}
              </span>
              <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                <ExternalLink className="w-3 h-3 mr-1" />
                Lihat Detail
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (type === 'product' || productId) {
    // Try to get image URL from various possible sources
    let imageUrl = null;
    
    if (data) {
      // Try imageUrls first (main field)
      if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
        const firstImage = data.imageUrls[0];
        imageUrl = firstImage.startsWith('http') ? firstImage : `http://localhost:6060${firstImage}`;
      }
      // Fallback to imageUrl field
      else if (data.imageUrl) {
        imageUrl = data.imageUrl.startsWith('http') ? data.imageUrl : `http://localhost:6060${data.imageUrl}`;
      }
      // Fallback to images field (legacy)
      else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        const firstImage = data.images[0];
        imageUrl = firstImage.startsWith('http') ? firstImage : `http://localhost:6060${firstImage}`;
      }
    }

    return (
      <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm max-w-xs">
        <div className="flex items-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={data?.productName || 'Product'}
              className="w-12 h-12 rounded-lg object-cover mr-3 border border-gray-200"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 border border-gray-200"
            style={{ display: imageUrl ? 'none' : 'flex' }}
          >
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {data?.productName || `Produk #${productId}`}
            </div>
            <div className="text-xs text-gray-500">
              Lampiran Produk
            </div>
            {data && (
              <div className="text-xs text-gray-600 mt-1">
                {formatPrice(data.price)} • Stok: {data.stock}
              </div>
            )}
          </div>
        </div>
        
        {data && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <button className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
              <ExternalLink className="w-3 h-3 mr-1" />
              Lihat Produk
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default AttachmentCard; 