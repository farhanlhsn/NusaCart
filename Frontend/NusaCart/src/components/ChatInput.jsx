import React, { useState, useCallback, memo, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Package, ShoppingCart, X, Clock, CheckCircle, Tag, Receipt } from 'lucide-react';
import useOrderStore from '../stores/orderStore';
import useProductStore from '../stores/productStore';
import useAuthStore from '../stores/authStore';

const ChatInput = memo(({ onSendMessage, disabled = false, currentConversation }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachmentData, setAttachmentData] = useState({ orders: [], products: [] });
  const [loadingAttachment, setLoadingAttachment] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null); // For showing attached item
  const emojiPickerRef = useRef(null);
  const attachmentMenuRef = useRef(null);

  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const { fetchProductsByTokoId } = useProductStore();

  // Common emojis for quick access
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
    '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
    '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
    '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏',
    '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠',
    '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨',
    '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧',
    '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑',
    '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻',
    '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸',
    '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋',
    '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️',
    '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕',
    '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜',
    '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅'
  ];

  // Fetch orders and products when attachment menu is opened
  const fetchAttachmentData = useCallback(async () => {
    if (!currentConversation?.storeId || !user) return;

    setLoadingAttachment(true);
    try {
      // Fetch user's orders (all statuses)
      const userOrders = await fetchOrders();
      
      // Debug: Log order structure
      if (userOrders && userOrders.length > 0) {
        console.log('First order structure:', userOrders[0]);
        console.log('First order items:', userOrders[0].items);
      }
      
      // Filter orders that contain products from this store (include all statuses)
      const storeOrders = userOrders?.filter(order => 
        order.items?.some(item => item.storeId === currentConversation.storeId)
      ) || [];

      console.log('Store orders found:', storeOrders.length);
      console.log('Current conversation storeId:', currentConversation.storeId);

      // Fetch products from this store
      await fetchProductsByTokoId(currentConversation.storeId, 0, 20);
      
      // Get products from store
      const storeProducts = useProductStore.getState().products || [];
      
      // Debug: Log first product to see structure
      if (storeProducts.length > 0) {
        console.log('First product structure:', storeProducts[0]);
      }

      // Transform product images to ensure proper URLs
      const transformedProducts = storeProducts.map(product => {
        let imageUrl = null;
        
        // Try imageUrls first (main field)
        if (product.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
          const firstImage = product.imageUrls[0];
          imageUrl = firstImage.startsWith('http') ? firstImage : `http://localhost:6060${firstImage}`;
        }
        // Fallback to imageUrl field
        else if (product.imageUrl) {
          imageUrl = product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:6060${product.imageUrl}`;
        }
        // Fallback to images field (legacy)
        else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          const firstImage = product.images[0];
          imageUrl = firstImage.startsWith('http') ? firstImage : `http://localhost:6060${firstImage}`;
        }
        
        return {
          ...product,
          imageUrl
        };
      });

      setAttachmentData({
        orders: storeOrders.slice(0, 10), // Show max 10 recent orders (increased from 5)
        products: transformedProducts.slice(0, 15) // Show max 15 products (increased from 10)
      });
    } catch (error) {
      console.error('Error fetching attachment data:', error);
      setAttachmentData({ orders: [], products: [] });
    } finally {
      setLoadingAttachment(false);
    }
  }, [currentConversation?.storeId, user, fetchOrders, fetchProductsByTokoId]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ((message.trim() || selectedAttachment) && !disabled) {
      // Send message with attachment data
      const messageData = {
        text: message.trim() || (selectedAttachment ? `Lampiran ${selectedAttachment.type}` : ''),
        attachment: selectedAttachment
      };
      
      onSendMessage(messageData);
      setMessage('');
      setSelectedAttachment(null);
      setShowEmojiPicker(false);
      setShowAttachmentMenu(false);
    }
  }, [message, selectedAttachment, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  const handleEmojiClick = useCallback((emoji) => {
    setMessage(prev => prev + emoji);
  }, []);

  const handleAttachmentToggle = useCallback(() => {
    const newShowState = !showAttachmentMenu;
    setShowAttachmentMenu(newShowState);
    
    if (newShowState && attachmentData.orders.length === 0 && attachmentData.products.length === 0) {
      fetchAttachmentData();
    }
  }, [showAttachmentMenu, attachmentData, fetchAttachmentData]);

  const handleOrderSelect = useCallback((order) => {
    setSelectedAttachment({
      type: 'order',
      id: order.id,
      data: order
    });
    setShowAttachmentMenu(false);
  }, []);

  const handleProductSelect = useCallback((product) => {
    setSelectedAttachment({
      type: 'product',
      id: product.productId,
      data: product
    });
    setShowAttachmentMenu(false);
  }, []);

  const handleRemoveAttachment = useCallback(() => {
    setSelectedAttachment(null);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'shipped': return 'text-purple-600 bg-purple-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'paid': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
      {/* Attachment Preview */}
      {selectedAttachment && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {selectedAttachment.type === 'order' ? 'Lampiran Pesanan' : 'Lampiran Produk'}
            </span>
            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {selectedAttachment.type === 'order' ? (
            <div className="flex items-center p-2 bg-white rounded border">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Pesanan #{selectedAttachment.data.id}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedAttachment.data.items?.length || 0} item • {formatPrice(selectedAttachment.data.total || selectedAttachment.data.totalAmount || 0)}
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(selectedAttachment.data.orderStatus)}`}>
                {selectedAttachment.data.orderStatus || selectedAttachment.data.status || 'Pending'}
              </span>
            </div>
          ) : (
            <div className="flex items-center p-2 bg-white rounded border">
              <img
                src={selectedAttachment.data.imageUrls?.[0] || selectedAttachment.data.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"}
                alt={selectedAttachment.data.productName}
                className="w-10 h-10 rounded-lg object-cover mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {selectedAttachment.data.productName}
                </div>
                <div className="text-sm text-gray-500">
                  {formatPrice(selectedAttachment.data.price)} • Stok: {selectedAttachment.data.stock}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Attachment Button */}
        <div className="relative" ref={attachmentMenuRef}>
          <button 
            type="button"
            onClick={handleAttachmentToggle}
            className={`p-3 hover:bg-gray-100 rounded-xl transition-colors ${selectedAttachment ? 'bg-red-50 text-red-600' : ''}`}
          >
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Attachment Menu */}
          {showAttachmentMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 py-3 z-50 max-h-96 overflow-y-auto">
              {loadingAttachment ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                  <span className="ml-2 text-sm text-gray-600">Memuat data...</span>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="px-4 pb-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">Lampirkan ke Pesan</h3>
                    <p className="text-xs text-gray-500 mt-1">Pilih pesanan atau produk untuk dilampirkan</p>
                  </div>

                  {/* Orders Section */}
                  {attachmentData.orders.length > 0 && (
                    <div className="px-4 py-3">
                      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center">
                        <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                          <Receipt className="w-3 h-3 text-blue-600" />
                        </div>
                        Pesanan Anda ({attachmentData.orders.length})
                      </h4>
                      <div className="space-y-2">
                        {attachmentData.orders.map((order) => (
                          <button
                            key={order.id}
                            type="button"
                            onClick={() => handleOrderSelect(order)}
                            className="w-full p-3 text-left text-sm hover:bg-blue-50 rounded-lg transition-colors border border-gray-100 hover:border-blue-200"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center flex-1">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">Pesanan #{order.id}</div>
                                  <div className="text-xs text-gray-500">
                                    {order.items?.length || 0} item • {formatPrice(order.totalAmount || 0)}
                                  </div>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                                {order.orderStatus || 'Pending'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Products Section */}
                  {attachmentData.products.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center">
                        <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                          <Tag className="w-3 h-3 text-green-600" />
                        </div>
                        Produk Toko ({attachmentData.products.length})
                      </h4>
                                                <div className="space-y-2">
                            {attachmentData.products.map((product) => (
                              <button
                                key={product.productId}
                                type="button"
                                onClick={() => handleProductSelect(product)}
                                className="w-full p-3 text-left text-sm hover:bg-green-50 rounded-lg transition-colors border border-gray-100 hover:border-green-200"
                              >
                                <div className="flex items-center">
                                  <div className="relative w-12 h-12 mr-3">
                                    {product.imageUrl ? (
                                      <img
                                        src={product.imageUrl}
                                        alt={product.productName}
                                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                        onError={(e) => {
                                          console.log('Image failed to load:', product.imageUrl);
                                          e.target.style.display = 'none';
                                          e.target.nextSibling.style.display = 'flex';
                                        }}
                                        onLoad={() => {
                                          console.log('Image loaded successfully:', product.imageUrl);
                                        }}
                                      />
                                    ) : null}
                                    <div 
                                      className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 absolute top-0 left-0"
                                      style={{ display: product.imageUrl ? 'none' : 'flex' }}
                                    >
                                      <Package className="w-6 h-6 text-gray-400" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 truncate">{product.productName}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {formatPrice(product.price)} • Stok: {product.stock}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!loadingAttachment && attachmentData.orders.length === 0 && attachmentData.products.length === 0 && (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-600">Tidak ada data ditemukan</p>
                      <p className="text-xs text-gray-500 mt-1">Belum ada pesanan atau produk dari toko ini</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={selectedAttachment ? "Tambahkan pesan (opsional)..." : "Ketik pesan..."}
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none max-h-32 min-h-[48px] shadow-sm"
            rows="1"
            autoComplete="off"
            spellCheck="false"
            disabled={disabled}
          />
        </div>
        
        {/* Emoji Button */}
        <div className="relative" ref={emojiPickerRef}>
          <button 
            type="button"
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">Pilih Emoji</h3>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <button
          type="submit"
          disabled={(!message.trim() && !selectedAttachment) || disabled}
          className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
            (message.trim() || selectedAttachment) && !disabled
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105 shadow-red-200'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
});

ChatInput.displayName = 'ChatInput';

export default ChatInput;