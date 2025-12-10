/**
 * Модальное окно избранных событий
 * Стилизовано как UserProfileModal, но чуть больше для лучшей видимости
 */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useFavoriteEvents, useToggleFavorite } from "../../features/events/useEvents";
import { EVENT_STATUS } from "../../features/events/EventsStore";
import { getImageUrl } from "../../utils/imageUrl";

import heartFilledIcon from "/icons/add-heart-on-events-card.svg";
import participantsIcon from "/icons/people.svg";

// Иконка закрытия
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 6L18 18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Иконка пустого списка
const EmptyHeartIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C12 21 4 14.5 4 9C4 6.23858 6.23858 4 9 4C10.6569 4 12 4.84285 12 4.84285C12 4.84285 13.3431 4 15 4C17.7614 4 20 6.23858 20 9C20 14.5 12 21 12 21Z" stroke="#D4D4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Конфигурация статусов
const STATUS_CONFIG = {
  [EVENT_STATUS.ACTIVE]: {
    label: "Активное",
    className: "bg-[#EE2C34] text-white",
  },
  [EVENT_STATUS.COMPLETED]: {
    label: "Прошедшее",
    className: "bg-neutral-500 text-white",
  },
  "active": {
    label: "Активное",
    className: "bg-[#EE2C34] text-white",
  },
  "completed": {
    label: "Прошедшее",
    className: "bg-neutral-500 text-white",
  },
};

/**
 * Получить значение поля с поддержкой разных названий
 */
function getField(event, ...keys) {
  for (const key of keys) {
    if (event?.[key] !== undefined && event?.[key] !== null) {
      return event[key];
    }
  }
  return null;
}

/**
 * Форматирование даты
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * Компактная карточка события для списка избранного
 */
function FavoriteEventCard({ event, onRemove }) {
  const toggleFavoriteMutation = useToggleFavorite();

  const rawImageUrl = getField(event, "image_url", "image", "photo", "cover", "preview", "thumbnail");
  const imageUrl = getImageUrl(rawImageUrl) || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
  const title = getField(event, "name", "title", "event_name") || "Название события";
  const startDate = getField(event, "start_date", "startDate", "date_start", "start_at", "date_from", "begin_date");
  const status = getField(event, "status", "state") || EVENT_STATUS.ACTIVE;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG[EVENT_STATUS.ACTIVE];
  const members = getField(event, "members") || [];
  const participantsCount = members.length || getField(event, "participantsCount", "participants_count", "members_count", "users_count", "count") || 0;

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavoriteMutation.mutate(
      { eventId: event.id, isLiked: true },
      {
        onSuccess: () => {
          onRemove?.(event.id);
        },
      }
    );
  };

  return (
    <Link
      to={`/events/${event?.id || 1}`}
      className="flex gap-3 p-3 rounded-[16px] bg-[#F5F5F5] hover:bg-[#EFEFEF] transition-colors group"
    >
      {/* Изображение */}
      <div className="relative w-20 h-20 flex-shrink-0 rounded-[12px] overflow-hidden bg-neutral-200">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
          }}
        />
        {/* Бейдж статуса */}
        <div className="absolute top-1 left-1">
          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-sm font-medium text-neutral-900 line-clamp-2 leading-tight">
          {title}
        </h4>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-neutral-500">
            {formatDate(startDate)}
          </span>
          <span className="w-1 h-1 bg-neutral-300 rounded-full" />
          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <img src={participantsIcon} alt="" className="w-3 h-3 opacity-60" />
            <span>{participantsCount}</span>
          </div>
        </div>
      </div>

      {/* Кнопка удаления из избранного */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white transition-colors self-center"
        title="Удалить из избранного"
      >
        <img 
          src={heartFilledIcon} 
          alt="" 
          className="w-5 h-5"
        />
      </button>
    </Link>
  );
}

/**
 * Скелетон для загрузки
 */
function FavoriteCardSkeleton() {
  return (
    <div className="flex gap-3 p-3 rounded-[16px] bg-[#F5F5F5] animate-pulse">
      <div className="w-20 h-20 flex-shrink-0 rounded-[12px] bg-neutral-200" />
      <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
      </div>
      <div className="w-8 h-8 rounded-full bg-neutral-200 self-center" />
    </div>
  );
}

/**
 * Пустое состояние
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <EmptyHeartIcon />
      <h3 className="mt-4 text-lg font-medium text-neutral-900">
        Нет избранных событий
      </h3>
      <p className="mt-2 text-sm text-neutral-500 max-w-[240px]">
        Добавляйте события в избранное, чтобы не потерять их
      </p>
      <Link
        to="/events"
        className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#EE2C34] rounded-full hover:bg-[#D42930] transition-colors"
      >
        Смотреть события
      </Link>
    </div>
  );
}

/**
 * Основной компонент модального окна избранного
 */
export function FavoritesModal({ isOpen, onClose }) {
  const { data: favorites = [], isLoading, isError } = useFavoriteEvents();
  const modalRef = useRef(null);

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

  // Закрытие по клику вне модалки
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Блокировка скролла
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="absolute right-4 top-20 w-full max-w-[460px] bg-white rounded-[20px] shadow-2xl transform animate-slide-in-right"
        style={{ maxHeight: "calc(100vh - 120px)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="favorites-modal-title"
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
          <h2 id="favorites-modal-title" className="text-xl font-semibold text-neutral-900">
            Избранное
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Контент */}
        <div 
          className="p-4 overflow-y-auto scrollbar-hide" 
          style={{ maxHeight: "calc(100vh - 220px)" }}
        >
          {isLoading ? (
            <div className="flex flex-col gap-3">
              <FavoriteCardSkeleton />
              <FavoriteCardSkeleton />
              <FavoriteCardSkeleton />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-neutral-500">
                Не удалось загрузить избранное
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm font-medium text-[#EE2C34] hover:underline"
              >
                Попробовать снова
              </button>
            </div>
          ) : favorites.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-3">
              {favorites.map((event) => (
                <FavoriteEventCard
                  key={event.id}
                  event={event}
                  onRemove={() => {}}
                />
              ))}
            </div>
          )}
        </div>

        {/* Футер с количеством */}
        {!isLoading && !isError && favorites.length > 0 && (
          <div className="px-6 py-4 border-t border-neutral-100">
            <p className="text-sm text-neutral-500 text-center">
              {favorites.length} {favorites.length === 1 ? "событие" : 
                favorites.length < 5 ? "события" : "событий"} в избранном
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesModal;
