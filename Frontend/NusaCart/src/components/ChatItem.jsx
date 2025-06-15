import React, { useMemo, memo } from 'react';

const ChatItem = memo(({ chat, isSelected, onSelect, formatTime }) => {
    // Create stable avatar URL to prevent re-renders
    const avatarUrl = useMemo(() => {
        if (chat.storeAvatar) {
            return chat.storeAvatar;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.storeName)}&background=ef4444&color=fff&size=100`;
    }, [chat.storeAvatar, chat.storeName]);

    const handleClick = useMemo(() => {
        return () => onSelect(chat);
    }, [onSelect, chat]);

    return (
        <div
            onClick={handleClick}
            className={`flex items-center p-4 mx-2 my-1 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                isSelected ? 'bg-red-50 shadow-md border border-red-100' : ''
            }`}
        >
            <div className="relative">
                <img
                    key={`avatar-${chat.id}-${chat.storeAvatar || 'fallback'}`}
                    src={avatarUrl}
                    alt={chat.storeName}
                    className="w-14 h-14 rounded-full object-cover shadow-md"
                    onError={(e) => {
                        // Prevent infinite loop by checking if already using fallback
                        if (!e.target.src.includes('ui-avatars.com')) {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.storeName)}&background=ef4444&color=fff&size=100`;
                        }
                    }}
                    loading="lazy"
                    style={{ 
                        imageRendering: 'auto',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                        willChange: 'auto'
                    }}
                />

            </div>
            
            <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                        <h3 className={`font-semibold truncate ${
                            isSelected ? 'text-red-600' : 'text-gray-900'
                        }`}>
                            {chat.storeName}
                        </h3>
                        {chat.type === 'store' && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Toko
                            </span>
                        )}
                    </div>

                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate flex-1">
                        {chat.lastMessage}
                    </p>

                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for better memoization
    return (
        prevProps.chat.id === nextProps.chat.id &&
        prevProps.chat.storeAvatar === nextProps.chat.storeAvatar &&
        prevProps.chat.storeName === nextProps.chat.storeName &&
        prevProps.chat.lastMessage === nextProps.chat.lastMessage &&
        prevProps.chat.lastMessageTime === nextProps.chat.lastMessageTime &&
        prevProps.chat.unreadCount === nextProps.chat.unreadCount &&
        prevProps.chat.online === nextProps.chat.online &&
        prevProps.isSelected === nextProps.isSelected
    );
});

ChatItem.displayName = 'ChatItem';

export default ChatItem; 