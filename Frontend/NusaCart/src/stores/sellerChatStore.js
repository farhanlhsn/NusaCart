import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import { chatAPI, tokoAPI, userAPI } from '../services/api';

const useSellerChatStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // State
        conversations: [],
        currentConversation: null,
        messages: {},
        myStores: [],
        loading: false,
        error: null,

        // Actions
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // Get conversations for seller (customers who messaged seller's stores)
        fetchSellerConversations: async () => {
          set({ loading: true, error: null });
          try {
            // First get seller's stores
            const storesResponse = await tokoAPI.getMyStores();
            const stores = storesResponse.data || [];
            
            if (stores.length === 0) {
              set({ 
                conversations: [], 
                myStores: [],
                loading: false 
              });
              return [];
            }

            set({ myStores: stores });

            // Get all unique customers who have messaged any of seller's stores
            const allConversations = [];
            const uniqueCustomers = new Map();
            const customerIds = new Set();
            const customerNames = new Map();

            // First pass: collect all chats and customer IDs
            for (const store of stores) {
              try {
                // Get chat history for this store using seller's user ID
                console.log('Fetching chats for store:', store.namaToko, 'seller ID:', store.idSeller);
                
                // Backend limitation: getChatHistory(receiverId) only gets chats where 
                // current user is sender, receiverId is receiver
                // We need bidirectional chats, so let's try multiple approaches
                
                let allChats = [];
                
                // Approach 1: Get chats where seller sent to others (current method)
                try {
                  const chatResponse = await chatAPI.getChatHistory(store.idSeller);
                  const chats = chatResponse.data || [];
                  allChats.push(...chats);
                  console.log('Chats where seller is receiver (from seller->seller calls):', chats);
                } catch (error) {
                  console.log('Error getting seller sent chats:', error);
                }
                
                // Approach 2: Try some potential customer IDs as receiverId to find incoming messages
                // This is a workaround since we can't directly query "where receiverId = seller"
                const potentialCustomerIds = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
                
                for (const customerId of potentialCustomerIds) {
                  if (customerId === store.idSeller) continue; // Skip self
                  
                  try {
                    // Try to get chats where we use customer as receiverId
                    // This might reveal chats where customer->seller if the API allows it
                    const customerChatResponse = await chatAPI.getChatHistory(customerId);
                    const customerChats = customerChatResponse.data || [];
                    
                    // Filter for chats involving this seller
                    const relevantChats = customerChats.filter(chat => 
                      chat.senderId === store.idSeller || chat.receiverId === store.idSeller
                    );
                    
                    if (relevantChats.length > 0) {
                      console.log(`Found chats involving seller from customer ${customerId}:`, relevantChats);
                      allChats.push(...relevantChats);
                    }
                  } catch (error) {
                    // Silent fail - customer might not exist or we don't have permission
                  }
                }
                
                // Remove duplicates based on chatId
                const uniqueChatsMap = new Map();
                allChats.forEach(chat => {
                  uniqueChatsMap.set(chat.chatId, chat);
                });
                const chats = Array.from(uniqueChatsMap.values());
                
                console.log('Chat data for store', store.namaToko, ':', chats);

                // Group chats by customer and collect customer IDs
                for (const chat of chats) {
                  console.log('Processing chat:', chat);
                  console.log('Seller ID:', store.idSeller, 'Chat senderId:', chat.senderId, 'Chat receiverId:', chat.receiverId);
                  
                  // Determine customer ID based on who is NOT the seller
                  let customerId;
                  
                  if (chat.senderId === store.idSeller) {
                    // Seller sent message to customer
                    customerId = chat.receiverId;
                  } else if (chat.receiverId === store.idSeller) {
                    // Customer sent message to seller
                    customerId = chat.senderId;
                  } else {
                    // Neither sender nor receiver is this seller - skip
                    console.log('Chat does not involve this seller, skipping');
                    continue;
                  }
                  
                  // Skip if customer ID is same as seller (conversation with self)
                  if (customerId === store.idSeller) {
                    console.log('Skipping self-conversation');
                    continue;
                  }
                  
                  console.log('Customer ID identified:', customerId);
                  customerIds.add(customerId);
                  
                  const conversationKey = `customer_${customerId}_store_${store.idToko}`;
                  
                  // Compare timestamps (handle time-only format)
                  const currentChatTime = chat.timestamp;
                  const existingConversation = uniqueCustomers.get(customerId);
                  
                  let shouldUpdate = !uniqueCustomers.has(customerId);
                  
                  if (existingConversation) {
                    // For time-only format (HH:mm), we'll treat later times as more recent
                    if (currentChatTime.match(/^\d{2}:\d{2}$/) && existingConversation.lastMessageTime.match(/^\d{2}:\d{2}$/)) {
                      shouldUpdate = currentChatTime > existingConversation.lastMessageTime;
                    } else {
                      // For full timestamps
                      const currentDate = new Date(currentChatTime);
                      const existingDate = new Date(existingConversation.lastMessageTime);
                      shouldUpdate = !isNaN(currentDate.getTime()) && !isNaN(existingDate.getTime()) && currentDate > existingDate;
                    }
                  }
                  
                  if (shouldUpdate) {
                    
                    uniqueCustomers.set(customerId, {
                      id: conversationKey,
                      customerId: customerId,
                      customerName: `Customer ${customerId}`, // Temporary name
                      customerAvatar: `https://ui-avatars.com/api/?name=Customer%20${customerId}&background=3b82f6&color=fff&size=100`,
                      storeId: store.idToko,
                      storeName: store.namaToko,
                      lastMessage: chat.message.length > 50 ? chat.message.substring(0, 50) + '...' : chat.message,
                      lastMessageTime: chat.timestamp,
                      unreadCount: 0, // TODO: Calculate actual unread count
                      online: Math.random() > 0.5, // TODO: Get real online status
                      lastSeen: chat.timestamp,
                      rating: null // TODO: Get customer rating if available
                    });
                  }
                }
              } catch (storeError) {
                console.log('No chats found for store:', store.namaToko, storeError);
              }
            }

            // Second pass: fetch customer names for all unique customers
            console.log('Fetching names for customer IDs:', Array.from(customerIds));
            for (const customerId of customerIds) {
              try {
                const userResponse = await userAPI.getById(customerId);
                const customerName = userResponse.data?.name || userResponse.data?.username || `Customer ${customerId}`;
                customerNames.set(customerId, customerName);
                console.log(`Successfully got customer name for ID ${customerId}: ${customerName}`);
              } catch (userError) {
                console.log('Could not fetch customer name for ID:', customerId, '- using fallback name');
                customerNames.set(customerId, `Customer ${customerId}`);
              }
            }

            // Third pass: update customer names and avatars
            for (const [customerId, conversation] of uniqueCustomers) {
              const customerName = customerNames.get(customerId) || `Customer ${customerId}`;
              conversation.customerName = customerName;
              conversation.customerAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=3b82f6&color=fff&size=100`;
            }

            // Convert Map to Array and sort by last message time
            const conversations = Array.from(uniqueCustomers.values())
              .sort((a, b) => {
                // Handle time-only format (HH:mm)
                if (a.lastMessageTime.match(/^\d{2}:\d{2}$/) && b.lastMessageTime.match(/^\d{2}:\d{2}$/)) {
                  return b.lastMessageTime.localeCompare(a.lastMessageTime);
                }
                
                // Handle full timestamps
                const dateA = new Date(a.lastMessageTime);
                const dateB = new Date(b.lastMessageTime);
                
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                  // Fallback to string comparison if dates are invalid
                  return b.lastMessageTime.localeCompare(a.lastMessageTime);
                }
                
                return dateB - dateA;
              });

            console.log('Final conversations:', conversations);

            set({
              conversations: conversations,
              loading: false
            });

            return conversations;
          } catch (error) {
            console.error('Error fetching seller conversations:', error);
            set({
              conversations: [],
              loading: false,
              error: 'Failed to load conversations'
            });
            return [];
          }
        },

        // Get messages for a conversation from seller perspective
        fetchMessages: async (conversationId) => {
          set({ loading: true, error: null });
          try {
            // Extract customer ID from conversation ID
            const customerIdMatch = conversationId.match(/customer_(\d+)_store_(\d+)/);
            if (!customerIdMatch) {
              throw new Error('Invalid conversation ID format');
            }

            const customerId = parseInt(customerIdMatch[1]);
            const storeId = parseInt(customerIdMatch[2]);

            console.log('Fetching messages for seller conversation:', { conversationId, customerId, storeId });

            // Get the store info to get seller ID
            const { myStores } = get();
            const store = myStores.find(s => s.idToko === storeId);
            
            if (!store) {
              throw new Error('Store not found');
            }

            // Get all chat history involving this seller (bidirectional)
            let allChats = [];
            
            // Method 1: Direct call (gets chats where seller sent to others)
            try {
              const response1 = await chatAPI.getChatHistory(store.idSeller);
              const chats1 = response1.data || [];
              allChats.push(...chats1);
            } catch (error) {
              console.log('Error getting direct seller chats:', error);
            }
            
            // Method 2: Try calling with customer ID to find chats where customer sent to seller
            try {
              const response2 = await chatAPI.getChatHistory(customerId);
              const chats2 = response2.data || [];
              // Filter for chats involving this seller
              const relevantChats = chats2.filter(chat => 
                chat.senderId === store.idSeller || chat.receiverId === store.idSeller
              );
              allChats.push(...relevantChats);
            } catch (error) {
              console.log('Error getting customer->seller chats:', error);
            }
            
            // Remove duplicates
            const uniqueChatsMap = new Map();
            allChats.forEach(chat => {
              uniqueChatsMap.set(chat.chatId, chat);
            });
            const allUniqueChats = Array.from(uniqueChatsMap.values());
            
            console.log('All chats for seller:', allUniqueChats);

            // Filter messages for this specific customer conversation
            const conversationMessages = allUniqueChats
              .filter(chat => {
                // Include messages where:
                // 1. Customer sent to seller
                // 2. Seller sent to customer
                return (chat.senderId === customerId && chat.receiverId === store.idSeller) ||
                       (chat.senderId === store.idSeller && chat.receiverId === customerId);
              })
              .map(chat => ({
                id: chat.chatId,
                conversationId,
                text: chat.message,
                senderId: chat.senderId,
                senderType: chat.senderId === store.idSeller ? 'seller' : 'customer',
                timestamp: chat.timestamp,
                status: 'read',
                productId: chat.productId,
                orderId: chat.orderId
              }))
              .sort((a, b) => {
                // Handle time-only format (HH:mm)
                if (a.timestamp.match(/^\d{2}:\d{2}$/) && b.timestamp.match(/^\d{2}:\d{2}$/)) {
                  return a.timestamp.localeCompare(b.timestamp);
                }
                
                // Handle full timestamps
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                  // Fallback to string comparison if dates are invalid
                  return a.timestamp.localeCompare(b.timestamp);
                }
                
                return dateA - dateB;
              });

            console.log('Filtered conversation messages:', conversationMessages);

            set(state => ({
              messages: {
                ...state.messages,
                [conversationId]: conversationMessages
              },
              loading: false
            }));

            return conversationMessages;
          } catch (error) {
            console.error('Error fetching seller messages:', error);
            
            // Fallback to empty messages
            set(state => ({
              messages: {
                ...state.messages,
                [conversationId]: []
              },
              loading: false,
              error: null
            }));

            return [];
          }
        },

        // Send message as seller
        sendMessage: async (conversationId, messageText) => {
          if (!messageText.trim()) return;

          try {
            // Extract customer ID from conversation ID
            const customerIdMatch = conversationId.match(/customer_(\d+)_store_(\d+)/);
            if (!customerIdMatch) {
              throw new Error('Invalid conversation ID format');
            }

            const customerId = parseInt(customerIdMatch[1]);
            const storeId = parseInt(customerIdMatch[2]);

            console.log('Sending message as seller:', { conversationId, customerId, storeId, messageText });

            // Get the store info to get seller ID
            const { myStores } = get();
            const store = myStores.find(s => s.idToko === storeId);
            
            if (!store) {
              throw new Error('Store not found');
            }

            // Send message to backend
            const messageData = {
              receiverId: customerId,
              message: messageText.trim(),
              productId: null,
              orderId: null
            };

            console.log('Sending message data:', messageData);
            const response = await chatAPI.sendMessage(messageData);
            const savedMessage = response.data;

            console.log('Backend response:', savedMessage);

            // Transform backend response to frontend format
            const newMessage = {
              id: savedMessage.chatId,
              conversationId,
              text: savedMessage.message,
              senderId: savedMessage.senderId,
              senderType: 'seller',
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
                  ? { 
                      ...conv, 
                      lastMessage: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''), 
                      lastMessageTime: new Date().toISOString(),
                      unreadCount: 0 // Reset unread count since seller is responding
                    }
                  : conv
              )
            }));

            return newMessage;
          } catch (error) {
            console.error('Error sending seller message:', error);
            
            // Create failed message for optimistic UI
            const tempId = Date.now();
            const failedMessage = {
              id: tempId,
              conversationId,
              text: messageText.trim(),
              senderId: 'seller',
              senderType: 'seller',
              timestamp: new Date().toISOString(),
              status: 'failed'
            };

            set(state => ({
              messages: {
                ...state.messages,
                [conversationId]: [
                  ...(state.messages[conversationId] || []),
                  failedMessage
                ]
              },
              error: 'Failed to send message'
            }));

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

        // Clear chat data
        clearSellerChatData: () => {
          set({
            conversations: [],
            currentConversation: null,
            messages: {},
            myStores: [],
            error: null
          });
        }
      }),
      {
        name: 'seller-chat-storage',
        partialize: (state) => ({
          conversations: state.conversations,
          messages: state.messages,
          myStores: state.myStores
        }),
      }
    )
  )
);

export default useSellerChatStore; 