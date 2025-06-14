import React, { useState, useCallback, memo } from 'react';
import { Send, Paperclip, Image, Smile } from 'lucide-react';

const ChatInput = memo(({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  }, [message, disabled, onSendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  return (
    <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <button 
          type="button"
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Paperclip className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          type="button"
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Image className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ketik pesan..."
            className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none max-h-32 min-h-[48px] shadow-sm"
            rows="1"
            autoComplete="off"
            spellCheck="false"
            disabled={disabled}
          />
        </div>
        
        <button 
          type="button"
          className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="w-5 h-5 text-gray-600" />
        </button>
        
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
            message.trim() && !disabled
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