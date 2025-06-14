import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { 
    Search, 
    MoreVertical, 
    ArrowLeft, 
    Check, 
    CheckCheck, 
    X,
    User,
    Shield,
    Flag,
    Info,
    Clock,
    MessageCircle,
    Star,
    RefreshCw
} from "lucide-react";
import ChatInput from '../components/ChatInput';
import ReportChat from '../components/ReportChat';
import useSellerChatStore from '../stores/sellerChatStore';
import useAuthStore from '../stores/authStore';

export default function SellerChatPage() {
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatList, setShowChatList] = useState(true);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const { user } = useAuthStore();
    const {
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        fetchSellerConversations,
        fetchMessages,
        sendMessage,
        setCurrentConversation,
        clearError
    } = useSellerChatStore();

    // Load conversations when component mounts
    const fetchConversationsRef = useRef(fetchSellerConversations);
    const fetchMessagesRef = useRef(fetchMessages);
    
    useEffect(() => {
        fetchConversationsRef.current = fetchSellerConversations;
        fetchMessagesRef.current = fetchMessages;
    });

    useEffect(() => {
        if (user) {
            fetchConversationsRef.current();
        }
    }, [user]);

    // Load messages when conversation changes
    useEffect(() => {
        if (currentConversation?.id) {
            fetchMessagesRef.current(currentConversation.id);
        }
    }, [currentConversation?.id]);

    const currentMessages = useMemo(() => 
        currentConversation?.id ? (messages[currentConversation.id] || []) : [],
        [currentConversation?.id, messages]
    );

    const filteredChats = conversations.filter(chat => 
        chat.customerName.toLowerCase().includes(searchQuery.toLowerCase())
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

    useEffect(() => {
        if (selectedChat) {
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

    const handleSendMessage = useCallback(async (messageText) => {
        if (messageText && currentConversation) {
            try {
                await sendMessage(currentConversation.id, messageText);
                setShouldAutoScroll(true);
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
    }, [currentConversation, sendMessage]);

    const formatTime = (timestamp) => {
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
    };

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

    const handleChatSelect = (chat) => {
        setSelectedChat(chat.id);
        setCurrentConversation(chat);
        if (isMobileView) {
            setShowChatList(false);
        }
    };

    const handleOpenReport = () => {
        setIsReportModalOpen(true);
    };

    const handleCloseReport = () => {
        setIsReportModalOpen(false);
    };

    const handleSubmitReport = (reportData) => {
        console.log('Report submitted:', reportData);
        alert('Laporan berhasil dikirim!');
    };

    const handleBlockCustomer = () => {
        console.log('Block customer:', currentConversation?.customerName);
        setShowDropdown(false);
    };

    const handleViewProfile = () => {
        console.log('View profile:', currentConversation?.customerName);
        setShowDropdown(false);
    };

    // Show empty state with instructions if no conversations
    if (!loading && conversations.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="mb-8">
                            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.946-1.524A11.934 11.934 0 002 20c.993-.641 1.865-1.408 2.55-2.246.28-.34.53-.694.751-1.062A8.001 8.001 0 0121 12z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Customer Conversations Yet</h2>
                        <p className="text-gray-600 mb-8 max-w-md">
                            Customers haven't started any conversations with your store yet. Here's how to test the chat feature:
                        </p>
                        
                        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-md mx-auto text-left">
                            <h3 className="font-semibold text-gray-900 mb-3">To Test Chat:</h3>
                            <ol className="text-sm text-gray-600 space-y-2">
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">1</span>
                                    <span>Open your store's product page in another browser/incognito window</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">2</span>
                                    <span>Login as a different user (customer)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">3</span>
                                    <span>Click the "Chat" button on any product</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">4</span>
                                    <span>Send a message to your store</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2 mt-0.5">5</span>
                                    <span>Return here and refresh to see the conversation</span>
                                </li>
                            </ol>
                        </div>
                        
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
                    <p className="text-gray-600">You need to login to access seller chat</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
            <div className="flex w-full max-w-6xl h-full bg-white shadow-2xl rounded-3xl overflow-hidden">
                {/* Sidebar Chat List */}
                <div className={`${isMobileView && !showChatList ? 'hidden' : 'flex'} flex-col w-full md:w-1/3 bg-white border-r border-gray-200 h-full`}>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-gray-900">Chat Pelanggan</h1>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => fetchSellerConversations()}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                    title="Refresh conversations"
                                >
                                    <RefreshCw className="w-5 h-5 text-gray-600" />
                                </button>
                                {isMobileView && (
                                    <button 
                                        onClick={() => setShowChatList(false)}
                                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cari pelanggan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && conversations.length === 0 ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className="p-6 text-center">
                                <div className="text-red-500 mb-2">Error loading chats</div>
                                <button 
                                    onClick={() => fetchSellerConversations()}
                                    className="text-blue-500 hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : filteredChats.length === 0 ? (
                            <div className="p-6 text-center">
                                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Belum ada chat dari pelanggan</p>
                                <p className="text-gray-400 text-sm mt-2">Chat akan muncul ketika pelanggan menghubungi toko Anda</p>
                            </div>
                        ) : (
                            filteredChats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => handleChatSelect(chat)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                                        selectedChat === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <img
                                                src={chat.customerAvatar}
                                                alt={chat.customerName}
                                                className="w-12 h-12 rounded-full object-cover shadow-md"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.customerName)}&background=3b82f6&color=fff&size=100`;
                                                }}
                                            />
                                            {chat.online && (
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900 truncate">{chat.customerName}</h3>
                                                <span className="text-xs text-gray-500">{formatTime(chat.lastMessageTime)}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate mt-1">{chat.lastMessage}</p>
                                            {chat.rating && (
                                                <div className="flex items-center mt-1">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                    <span className="text-xs text-gray-500 ml-1">{chat.rating}/5</span>
                                                </div>
                                            )}
                                        </div>
                                        {chat.unreadCount > 0 && (
                                            <div className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                                                {chat.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                {/* Chat Area */}
                <div className="flex-1 flex flex-col h-full">
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
                                                src={currentConversation.customerAvatar}
                                                alt={currentConversation.customerName}
                                                className="w-12 h-12 rounded-full object-cover shadow-md"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentConversation.customerName)}&background=3b82f6&color=fff&size=100`;
                                                }}
                                            />
                                            {currentConversation.online && (
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <h2 className="font-semibold text-gray-900 flex items-center">
                                                {currentConversation.customerName}
                                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                    Pelanggan
                                                </span>
                                            </h2>
                                            <p className="text-sm text-gray-600">
                                                {currentConversation.online ? (
                                                    <span className="text-green-600 font-medium">● Online</span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Terakhir online {formatTime(currentConversation.lastSeen)}
                                                    </span>
                                                )}
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
                                                    onClick={handleBlockCustomer}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                                >
                                                    <Shield className="w-4 h-4 mr-3" />
                                                    Blokir Pelanggan
                                                </button>
                                                <button
                                                    onClick={handleOpenReport}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                                >
                                                    <Flag className="w-4 h-4 mr-3" />
                                                    Laporkan Pelanggan
                                                </button>

                                                <ReportChat
                                                    isOpen={isReportModalOpen}
                                                    onClose={handleCloseReport}
                                                    onSubmit={handleSubmitReport}
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
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : currentMessages.length === 0 ? (
                                    <div className="text-center p-8">
                                        <p className="text-gray-500">Belum ada pesan dalam percakapan ini</p>
                                    </div>
                                ) : (
                                    currentMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.senderType === 'seller' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                                    msg.senderType === 'seller'
                                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                                        : 'bg-white text-gray-900 border border-gray-200'
                                                }`}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                                                <div className={`flex items-center justify-end mt-2 space-x-1 ${
                                                    msg.senderType === 'seller' ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                    <span className="text-xs">{formatTime(msg.timestamp)}</span>
                                                    {msg.senderType === 'seller' && renderMessageStatus(msg.status)}
                                                </div>
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
                            />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <MessageCircle className="w-16 h-16 text-blue-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Pilih Chat Pelanggan
                                </h3>
                                <p className="text-gray-600 text-lg">
                                    Pilih percakapan dari sidebar untuk membalas pelanggan
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 