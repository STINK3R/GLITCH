/**
 * Карточка события для отображения в сетке
 * Дизайн как на скриншоте: изображение, бейдж статуса, сердечко, участники
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { EVENT_STATUS } from "../../features/events/EventsStore";
import { useToggleFavorite } from "../../features/events/useEvents";

import heartIcon from "/icons/heart-on-events-card.svg";
import heartFilledIcon from "/icons/add-heart-on-events-card.svg";
import participantsIcon from "/icons/people.svg";

// Конфигурация статусов для отображения (только Активное и Прошедшее)
const STATUS_CONFIG = {
  [EVENT_STATUS.ACTIVE]: {
    label: "Активное",
    className: "bg-[#EE2C34] text-white",
  },
  [EVENT_STATUS.COMPLETED]: {
    label: "Прошедшее",
    className: "bg-neutral-500 text-white",
  },
  // Для обратной совместимости
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
 * Форматирование диапазона дат для отображения
 * @param {string} startDate - Дата начала
 * @param {string} endDate - Дата окончания
 * @returns {string} Отформатированный диапазон
 */
function formatDateRange(startDate, endDate) {
  if (!startDate) return "";
  
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  // Проверка на валидность даты
  if (isNaN(start.getTime())) return "";
  
  const startDay = start.getDate();
  const startMonth = months[start.getMonth()];
  
  if (!end || isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
    return `${startDay} ${startMonth}`;
  }
  
  const endDay = end.getDate();
  const endMonth = months[end.getMonth()];
  
  // Если один месяц
  if (start.getMonth() === end.getMonth()) {
    return `${startDay} — ${endDay} ${startMonth}`;
  }
  
  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
}

export function EventCard({ event }) {
  const [isFavorite, setIsFavorite] = useState(
    getField(event, "is_user_liked_event", "isFavorite", "is_favorite", "isLiked") || false
  );
  const [isHovered, setIsHovered] = useState(false);
  
  // Хук для лайка/анлайка
  const toggleFavoriteMutation = useToggleFavorite();
  
  // Получаем статус с поддержкой разных форматов
  const status = getField(event, "status", "state") || EVENT_STATUS.ACTIVE;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG[EVENT_STATUS.ACTIVE];
  
  // Обработчик клика по избранному (оптимистичное обновление)
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Сразу меняем UI
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    // Отправляем запрос в фоне
    toggleFavoriteMutation.mutate(
      { eventId: event?.id, isLiked: !newValue },
      {
        onError: () => {
          // Откатываем при ошибке
          setIsFavorite(!newValue);
          console.error("Ошибка изменения избранного");
        },
      }
    );
  };

  // Получаем изображение с поддержкой разных названий полей
  const imageUrl = getField(event, "image_url", "image", "photo", "cover", "preview", "thumbnail") 
    || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";

  // Получаем название
  const title = getField(event, "name", "title", "event_name") || "Название события";

  // Получаем даты
  const startDate = getField(event, "start_date", "startDate", "date_start", "start_at", "date_from", "begin_date");
  const endDate = getField(event, "end_date", "endDate", "date_end", "end_at", "date_to", "finish_date");

  // Получаем количество участников (из массива members или поля)
  const members = getField(event, "members") || [];
  const participantsCount = members.length || getField(event, "participantsCount", "participants_count", "members_count", "users_count", "count") || 0;
  // Максимальное количество участников (ограничение)
  const maxMembers = getField(event, "max_members", "maxMembers", "max_participants", "limit");

  // Получаем краткое описание (short_description) - ключевое поле для hover эффекта
  const shortDescription = getField(event, "short_description", "shortDescription", "short_desc") || "";
  
  // Определяем, показывать ли блюр и тултип (только если есть краткое описание)
  const hasShortDescription = Boolean(shortDescription);

  return (
    <Link
      to={`/events/${event?.id || 1}`}
      className="group relative flex flex-col transition-all duration-300 animate-card-enter"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Изображение */}
      <div className="relative h-[140px] md:h-[200px] overflow-hidden bg-neutral-100 rounded-[16px] md:rounded-[20px]">
        <img
          src={imageUrl}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isHovered 
              ? hasShortDescription 
                ? "scale-110 blur-[6px]" 
                : "scale-110" 
              : "scale-100 blur-0"
          }`}
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
          }}
        />
        
        {/* Затемнение при ховере - только если есть краткое описание */}
        {hasShortDescription && (
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`} />
        )}
        
        {/* Тултип с кратким описанием - только если есть short_description */}
        {hasShortDescription && (
          <div className={`absolute inset-0 flex flex-col justify-center items-center p-6 transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}>
            <p className="text-white text-center text-[15px] leading-relaxed font-medium drop-shadow-lg">
              {shortDescription}
            </p>
          </div>
        )}
        
        {/* Кнопка избранное - верхний правый угол */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 md:top-3 md:right-3 flex items-center justify-center px-1.5 py-1 md:px-2 bg-[#F5F5F5] rounded-full md:rounded-[18px] hover:bg-white transition-all z-10 ${
            isHovered ? "opacity-100" : ""
          }`}
        >
          <div className={`w-4 h-4 transition-transform duration-300 ease-out ${isFavorite ? "scale-110" : "scale-100"}`}>
            <img 
              src={isFavorite ? heartFilledIcon : heartIcon} 
              alt="" 
              className="w-full h-full transition-all duration-300 ease-out"
              style={{ 
                filter: isFavorite ? "drop-shadow(0 0 4px rgba(238, 44, 52, 0.4))" : "none",
              }}
            />
          </div>
        </button>

        {/* Бейдж статуса - верхний левый угол */}
        <div className={`absolute top-2 left-2 md:top-3 md:left-3 z-10 transition-opacity duration-300 ${
          isHovered && hasShortDescription ? "opacity-0" : "opacity-100"
        }`}>
          <span className={`flex items-center justify-center px-2 py-0.5 md:py-1 text-xs md:text-sm font-medium rounded-full md:rounded-[18px] ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Счетчик участников - нижний правый угол */}
        <div className={`absolute bottom-2 right-2 md:bottom-3 md:right-3 flex items-center gap-1 md:gap-1.5 px-2 py-0.5 md:px-2.5 md:py-1 bg-[#F5F5F5] rounded-full md:rounded-[18px] text-xs md:text-sm font-medium text-neutral-900 z-10 transition-opacity duration-300 ${
          isHovered && hasShortDescription ? "opacity-0" : "opacity-100"
        }`}>
          <img src={participantsIcon} alt="" className="w-3 h-3 md:w-4 md:h-4" />
          <span>
            {maxMembers && maxMembers > 0 
              ? `${participantsCount} / ${maxMembers}` 
              : participantsCount}
          </span>
        </div>
      </div>

      {/* Контент */}
      <div className="flex flex-col pt-2 pb-2 md:pb-4">
        {/* Название */}
        <h3 className="text-sm md:text-[20px] leading-tight md:leading-6 font-medium text-neutral-900 line-clamp-2">
          {title}
        </h3>

        {/* Даты */}
        <p className="mt-1 md:mt-2 text-xs md:text-[15px] leading-4 md:leading-5 text-[#2A2A2A]">
          {formatDateRange(startDate, endDate)}
        </p>
      </div>
    </Link>
  );
}

export default EventCard;
