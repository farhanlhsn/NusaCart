import React, { useEffect, useState } from 'react';

export default function NotificationSystem({ notifications, removeNotification }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}

function NotificationItem({ notification, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show notification with animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto remove after duration
    const timer = setTimeout(() => {
      handleRemove();
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const getNotificationStyles = () => {
    const baseStyles = "flex items-center p-4 rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-300 ease-in-out";
    
    let typeStyles = "";
    let icon = "";

    switch (notification.type) {
      case 'success':
        typeStyles = "bg-green-500 text-white";
        icon = "✅";
        break;
      case 'error':
        typeStyles = "bg-red-500 text-white";
        icon = "❌";
        break;
      case 'warning':
        typeStyles = "bg-yellow-500 text-white";
        icon = "⚠️";
        break;
      case 'info':
        typeStyles = "bg-blue-500 text-white";
        icon = "ℹ️";
        break;
      default:
        typeStyles = "bg-gray-500 text-white";
        icon = "📢";
    }

    const animationStyles = isVisible && !isLeaving 
      ? "translate-x-0 opacity-100" 
      : "translate-x-full opacity-0";

    return {
      className: `${baseStyles} ${typeStyles} ${animationStyles}`,
      icon
    };
  };

  const { className, icon } = getNotificationStyles();

  return (
    <div className={className}>
      <span className="text-lg mr-3">{icon}</span>
      <div className="flex-1">
        {notification.title && (
          <div className="font-semibold text-sm">{notification.title}</div>
        )}
        <div className="text-sm opacity-90">{notification.message}</div>
      </div>
      <button
        onClick={handleRemove}
        className="ml-3 text-white hover:text-gray-200 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

// Notification store hook
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      duration: notification.duration || 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Helper methods for different types
  const success = (message, title = null, duration = 5000) => 
    addNotification({ type: 'success', message, title, duration });

  const error = (message, title = null, duration = 7000) => 
    addNotification({ type: 'error', message, title, duration });

  const warning = (message, title = null, duration = 5000) => 
    addNotification({ type: 'warning', message, title, duration });

  const info = (message, title = null, duration = 5000) => 
    addNotification({ type: 'info', message, title, duration });

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };
} 