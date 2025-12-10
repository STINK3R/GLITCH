/**
 * Карточка события для отображения в сетке
 * Показывает: фото, название, даты, участники, статус
 */

import { Link } from "react-router-dom";
import { EVENT_STATUS } from "../../features/events/EventsStore";
import { getImageUrl } from "../../utils/imageUrl";

// Конфигурация статусов для отображения
const STATUS_CONFIG = {
  [EVENT_STATUS.ACTIVE]: {
    label: "Активное",
    className: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  [EVENT_STATUS.PAST]: {
    label: "Прошедшее",
    className: "bg-neutral-100 text-neutral-600",
    dot: "bg-neutral-400",
  },
  [EVENT_STATUS.REJECTED]: {
    label: "Отклонено",
    className: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

/**
 * Форматирование даты для отображения
 * @param {string} dateString - ISO строка даты
 * @returns {string} Отформатированная дата
 */
function formatDate(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Форматирование диапазона дат
 * @param {string} startDate - Дата начала
 * @param {string} endDate - Дата окончания
 * @returns {string} Отформатированный диапазон
 */
function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === end) return start;
  return `${start} — ${end}`;
}

export function EventCard({ event }) {
  const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG[EVENT_STATUS.ACTIVE];

  return (
    <Link
      to={`/events/${event.id}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100"
    >
      {/* Изображение */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
        {event.image_url ? (
          <img
            src={getImageUrl(event.image_url)}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
            <svg
              className="w-16 h-16 text-violet-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Бейдж статуса */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
            {statusConfig.label}
          </span>
        </div>

        {/* Индикатор участия */}
        {event.is_user_in_event && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-violet-600 text-white rounded-full">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Участвую
            </span>
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="flex flex-col flex-1 p-4">
        {/* Название */}
        <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2 group-hover:text-violet-600 transition-colors">
          {event.name}
        </h3>

        {/* Краткое описание */}
        {event.short_description && (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
            {event.short_description}
          </p>
        )}

        {/* Мета-информация */}
        <div className="flex items-center gap-4 mt-auto pt-4 text-sm text-neutral-600">
          {/* Даты */}
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDateRange(event.start_date, event.end_date)}</span>
          </div>

          {/* Участники */}
          <div className="flex items-center gap-1.5">
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>
              {event.members?.length || 0}
              {event.max_members && ` / ${event.max_members}`}
            </span>
          </div>
        </div>
      </div>

      {/* Всплывающая подсказка с дополнительной информацией */}
      <div className="absolute inset-x-4 bottom-full mb-2 p-3 bg-neutral-900 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-20 shadow-lg">
        <p className="font-medium">{event.name}</p>
        {event.short_description && (
          <p className="mt-1 text-neutral-300 text-xs">{event.short_description}</p>
        )}
        <p className="mt-2 text-neutral-400 text-xs">
          Участников: {event.members?.length || 0}
          {event.max_members && ` из ${event.max_members}`}
        </p>
        {/* Стрелочка */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-8 border-transparent border-t-neutral-900" />
      </div>
    </Link>
  );
}

