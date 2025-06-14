import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../stores/chatStore';
import useAuthStore from '../stores/authStore';

const ChatButton = ({ 
  storeId, 
  storeName, 
  className = "",
  size = "default",
  variant = "primary",
  children 
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startConversation, setCurrentConversation } = useChatStore();

  const handleStartChat = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const conversation = await startConversation(storeId, storeName);
      setCurrentConversation(conversation);
      navigate('/chat');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      // Still navigate to chat page even if there's an error
      navigate('/chat');
    }
  };

  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    default: "px-4 py-2",
    large: "px-6 py-3 text-lg"
  };

  const variantClasses = {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-50",
    ghost: "text-blue-500 hover:bg-blue-50"
  };

  return (
    <button
      onClick={handleStartChat}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
        flex items-center gap-2 rounded-lg font-medium transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <MessageCircle className="w-4 h-4" />
      {children || 'Chat Penjual'}
    </button>
  );
};

export default ChatButton; 