import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Toast Context для управления уведомлениями
 */
const ToastContext = createContext(null);

/**
 * Типы уведомлений:
 * - success: зеленая галочка (Вы участвуете в событии!)
 * - error: красный восклицательный знак (Вы отменили участие)
 * - info: информационное сообщение (Успешный сброс пароля)
 */

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

/**
 * Преобразует любое сообщение в строку
 */
const normalizeMessage = (message) => {
  if (typeof message === "string") {
    return message;
  }
  if (message === null || message === undefined) {
    return "Произошла ошибка";
  }
  if (typeof message === "object") {
    // Пробуем извлечь текст ошибки из разных полей
    return message.message || message.error || message.detail || message.msg || JSON.stringify(message);
  }
  return String(message);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const messageText = normalizeMessage(message);
    const id = Date.now() + Math.random();
    
    setToasts((prev) => [...prev, { id, message: messageText, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, "success", duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, "error", duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, "info", duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

/**
 * Контейнер для отображения тостов - СВЕРХУ страницы
 */
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-3 w-full max-w-sm px-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

/**
 * Компонент отдельного тоста
 */
const Toast = ({ message, type, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <div className="flex-shrink-0 w-5 h-5 text-[#22C55E]">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "error":
        return (
          <div className="flex-shrink-0 w-5 h-5 text-[#EE2C34]">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "info":
      default:
        return (
          <div className="flex-shrink-0 w-5 h-5 text-[#3B82F6]">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div 
      className="animate-slide-down bg-white rounded-2xl shadow-lg border border-neutral-100 px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={onClose}
    >
      {getIcon()}
      <p className="text-sm text-neutral-700 flex-1">{message}</p>
    </div>
  );
};

export default Toast;
