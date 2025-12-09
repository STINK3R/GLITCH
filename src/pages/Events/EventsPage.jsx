/**
 * Главная страница событий (Лента)
 * Отображает фильтры слева и сетку событий справа
 */

import { useState } from "react";
import { useEventsStore, EVENT_TABS } from "../../features/events/EventsStore";
import { useAllEvents } from "../../features/events/useEvents";
import { EventCard } from "../../components/events/EventCard";
import { EventsFilter } from "../../components/events/EventsFilter";

/**
 * Компонент скелетона карточки для состояния загрузки
 */
function EventCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-2xl overflow-hidden animate-pulse">
      {/* Изображение */}
      <div className="aspect-[4/3] bg-neutral-200" />

      {/* Контент */}
      <div className="p-4 space-y-3">
        <div className="h-5 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-100 rounded w-1/2" />
      </div>
    </div>
  );
}

/**
 * Компонент пустого состояния
 */
function EmptyState({ message = "Нет событий" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
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
        Попробуйте изменить фильтры или проверить другие вкладки
      </p>
    </div>
  );
}

/**
 * Компонент ошибки
 */
function ErrorState({ message = "Произошла ошибка", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
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
          className="mt-4 px-4 py-2 text-sm font-medium text-[#EE2C34] bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
        >
          Попробовать снова
        </button>
      )}
    </div>
  );
}

/**
 * Форматирование числа с пробелами (1000 -> 1 000)
 */
function formatNumber(num) {
  return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || "0";
}

export function EventsPage() {
  const activeTab = useEventsStore((s) => s.activeTab);
  const getCurrentEvents = useEventsStore((s) => s.getCurrentEvents);
  
  // Состояние фильтров (API формат)
  const [filters, setFilters] = useState({});

  const { currentQuery, activeEventsQuery, isLoading, isError } = useAllEvents(filters);

  // Получаем события для текущей вкладки
  const events = getCurrentEvents();

  // Заголовок в зависимости от активной вкладки
  const getTitle = () => {
    switch (activeTab) {
      case EVENT_TABS.MY:
        return "Мои события";
      case EVENT_TABS.ACTIVE:
        return "Все события";
      case EVENT_TABS.PAST:
        return "Прошедшие события";
      default:
        return "Все события";
    }
  };

  // Применить фильтры
  const handleApplyFilters = (newFilters) => {
    console.log("Применены фильтры:", newFilters);
    setFilters(newFilters);
  };

  // Сбросить фильтры и перезагрузить данные
  const handleResetFilters = () => {
    setFilters({});
    // Перезагружаем данные после сброса
    setTimeout(() => {
      activeEventsQuery?.refetch();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Боковая панель фильтров */}
          <EventsFilter
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* Основной контент */}
          <main className="flex-1 min-w-0">
            {/* Заголовок с количеством */}
            <div className="flex items-baseline gap-3 mb-6">
              <h1 className="text-2xl font-bold text-neutral-900">
                {getTitle()}
              </h1>
              <span className="text-2xl font-bold text-neutral-400">
                {formatNumber(events.length)}
              </span>
            </div>

            {/* Сетка событий */}
            {isLoading ? (
              // Состояние загрузки - скелетоны
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 9 }).map((_, i) => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {events.map((event, index) => (
                  <EventCard key={event.id || index} event={event} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default EventsPage;
