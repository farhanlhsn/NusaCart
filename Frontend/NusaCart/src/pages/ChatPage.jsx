import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Search, 
    Send, 
    Paperclip, 
    Smile, 
    MoreVertical, 
    Info,
    ArrowLeft,
    Image,
    X,
    Check,
    CheckCheck,
    Shield,
    Flag,
    User
} from "lucide-react";
import ReportChat from '../components/ReportChat';
import ChatInput from '../components/ChatInput';
import ChatItem from '../components/ChatItem';
import AttachmentCard from '../components/AttachmentCard';
import useChatStore from '../stores/chatStore';
import useAuthStore from '../stores/authStore';

export default function ChatPage() {
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [selectedChat, setSelectedChat] = useState(null);
    // Removed message state as it's now handled by ChatInput
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatList, setShowChatList] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportedUserId, setReportedUserId] = useState(null);

    const { user } = useAuthStore();
    
    // Use individual selectors to avoid infinite loops
    const conversations = useChatStore(state => state.conversations);
    const currentConversation = useChatStore(state => state.currentConversation);
    const messages = useChatStore(state => state.messages);
    const loading = useChatStore(state => state.loading);
    const error = useChatStore(state => state.error);
    const fetchConversations = useChatStore(state => state.fetchConversations);
    const fetchMessages = useChatStore(state => state.fetchMessages);
    const sendMessage = useChatStore(state => state.sendMessage);
    const setCurrentConversation = useChatStore(state => state.setCurrentConversation);
    const fetchStoreInfo = useChatStore(state => state.fetchStoreInfo);
    const clearError = useChatStore(state => state.clearError);

    // Load conversations when component mounts
    useEffect(() => {
        if (user?.userId) {
            fetchConversations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.userId]); // Only depend on user ID to prevent loops

    // Load messages when conversation changes
    useEffect(() => {
        if (currentConversation?.id) {
            fetchMessages(currentConversation.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentConversation?.id]); // Only depend on conversation ID

    const handleOpenReport = async () => {
        try {
            if (currentConversation?.id) {
                const storeInfo = await fetchStoreInfo(currentConversation.id);
                const sellerId = storeInfo?.idSeller || storeInfo?.seller?.userId || storeInfo?.sellerId || currentConversation.id;
                setReportedUserId(sellerId);
                setIsReportModalOpen(true);
            }
        } catch (error) {
            console.error('Error getting store info for report:', error);
            // Fallback to conversation id if store info fails
            setReportedUserId(currentConversation?.id);
            setIsReportModalOpen(true);
        }
    };

    const handleCloseReport = () => {
        setIsReportModalOpen(false);
        setReportedUserId(null);
    };



    const currentMessages = useMemo(() => 
        currentConversation?.id ? (messages[currentConversation.id] || []) : [],
        [currentConversation?.id, messages]
    );

    // Debounce search query to prevent excessive filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    
    const filteredChats = useMemo(() => 
        conversations.filter(chat => 
            chat.storeName.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        ),
        [conversations, debouncedSearchQuery]
    );

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom();
            setShouldAutoScroll(false);
        }
    }, [shouldAutoScroll]);

    // Scroll ke bawah saat membuka chat yang berbeda
    useEffect(() => {
        if (selectedChat) {
            // Gunakan setTimeout untuk memastikan DOM sudah terender
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }, [selectedChat]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setShowChatList(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.dropdown-container')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDropdown]);

    const handleSendMessage = useCallback(async (messageData) => {
        // Handle both string (old format) and object (new format) inputs
        const isStringMessage = typeof messageData === 'string';
        
        if (isStringMessage) {
            // Old format: just text
            if (messageData && currentConversation) {
                try {
                    await sendMessage(currentConversation.id, messageData);
                    setShouldAutoScroll(true);
                } catch (error) {
                    console.error('Failed to send message:', error);
                }
            }
        } else {
            // New format: object with text and attachment
            if ((messageData.text || messageData.attachment) && currentConversation) {
                try {
                    // Prepare message payload for backend
                    const payload = {
                        text: messageData.text || '',
                        orderId: messageData.attachment?.type === 'order' ? messageData.attachment.id : null,
                        productId: messageData.attachment?.type === 'product' ? messageData.attachment.id : null
                    };
                    
                    await sendMessage(currentConversation.id, payload);
                    setShouldAutoScroll(true);
                } catch (error) {
                    console.error('Failed to send message:', error);
                }
            }
        }
    }, [currentConversation, sendMessage]);

    // Removed handleKeyPress as it's now handled by ChatInput

    const formatTime = useCallback((timestamp) => {
        if (!timestamp) return '';
        
        // Handle time-only format from backend (e.g., "23:37")
        if (typeof timestamp === 'string' && timestamp.match(/^\d{2}:\d{2}$/)) {
            return timestamp; // Return as-is since it's already formatted time
        }
        
        // Handle full timestamp
        const date = new Date(timestamp);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return timestamp; // Return original if can't parse
        }
        
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } else {
            return date.toLocaleDateString('id-ID', { 
                day: '2-digit', 
                month: 'short' 
            });
        }
    }, []);

    const renderMessageStatus = (status) => {
        switch (status) {
            case 'sending':
                return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
            case 'sent':
                return <Check className="w-4 h-4 text-gray-400" />;
            case 'delivered':
                return <CheckCheck className="w-4 h-4 text-gray-400" />;
            case 'read':
                return <CheckCheck className="w-4 h-4 text-blue-500" />;
            case 'failed':
                return <X className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    const handleChatSelect = useCallback((chat) => {
        setSelectedChat(chat.id);
        setCurrentConversation(chat);
        if (isMobileView) {
            setShowChatList(false);
        }
    }, [isMobileView, setCurrentConversation]);

    const handleBlockUser = () => {
        // Handle block user logic
        console.log('Block user:', currentConversation?.storeName);
        setShowDropdown(false);
        // You would typically show a confirmation dialog here
    };

    const handleViewProfile = () => {
        // Handle view profile logic
        console.log('View profile:', currentConversation?.storeName);
        navigate(`/toko/${currentConversation?.storeId}`);
        setShowDropdown(false);
    };

    

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
                    <p className="text-gray-600">You need to login to access chat feature</p>
                </div>
            </div>
        );
    }

    const ChatListSidebar = () => (
        <div className={`${isMobileView && !showChatList ? 'hidden' : 'flex'} flex-col w-full md:w-90 bg-white border-r border-gray-200 h-full`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Pesan</h1>
                    {isMobileView && (
                        <button 
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    )}
                </div>
                
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Cari percakapan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                    </div>
                ) : filteredChats.length === 0 ? (
                    <div className="text-center p-8">
                        <p className="text-gray-500">Tidak ada percakapan ditemukan</p>
                    </div>
                ) : (
                    filteredChats.map((chat) => (
                        <ChatItem
                            key={chat.id}
                            chat={chat}
                            isSelected={selectedChat === chat.id}
                            onSelect={handleChatSelect}
                            formatTime={formatTime}
                        />
                    ))
                )}
            </div>
        </div>
    );

    const ChatArea = () => (
        <div className={`${isMobileView && showChatList ? 'hidden' : 'flex'} flex-col flex-1 h-full bg-gradient-to-b from-gray-50 to-gray-100`}>
            {currentConversation ? (
                <>
                    {/* Chat Header */}
                    <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                {isMobileView && (
                                    <button 
                                        onClick={() => setShowChatList(true)}
                                        className="mr-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                )}
                                <div className="relative">
                                    <img
                                        key={`header-avatar-${currentConversation.id}`}
                                        src={currentConversation.storeAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentConversation.storeName)}&background=ef4444&color=fff&size=100`}
                                        alt={currentConversation.storeName}
                                        className="w-12 h-12 rounded-full object-cover shadow-md"
                                        onError={(e) => {
                                            // Prevent infinite loop by checking if already using fallback
                                            if (!e.target.src.includes('ui-avatars.com')) {
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentConversation.storeName)}&background=ef4444&color=fff&size=100`;
                                            }
                                        }}
                                        loading="lazy"
                                    />

                                </div>
                                <div className="ml-4">
                                    <h2 className="font-semibold text-gray-900 flex items-center">
                                        {currentConversation.storeName}
                                        {currentConversation.type === 'store' && (
                                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                Toko
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {currentConversation.lastMessage}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 relative dropdown-container">
                                <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <Info className="w-5 h-5 text-gray-600" />
                                </button>
                                <button 
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
                                >
                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                </button>
                                
                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                        <button
                                            onClick={handleViewProfile}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                                        >
                                            <User className="w-4 h-4 mr-3 text-gray-500" />
                                            Lihat Profil
                                        </button>
                                        <hr className="my-2 border-gray-100" />
                                        <button
                                            onClick={handleBlockUser}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                        >
                                            <Shield className="w-4 h-4 mr-3" />
                                            Blokir Pengguna
                                        </button>
                                        <button
                                            onClick={handleOpenReport}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                        >
                                            <Flag className="w-4 h-4 mr-3" />
                                            Laporkan Pengguna
                                        </button>

                                        <ReportChat
                                            isOpen={isReportModalOpen}
                                            onClose={handleCloseReport}
                                            reportedUserId={reportedUserId}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                        {loading && currentMessages.length === 0 ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                            </div>
                        ) : currentMessages.length === 0 ? (
                            <div className="text-center p-8">
                                <p className="text-gray-500">Belum ada pesan dalam percakapan ini</p>
                            </div>
                        ) : (
                            currentMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs lg:max-w-md ${msg.senderType === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                                        {/* Message Text */}
                                        {msg.text && (
                                            <div
                                                className={`px-4 py-3 rounded-2xl shadow-sm ${
                                                    msg.senderType === 'user'
                                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                                        : 'bg-white text-gray-900 border border-gray-200'
                                                }`}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                                                <div className={`flex items-center justify-end mt-2 space-x-1 ${
                                                    msg.senderType === 'user' ? 'text-red-100' : 'text-gray-500'
                                                }`}>
                                                    <span className="text-xs">{formatTime(msg.timestamp)}</span>
                                                    {msg.senderType === 'user' && renderMessageStatus(msg.status)}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Attachment */}
                                        {(msg.orderId || msg.productId) && (
                                            <AttachmentCard
                                                type={msg.orderId ? 'order' : 'product'}
                                                orderId={msg.orderId}
                                                productId={msg.productId}
                                                data={null} // We could fetch this data if needed
                                            />
                                        )}
                                        
                                        {/* Timestamp for attachment-only messages */}
                                        {!msg.text && (msg.orderId || msg.productId) && (
                                            <div className={`mt-1 text-xs ${
                                                msg.senderType === 'user' ? 'text-gray-500 text-right' : 'text-gray-500'
                                            }`}>
                                                {formatTime(msg.timestamp)}
                                                {msg.senderType === 'user' && (
                                                    <span className="ml-1">
                                                        {renderMessageStatus(msg.status)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <ChatInput 
                        onSendMessage={handleSendMessage}
                        disabled={loading}
                        currentConversation={currentConversation}
                    />
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Search className="w-16 h-16 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Pilih Chat untuk Memulai
                        </h3>
                        <p className="text-gray-600 text-lg">
                            Pilih percakapan dari sidebar untuk mulai chat
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
            <div className="flex w-full max-w-6xl h-full bg-white shadow-2xl rounded-3xl overflow-hidden">
                <ChatListSidebar />
                <ChatArea />
            </div>
        </div>
    );
}