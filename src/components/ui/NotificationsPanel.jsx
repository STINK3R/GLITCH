/**
 * Панель уведомлений
 * Отображается в правом верхнем углу при клике на колокольчик
 * Показывает уведомления о приглашениях, удаленных мероприятиях и т.д.
 * Дизайн соответствует Figma
 */

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

// Типы уведомлений
export const NOTIFICATION_TYPES = {
  INVITATION: "invitation",
  EVENT_DELETED: "event_deleted",
  EVENT_UPDATED: "event_updated",
  REMINDER: "reminder",
  REVIEW: "review",
  SYSTEM: "system",
};

// Конфигурация иконок для типов уведомлений (красные иконки в кружках)
const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.INVITATION]: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 8V14" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M23 11H17" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  [NOTIFICATION_TYPES.EVENT_DELETED]: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M3 6H5H21" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  [NOTIFICATION_TYPES.EVENT_UPDATED]: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6V12L16 14" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  [NOTIFICATION_TYPES.REMINDER]: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 6V12L16 14" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  [NOTIFICATION_TYPES.REVIEW]: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  [NOTIFICATION_TYPES.SYSTEM]: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 16H12.01" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 8V12" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// Форматирование времени в формате "Сегодня, 19:28" или "Вчера, 15:30"
function formatNotificationTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  const time = date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  
  if (isToday) return `Сегодня, ${time}`;
  if (isYesterday) return `Вчера, ${time}`;
  
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" }) + `, ${time}`;
}

// Компонент одного уведомления (дизайн по Figma)
function NotificationItem({ notification, onRead, onAction }) {
  const { id, type, title, message, createdAt, isRead, actionText, actionData, eventName, eventLink } = notification;
  
  return (
    <div className="bg-[#FFF5F5] rounded-[16px] p-4 mb-3 last:mb-0">
      {/* Время */}
      <div className="text-xs text-[#828282] mb-2">
        {formatNotificationTime(createdAt)}
      </div>
      
      <div className="flex gap-3">
        {/* Иконка типа в кружке */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
          {NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS[NOTIFICATION_TYPES.SYSTEM]}
        </div>
        
        {/* Контент */}
        <div className="flex-1 min-w-0">
          {/* Заголовок с ссылкой на событие */}
          <p className="text-sm text-neutral-900 leading-relaxed">
            {title}
            {eventName && (
              <>
                {" "}
                <a href={eventLink || "#"} className="text-[#EE2C34] hover:underline font-medium">
                  {eventName}
                </a>
              </>
            )}
          </p>
          
          {/* Дополнительное сообщение */}
          {message && (
            <p className="text-sm text-[#828282] mt-1">
              {message}
            </p>
          )}
          
          {/* Кнопка действия */}
          {actionText && (
            <button
              onClick={() => onAction(id, actionData)}
              className="mt-3 px-5 py-2 text-sm font-medium text-white bg-[#EE2C34] rounded-[12px] hover:bg-[#D42930] transition-colors"
            >
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Основной компонент панели уведомлений
export function NotificationsPanel({ isOpen, onClose, notifications = [], onMarkAsRead, onMarkAllAsRead, onAction }) {
  const panelRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Управление анимацией открытия/закрытия
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Небольшая задержка для запуска анимации
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Ждем окончания анимации перед скрытием (300ms как в CSS)
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Закрытие при клике вне панели (с проверкой на кнопку колокольчика)
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Проверяем, что клик не по кнопке колокольчика (она сама управляет toggle)
      const bellButton = e.target.closest('[data-notification-bell]');
      if (bellButton) return;
      
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      // Используем setTimeout чтобы не закрыть сразу при открытии
      const timer = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);
  
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  if (!isVisible) return null;

  const mobilePanel = createPortal(
    <div className="md:hidden fixed inset-x-0 top-[20vh] bottom-[56px] z-[50]">
      {/* Затемнение с блюром */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300 ease-out ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      
      {/* Панель снизу - выезжает над навигацией, занимает весь доступный экран */}
      <div 
        ref={panelRef}
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] h-full overflow-hidden flex flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        {/* Заголовок мобильный */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100 shrink-0">
          <button onClick={onClose} className="text-base text-neutral-600">
            Закрыть
          </button>
          <h3 className="text-lg font-semibold text-neutral-900">Уведомления</h3>
          <button onClick={onMarkAllAsRead} className="text-base text-[#EE2C34]">
            Очистить
          </button>
        </div>
        
        {/* Список уведомлений */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <svg className="w-16 h-16 text-neutral-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-neutral-400 text-center">Нет новых уведомлений</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={onMarkAsRead}
                onAction={onAction}
              />
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {mobilePanel}

      {/* Десктопная версия - выпадающая панель (остается в контексте) */}
      <div 
        ref={panelRef}
        className={`hidden md:flex absolute top-full right-0 mt-2 w-[400px] max-h-[600px] bg-white rounded-[20px] shadow-xl border border-neutral-100 overflow-hidden z-[70] flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] origin-top-right ${
          isAnimating 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 -translate-y-3"
        }`}
      >
      {/* Заголовок */}
      <div className="flex items-center justify-between px-5 py-4 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold text-neutral-900">Уведомления</h3>
          {unreadCount > 0 && (
            <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-white bg-[#EE2C34] rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        
        <button
          onClick={onMarkAllAsRead}
          className="text-sm text-[#EE2C34] hover:underline font-medium"
        >
          Очистить
        </button>
      </div>
      
      {/* Список уведомлений */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <svg className="w-16 h-16 text-neutral-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-neutral-400 text-center">
              Нет новых уведомлений
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={onMarkAsRead}
              onAction={onAction}
            />
          ))
        )}
      </div>
      
      {/* Кнопка "Прочитать всё" внизу */}
      {notifications.length > 0 && (
        <div className="px-4 pb-4 pt-2 shrink-0">
          <button
            onClick={onMarkAllAsRead}
            className="w-full py-3 text-base font-medium text-neutral-900 bg-[#F5F5F5] rounded-[16px] hover:bg-neutral-200 transition-colors"
          >
            Прочитать всё
          </button>
        </div>
      )}
      </div>
    </>
  );
}

export default NotificationsPanel;
