/**
 * Карточка события для отображения в сетке
 * Дизайн как на скриншоте: изображение, бейдж статуса, сердечко, участники
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { EVENT_STATUS } from "../../features/events/EventsStore";

// Конфигурация статусов для отображения (согласно API)
const STATUS_CONFIG = {
  [EVENT_STATUS.COMING_SOON]: {
    label: "Скоро",
    className: "bg-blue-500 text-white",
  },
  [EVENT_STATUS.ACTIVE]: {
    label: "Активное",
    className: "bg-[#EE2C34] text-white",
  },
  [EVENT_STATUS.COMPLETED]: {
    label: "Завершено",
    className: "bg-neutral-500 text-white",
  },
  [EVENT_STATUS.CANCELLED]: {
    label: "Отменено",
    className: "bg-neutral-400 text-white",
  },
  // Для обратной совместимости
  "coming soon": {
    label: "Скоро",
    className: "bg-blue-500 text-white",
  },
  "active": {
    label: "Активное",
    className: "bg-[#EE2C34] text-white",
  },
  "completed": {
    label: "Завершено",
    className: "bg-neutral-500 text-white",
  },
  "cancelled": {
    label: "Отменено",
    className: "bg-neutral-400 text-white",
  },
};

// Иконка сердца (избранное)
const HeartIcon = ({ filled }) => (
  <svg 
    className={`w-5 h-5 ${filled ? "text-red-500" : "text-neutral-400"}`} 
    fill={filled ? "currentColor" : "none"} 
    viewBox="0 0 24 24" 
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

// Иконка участников (4 квадратика)
const ParticipantsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="6" rx="1.5" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
  </svg>
);

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
    getField(event, "isFavorite", "is_favorite", "favorite") || false
  );
  
  // Получаем статус с поддержкой разных форматов
  const status = getField(event, "status", "state") || EVENT_STATUS.ACTIVE;
  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG[EVENT_STATUS.ACTIVE];
  
  // Обработчик клика по избранному
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: вызвать API для добавления/удаления из избранного
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

  return (
    <Link
      to={`/events/${event?.id || 1}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg"
    >
      {/* Изображение */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop";
          }}
        />
        
        {/* Бейдж статуса - верхний левый угол */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1.5 text-xs font-medium rounded-lg ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Кнопка избранное - верхний правый угол */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          <HeartIcon filled={isFavorite} />
        </button>

        {/* Счетчик участников - нижний правый угол */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-neutral-700 shadow-sm">
          <ParticipantsIcon />
          <span>{participantsCount}</span>
        </div>
      </div>

      {/* Контент */}
      <div className="flex flex-col p-4">
        {/* Название */}
        <h3 className="text-base font-semibold text-neutral-900 line-clamp-2 group-hover:text-[#EE2C34] transition-colors">
          {title}
        </h3>

        {/* Даты */}
        <p className="mt-1.5 text-sm text-neutral-500">
          {formatDateRange(startDate, endDate)}
        </p>
      </div>
    </Link>
  );
}

export default EventCard;
