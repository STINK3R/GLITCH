/**
 * Главная страница событий (Лента)
 * Отображает сетку событий с вкладками для фильтрации
 */

import { useEventsStore } from "../../features/events/EventsStore";
import { useAllEvents } from "../../features/events/useEvents";
import { EventsTabs } from "../../components/events/EventsTabs";
import { EventCard } from "../../components/events/EventCard";

/**
 * Компонент скелетона карточки для состояния загрузки
 */
function EventCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100 animate-pulse">
      {/* Изображение */}
      <div className="aspect-[16/10] bg-neutral-200" />

      {/* Контент */}
      <div className="p-4 space-y-3">
        <div className="h-6 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-100 rounded w-full" />
        <div className="h-4 bg-neutral-100 rounded w-2/3" />

        <div className="flex gap-4 pt-2">
          <div className="h-4 bg-neutral-100 rounded w-24" />
          <div className="h-4 bg-neutral-100 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Компонент пустого состояния
 */
function EmptyState({ message = "Нет событий" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-neutral-900">{message}</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Попробуйте проверить другие вкладки
      </p>
    </div>
  );
}

/**
 * Компонент ошибки
 */
function ErrorState({ message = "Произошла ошибка", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 mb-4 rounded-full bg-red-50 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-neutral-900">{message}</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Не удалось загрузить события
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
        >
          Попробовать снова
        </button>
      )}
    </div>
  );
}

export function EventsPage() {
  const getCurrentEvents = useEventsStore((s) => s.getCurrentEvents);
  const { currentQuery, isLoading, isError } = useAllEvents();

  // Получаем события для текущей вкладки
  const events = getCurrentEvents();

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">События</h1>
          <p className="mt-2 text-neutral-600">
            Узнавайте о мероприятиях и участвуйте в них
          </p>
        </div>

        {/* Вкладки */}
        <div className="mb-8">
          <EventsTabs />
        </div>

        {/* Контент */}
        {isLoading ? (
          // Состояние загрузки - скелетоны
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          // Состояние ошибки
          <ErrorState
            message="Ошибка загрузки"
            onRetry={() => currentQuery?.refetch()}
          />
        ) : events.length === 0 ? (
          // Пустое состояние
          <EmptyState message="Нет событий" />
        ) : (
          // Сетка карточек событий
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

