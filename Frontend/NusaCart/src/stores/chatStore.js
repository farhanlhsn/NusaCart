import { create } from 'zustand';
import { chatAPI, tokoAPI } from '../services/api';
import useAuthStore from './authStore';

const useChatStore = create((set, get) => ({
      // State
      conversations: [],
      currentConversation: null,
      messages: {},
      loading: false,
      error: null,
      storeInfo: {},
      lastFetchTime: null, // Add caching timestamp

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Get conversations - using mock data since backend doesn't have chat yet
      fetchConversations: async (forceRefresh = false) => {
        const { conversations, lastFetchTime } = get();
        
        // Cache for 5 minutes to prevent unnecessary refetches
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();
        
        if (!forceRefresh && conversations.length > 0 && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
          return conversations; // Return cached data
        }
        
        set({ loading: true, error: null });
        try {
          // For now, use toko API to get stores and create mock conversations
          const response = await tokoAPI.getAll(0, 10);
          const stores = response.data.data || response.data.content || [];
          
          // Create mock conversations from stores with stable data
          const baseTime = new Date('2024-01-15T10:00:00Z'); // Fixed base time
          const mockConversations = stores.map((store, index) => {
            // Create varied last messages
            const lastMessages = [
              'Halo, ada yang bisa saya bantu?',
              'Selamat datang di toko kami!',
              'Terima kasih sudah berkunjung',
              'Ada pertanyaan tentang produk?',
              'Silakan lihat koleksi terbaru kami',
              'Produk ready stock ya!',
              'Bisa chat untuk info lebih lanjut',
              'Promo menarik hari ini!'
            ];
            
            return {
              id: store.idToko,
              storeId: store.idToko,
              storeName: store.namaToko,
              storeAvatar: store.profilePictureToko 
                ? (store.profilePictureToko.startsWith('http') 
                   ? store.profilePictureToko 
                   : `http://localhost:6060${store.profilePictureToko}`)
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(store.namaToko)}&background=ef4444&color=fff&size=100`,
              lastMessage: lastMessages[index % lastMessages.length],
              lastMessageTime: new Date(baseTime.getTime() - (index * 3600000)).toISOString(), // Stable time based on index
              unreadCount: 0,
              online: false, // Remove online status
              type: 'store'
            };
          });

          set({
            conversations: mockConversations,
            loading: false,
            lastFetchTime: Date.now()
          });

          return mockConversations;
        } catch (error) {
          console.log('Chat fetch error, using fallback:', error);
          
          // Fallback mock data with stable timestamps
          const fallbackBaseTime = new Date('2024-01-15T10:00:00Z');
          const fallbackConversations = [
            {
              id: 1,
              storeId: 1,
              storeName: 'Electronics Store',
              storeAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
              lastMessage: 'Halo, ada yang bisa saya bantu?',
              lastMessageTime: fallbackBaseTime.toISOString(),
              unreadCount: 0,
              online: false,
              type: 'store'
            },
            {
              id: 2,
              storeId: 2,
              storeName: 'Fashion Outlet',
              storeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
              lastMessage: 'Selamat datang di toko kami!',
              lastMessageTime: new Date(fallbackBaseTime.getTime() - 3600000).toISOString(),
              unreadCount: 0,
              online: false,
              type: 'store'
            }
          ];

          set({
            conversations: fallbackConversations,
            loading: false,
            lastFetchTime: Date.now()
          });

          return fallbackConversations;
        }
      },

      // Get messages for a conversation using real backend
      fetchMessages: async (conversationId) => {
        const { messages } = get();
        
        // Return cached messages if available
        if (messages[conversationId] && messages[conversationId].length > 0) {
          return messages[conversationId];
        }
        
        set({ loading: true, error: null });
        try {
          const { user } = useAuthStore.getState();
          // Get store info first
          const storeInfo = await get().fetchStoreInfo(conversationId);
          const sellerId = storeInfo?.idSeller || storeInfo?.seller?.userId || storeInfo?.sellerId || conversationId;

          if (!sellerId) {
            console.error('Store info:', storeInfo);
            console.error('Conversation ID:', conversationId);
            throw new Error('Seller ID not found in store data');
          }
          
          // Ambil userId lawan chat (sellerId) dan user login (user.userId)
          const userId = user?.userId;
          // Fetch real chat history from backend
          const response = await chatAPI.getChatHistory(sellerId);
          const chatHistory = response.data || [];

          // Transform backend data to frontend format
          const transformedMessages = chatHistory.map(chat => ({
            id: chat.chatId,
            conversationId,
            text: chat.message,
            senderId: chat.senderId,
            senderType: chat.senderId === userId ? 'user' : 'store',
            timestamp: chat.timestamp,
            status: 'read',
            productId: chat.productId,
            orderId: chat.orderId
          }));

          // If no messages, create welcome message
          if (transformedMessages.length === 0) {
            const storeName = storeInfo?.namaToko || 'Toko Kami';
            const storeLocation = storeInfo?.alamatToko || 'Indonesia';
            
            const welcomeMessage = {
              id: Date.now(),
              conversationId,
              text: `Selamat datang di ${storeName}! 👋\n\nKami berlokasi di ${storeLocation}. Ada yang bisa kami bantu?`,
              senderId: sellerId,
              senderType: 'store',
              timestamp: new Date().toISOString(),
              status: 'read'
            };
            transformedMessages.push(welcomeMessage);
          }

          set(state => ({
            messages: {
              ...state.messages,
              [conversationId]: transformedMessages
            },
            loading: false
          }));

          return transformedMessages;
        } catch (error) {
          console.error('Error fetching messages:', error);
          // Fallback to welcome message only
          const fallbackMessages = [
            {
              id: Date.now(),
              conversationId,
              text: 'Selamat datang di toko kami! Ada yang bisa kami bantu?',
              senderId: conversationId,
              senderType: 'store',
              timestamp: new Date().toISOString(),
              status: 'read'
            }
          ];

          set(state => ({
            messages: {
              ...state.messages,
              [conversationId]: fallbackMessages
            },
            loading: false,
            error: null
          }));

          return fallbackMessages;
        }
      },

      // Send a message using real backend
      sendMessage: async (conversationId, messagePayload) => {
        // Handle both old string format and new object format
        const isStringMessage = typeof messagePayload === 'string';
        const messageText = isStringMessage ? messagePayload : messagePayload.text;
        const orderId = isStringMessage ? null : messagePayload.orderId;
        const productId = isStringMessage ? null : messagePayload.productId;

        if (!messageText.trim() && !orderId && !productId) return;
        
        try {
          const { user } = useAuthStore.getState();
          // Get store info to get seller ID
          const storeInfo = await get().fetchStoreInfo(conversationId);
          const sellerId = storeInfo?.idSeller || storeInfo?.seller?.userId || storeInfo?.sellerId || conversationId;

          if (!sellerId) {
            console.error('Store info for sendMessage:', storeInfo);
            console.error('Conversation ID:', conversationId);
            throw new Error('Seller ID not found in store data');
          }
          
          // receiverId = sellerId (userId lawan chat)
          const messageData = {
            receiverId: sellerId,
            message: messageText.trim() || '',
            productId: productId || null,
            orderId: orderId || null
          };

          console.log('Sending message with payload:', messageData);

          const response = await chatAPI.sendMessage(messageData);
          const savedMessage = response.data;

          // Transform backend response to frontend format
          const newMessage = {
            id: savedMessage.chatId,
            conversationId,
            text: savedMessage.message,
            senderId: savedMessage.senderId,
            senderType: savedMessage.senderId === user?.userId ? 'user' : 'store',
            timestamp: savedMessage.timestamp,
            status: 'sent',
            productId: savedMessage.productId,
            orderId: savedMessage.orderId
          };

          // Update last message preview
          const lastMessageText = messageText.trim() || 
            (orderId ? `Lampiran Pesanan #${orderId}` : '') ||
            (productId ? `Lampiran Produk` : '');

          set(state => ({
            messages: {
              ...state.messages,
              [conversationId]: [
                ...(state.messages[conversationId] || []),
                newMessage
              ]
            },
            conversations: state.conversations.map(conv =>
              conv.id === conversationId 
                ? { 
                    ...conv, 
                    lastMessage: lastMessageText.substring(0, 50) + (lastMessageText.length > 50 ? '...' : ''), 
                    lastMessageTime: new Date().toISOString() 
                  }
                : conv
            )
          }));

          return newMessage;
        } catch (error) {
          console.error('Error sending message:', error);
          // Fallback to optimistic update if backend fails
          const { user } = useAuthStore.getState();
          const tempId = Date.now();
          const fallbackMessage = {
            id: tempId,
            conversationId,
            text: messageText.trim() || (orderId ? `Lampiran Pesanan #${orderId}` : '') || (productId ? `Lampiran Produk` : ''),
            senderId: user?.userId || 'current_user',
            senderType: 'user',
            timestamp: new Date().toISOString(),
            status: 'failed',
            productId: productId || null,
            orderId: orderId || null
          };

          set(state => ({
            messages: {
              ...state.messages,
              [conversationId]: [
                ...(state.messages[conversationId] || []),
                fallbackMessage
              ]
            }
          }));

          return fallbackMessage;
        }
      },

      // Start conversation with a store
      startConversation: async (storeId, storeName) => {
        try {
          // Check if conversation already exists
          const { conversations } = get();
          const existingConversation = conversations.find(conv => conv.storeId === storeId);
          
          if (existingConversation) {
            return existingConversation;
          }

          // Create new conversation
          const newConversation = {
            id: storeId,
            storeId,
            storeName,
            storeAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=ef4444&color=fff&size=100`,
            lastMessage: 'Mulai percakapan',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            online: false,
            type: 'store'
          };

          set(state => ({
            conversations: [newConversation, ...state.conversations]
          }));

          return newConversation;
        } catch (error) {
          set({ error: 'Failed to start conversation' });
          throw error;
        }
      },

      // Set current conversation
      setCurrentConversation: (conversation) => {
        set({ currentConversation: conversation });
        
        // Mark as read
        if (conversation && conversation.unreadCount > 0) {
          set(state => ({
            conversations: state.conversations.map(conv =>
              conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
            )
          }));
        }
      },

      // Get store info with caching
      fetchStoreInfo: async (storeId) => {
        const { storeInfo } = get();
        
        // Return cached data if available
        if (storeInfo[storeId]) {
          return storeInfo[storeId];
        }
        
        try {
          const response = await tokoAPI.getById(storeId);
          const storeData = response.data;
          
          set(state => ({
            storeInfo: {
              ...state.storeInfo,
              [storeId]: storeData
            }
          }));

          return storeData;
        } catch (error) {
          console.log('Failed to fetch store info:', error);
          return null;
        }
      },

      // Clear chat data
      clearChatData: () => {
        set({
          conversations: [],
          currentConversation: null,
          messages: {},
          storeInfo: {},
          error: null
        });
      }
    })
);

export default useChatStore; 