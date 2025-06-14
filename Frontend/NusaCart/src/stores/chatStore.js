import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { chatAPI, tokoAPI } from '../services/api';

const useChatStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
      // State
      conversations: [],
      currentConversation: null,
      messages: {},
      loading: false,
      error: null,
      storeInfo: {},

      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Get conversations - using mock data since backend doesn't have chat yet
      fetchConversations: async () => {
        set({ loading: true, error: null });
        try {
          // For now, use toko API to get stores and create mock conversations
          const response = await tokoAPI.getAll(0, 10);
          const stores = response.data.data || response.data.content || [];
          
          // Create mock conversations from stores
          const mockConversations = stores.map((store, index) => ({
            id: store.idToko,
            storeId: store.idToko,
            storeName: store.namaToko,
            storeAvatar: store.profilePictureToko 
              ? (store.profilePictureToko.startsWith('http') 
                 ? store.profilePictureToko 
                 : `http://localhost:6060${store.profilePictureToko}`)
              : `https://ui-avatars.com/api/?name=${encodeURIComponent(store.namaToko)}&background=ef4444&color=fff&size=100`,
            lastMessage: `Aktif • ${index < 3 ? 'Online sekarang' : `${index + 1} jam lalu`}`,
            lastMessageTime: new Date().toISOString(),
            unreadCount: index < 2 ? index + 1 : 0,
            online: Math.random() > 0.5,
            type: 'store'
          }));

          set({
            conversations: mockConversations,
            loading: false
          });

          return mockConversations;
        } catch (error) {
          console.log('Chat fetch error, using fallback:', error);
          
          // Fallback mock data
          const fallbackConversations = [
            {
              id: 1,
              storeId: 1,
              storeName: 'Electronics Store',
              storeAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
              lastMessage: 'Selamat datang di toko kami!',
              lastMessageTime: new Date().toISOString(),
              unreadCount: 2,
              online: true,
              type: 'store'
            },
            {
              id: 2,
              storeId: 2,
              storeName: 'Fashion Outlet',
              storeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
              lastMessage: 'Ada produk baru yang menarik!',
              lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
              unreadCount: 1,
              online: false,
              type: 'store'
            }
          ];

          set({
            conversations: fallbackConversations,
            loading: false
          });

          return fallbackConversations;
        }
      },

      // Get messages for a conversation using real backend
      fetchMessages: async (conversationId) => {
        set({ loading: true, error: null });
        try {
          // Get store info first
          const storeInfo = await get().fetchStoreInfo(conversationId);
          const sellerId = storeInfo?.idSeller || storeInfo?.seller?.userId || storeInfo?.sellerId || conversationId;

          if (!sellerId) {
            console.error('Store info:', storeInfo);
            console.error('Conversation ID:', conversationId);
            throw new Error('Seller ID not found in store data');
          }
          
          console.log('Using sellerId for fetchMessages:', sellerId);

          // Fetch real chat history from backend
          console.log('Calling chatAPI.getChatHistory with sellerId:', sellerId);
          const response = await chatAPI.getChatHistory(sellerId);
          const chatHistory = response.data || [];
          console.log('Chat history response:', chatHistory);

          // Transform backend data to frontend format
          const transformedMessages = chatHistory.map(chat => ({
            id: chat.chatId,
            conversationId,
            text: chat.message,
            senderId: chat.senderId,
            senderType: chat.senderId === sellerId ? 'store' : 'user',
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
      sendMessage: async (conversationId, messageText) => {
        if (!messageText.trim()) return;

        try {
          // Get store info to get seller ID
          const storeInfo = await get().fetchStoreInfo(conversationId);
          const sellerId = storeInfo?.idSeller || storeInfo?.seller?.userId || storeInfo?.sellerId || conversationId;

          if (!sellerId) {
            console.error('Store info for sendMessage:', storeInfo);
            console.error('Conversation ID:', conversationId);
            throw new Error('Seller ID not found in store data');
          }
          
          console.log('Using sellerId for sendMessage:', sellerId);

          // Send message to backend
          const messageData = {
            receiverId: sellerId,
            message: messageText.trim(),
            productId: null, // Can be set if needed
            orderId: null    // Can be set if needed
          };

          console.log('Sending message to backend:', messageData);
          const response = await chatAPI.sendMessage(messageData);
          const savedMessage = response.data;
          console.log('Send message response:', savedMessage);

          // Transform backend response to frontend format
          const newMessage = {
            id: savedMessage.chatId,
            conversationId,
            text: savedMessage.message,
            senderId: savedMessage.senderId,
            senderType: 'user',
            timestamp: savedMessage.timestamp,
            status: 'sent',
            productId: savedMessage.productId,
            orderId: savedMessage.orderId
          };

          // Add message to state
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
                ? { ...conv, lastMessage: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''), lastMessageTime: new Date().toISOString() }
                : conv
            )
          }));

          return newMessage;
        } catch (error) {
          console.error('Error sending message:', error);
          
          // Fallback to optimistic update if backend fails
          const tempId = Date.now();
          const fallbackMessage = {
            id: tempId,
            conversationId,
            text: messageText.trim(),
            senderId: 'current_user',
            senderType: 'user',
            timestamp: new Date().toISOString(),
            status: 'failed'
          };

          set(state => ({
            messages: {
              ...state.messages,
              [conversationId]: [
                ...(state.messages[conversationId] || []),
                fallbackMessage
              ]
            },
            error: 'Failed to send message'
          }));

          throw error;
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

      // Get store info
      fetchStoreInfo: async (storeId) => {
        try {
          console.log('Fetching store info for storeId:', storeId);
          const response = await tokoAPI.getById(storeId);
          const storeInfo = response.data;
          console.log('Store info response:', storeInfo);
          console.log('idSeller from response:', storeInfo?.idSeller);
          
          set(state => ({
            storeInfo: {
              ...state.storeInfo,
              [storeId]: storeInfo
            }
          }));

          return storeInfo;
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
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          conversations: state.conversations,
          messages: state.messages,
          storeInfo: state.storeInfo
        }),
      }
    )
  )
);

export default useChatStore; 