import React, { useState, useEffect, useRef, useMemo } from "react";
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

export default function ChatPage() {
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [selectedChat, setSelectedChat] = useState(1);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatList, setShowChatList] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleOpenReport = () => {
        setIsReportModalOpen(true);
    };

    const handleCloseReport = () => {
        setIsReportModalOpen(false);
    };

    const handleSubmitReport = (reportData) => {
        console.log('Report submitted:', reportData);
        // Here you would typically send the report data to your backend API
        // Example API call:
        // submitReport(reportData);
        alert('Laporan berhasil dikirim!');
    };

    // Dummy chat data
    const chats = [
        {
            id: 1,
            name: "SHOP",
            lastMessage: "Aktif 2 jam lalu",
            time: "20 Jan",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            online: true,
            unread: 0,
            type: "shop"
        },
        {
            id: 2,
            name: "MART",
            lastMessage: "Terima kasih sudah berbelanja",
            time: "03 Mar",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            online: false,
            unread: 2,
            type: "shop"
        },
        {
            id: 3,
            name: "Electronics Store",
            lastMessage: "Produk baru sudah tersedia",
            time: "15 Feb",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
            online: true,
            unread: 1,
            type: "shop"
        },
        {
            id: 4,
            name: "Fashion Outlet",
            lastMessage: "Diskon besar-besaran minggu ini!",
            time: "10 Feb",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b977?w=100&h=100&fit=crop&crop=face",
            online: false,
            unread: 0,
            type: "shop"
        }
    ];

    // Dummy messages data
    const messages = [
        {
            id: 1,
            chatId: 1,
            text: "Selamat datang di toko kami! Ada yang bisa kami bantu?",
            sender: "other",
            time: "10:30",
            status: "read"
        },
        {
            id: 2,
            chatId: 1,
            text: "Halo, saya mau tanya tentang produk gaming keyboard",
            sender: "me",
            time: "10:32",
            status: "read"
        },
        {
            id: 3,
            chatId: 1,
            text: "Tentu! Kami punya beberapa pilihan gaming keyboard yang bagus. Yang mana yang Anda cari?",
            sender: "other",
            time: "10:33",
            status: "read"
        },
        {
            id: 4,
            chatId: 1,
            text: "Yang mechanical keyboard, budget sekitar 500rb",
            sender: "me",
            time: "10:35",
            status: "read"
        },
        {
            id: 5,
            chatId: 1,
            text: "Perfect! Kami ada HyperX Alloy FPS Pro dan Razer BlackWidow V3 Tenkeyless dalam range harga tersebut. Keduanya sangat recommended untuk gaming.",
            sender: "other",
            time: "10:36",
            status: "read"
        },
        {
            id: 6,
            chatId: 1,
            text: "Bisa kirim foto produknya?",
            sender: "me",
            time: "10:38",
            status: "sent"
        },
        {
            id: 7,
            chatId: 2,
            text: "Bisa kirim foto produknya?",
            sender: "me",
            time: "10:38",
            status: "sent"
        }
    ];

    const currentChat = chats.find(chat => chat.id === selectedChat);
    const currentMessages = useMemo(() => 
        messages.filter(msg => msg.chatId === selectedChat), 
        [selectedChat]
    );

    const filteredChats = chats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleSendMessage = () => {
        if (message.trim()) {
            // In real app, this would send message via API
            setMessage('');
            setShouldAutoScroll(true); // Trigger scroll setelah mengirim pesan
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (time) => {
        return time;
    };

    const renderMessageStatus = (status) => {
        switch (status) {
            case 'sent':
                return <Check className="w-4 h-4 text-gray-400" />;
            case 'delivered':
                return <CheckCheck className="w-4 h-4 text-gray-400" />;
            case 'read':
                return <CheckCheck className="w-4 h-4 text-blue-500" />;
            default:
                return null;
        }
    };

    const handleBlockUser = () => {
        // Handle block user logic
        console.log('Block user:', currentChat?.name);
        setShowDropdown(false);
        // You would typically show a confirmation dialog here
    };

    const handleViewProfile = () => {
        // Handle view profile logic
        console.log('View profile:', currentChat?.name);
        setShowDropdown(false);
    };

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
                {filteredChats.map((chat) => (
                    <div
                        key={chat.id}
                        onClick={() => {
                            setSelectedChat(chat.id);
                            if (isMobileView) {
                                setShowChatList(false);
                            }
                        }}
                        className={`flex items-center p-4 mx-2 my-1 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                            selectedChat === chat.id ? 'bg-red-50 shadow-md border border-red-100' : ''
                        }`}
                    >
                        <div className="relative">
                            <img
                                src={chat.avatar}
                                alt={chat.name}
                                className="w-14 h-14 rounded-full object-cover shadow-md"
                            />
                            {chat.online && (
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                            )}
                        </div>
                        
                        <div className="ml-4 flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center">
                                    <h3 className={`font-semibold truncate ${
                                        selectedChat === chat.id ? 'text-red-600' : 'text-gray-900'
                                    }`}>
                                        {chat.name}
                                    </h3>
                                    {chat.type === 'shop' && (
                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                            Toko
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{chat.time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600 truncate flex-1">
                                    {chat.lastMessage}
                                </p>
                                {chat.unread > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-sm">
                                        {chat.unread}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ChatArea = () => (
        <div className={`${isMobileView && showChatList ? 'hidden' : 'flex'} flex-col flex-1 h-full bg-gradient-to-b from-gray-50 to-gray-100`}>
            {currentChat ? (
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
                                        src={currentChat.avatar}
                                        alt={currentChat.name}
                                        className="w-12 h-12 rounded-full object-cover shadow-md"
                                    />
                                    {currentChat.online && (
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <h2 className="font-semibold text-gray-900 flex items-center">
                                        {currentChat.name}
                                        {currentChat.type === 'shop' && (
                                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                                Toko
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {currentChat.online ? (
                                            <span className="text-green-600 font-medium">● Online</span>
                                        ) : (
                                            currentChat.lastMessage
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
                                            onSubmit={handleSubmitReport}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                        {currentMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                        msg.sender === 'me'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                    <div className={`flex items-center justify-end mt-2 space-x-1 ${
                                        msg.sender === 'me' ? 'text-red-100' : 'text-gray-500'
                                    }`}>
                                        <span className="text-xs">{formatTime(msg.time)}</span>
                                        {msg.sender === 'me' && renderMessageStatus(msg.status)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="bg-white border-t border-gray-200 p-4 shadow-lg ">
                        <div className="flex items-end space-x-3 ">
                            <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                                <Paperclip className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                                <Image className="w-5 h-5 text-gray-600" />
                            </button>
                            
                            <div className="flex-1 relative">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder=""
                                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none max-h-32 min-h-[48px] shadow-sm"
                                    rows="1"
                                />
                            </div>
                            
                            <button 
                                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <Smile className="w-5 h-5 text-gray-600" />
                            </button>
                            
                            <button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                                    message.trim()
                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transform hover:scale-105 shadow-red-200'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
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