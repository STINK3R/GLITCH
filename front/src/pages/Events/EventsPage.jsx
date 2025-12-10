/**
 * Главная страница событий (Лента)
 * Отображает фильтры слева и сетку событий справа
 */

import { useState } from "react";
import { useEventsStore, EVENT_TABS } from "../../features/events/EventsStore";
import { useAllEvents } from "../../features/events/useEvents";
import { EventCard } from "../../components/events/EventCard";
import { EventsFilter } from "../../components/events/EventsFilter";

// Иконка поиска
import searchIcon from "/icons/search-normal.svg";

// Конфигурация вкладок навигации для мобильных
const NAV_TABS = [
  { id: EVENT_TABS.ACTIVE, label: "Активные" },
  { id: EVENT_TABS.MY, label: "Мои события" },
  { id: EVENT_TABS.PAST, label: "Прошедшие" },
];

/**
 * Компонент скелетона карточки для состояния загрузки
 */
function EventCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Изображение */}
      <div className="relative h-[140px] md:h-[200px] bg-neutral-200 rounded-[16px] md:rounded-[20px]">
        {/* Бейдж статуса placeholder */}
        <div className="absolute top-2 left-2 md:top-3 md:left-3 w-20 h-6 bg-neutral-300 rounded-full opacity-50" />
        {/* Кнопка лайка placeholder */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3 w-8 h-8 bg-neutral-300 rounded-full opacity-50" />
        {/* Участники placeholder */}
        <div className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-16 h-6 bg-neutral-300 rounded-full opacity-50" />
      </div>

      {/* Контент */}
      <div className="flex flex-col pt-2 pb-2 md:pb-4 space-y-2">
        <div className="h-5 md:h-6 bg-neutral-200 rounded w-3/4" />
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
  const setActiveTab = useEventsStore((s) => s.setActiveTab);
  const getCurrentEvents = useEventsStore((s) => s.getCurrentEvents);
  const searchQuery = useEventsStore((s) => s.searchQuery);
  const setSearchQuery = useEventsStore((s) => s.setSearchQuery);
  
  // Состояние фильтров (API формат)
  const [filters, setFilters] = useState({});

  // Объединяем фильтры (исключая поиск, так как будем фильтровать на клиенте для лучшего поиска)
  const effectiveFilters = {
    ...filters
  };

  const { currentQuery, activeEventsQuery, isLoading, isError } = useAllEvents(effectiveFilters);

  // Получаем события для текущей вкладки
  const allEvents = getCurrentEvents();

  // Фильтруем события на клиенте (поиск + цена + ограничение участников)
  const events = allEvents.filter(event => {
    // Фильтр по поисковому запросу
    if (searchQuery) {
      const name = event.name || event.title || "";
      if (!name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }
    
    // Фильтр по цене (pay_data)
    // Если есть pay_data - платное, если нет - бесплатное
    // Если выбраны оба варианта или ничего не выбрано - показываем все
    const priceFilter = filters.price;
    if (priceFilter && priceFilter !== null) {
      const priceValues = Array.isArray(priceFilter) ? priceFilter : [priceFilter];
      // Если выбраны оба - показываем все
      if (priceValues.length === 1) {
        const payData = event.pay_data || event.payData || event.payment_info;
        const isPaid = payData && String(payData).trim() !== "";
        
        if (priceValues.includes("free") && isPaid) {
          return false; // Хотим бесплатные, а это платное
        }
        if (priceValues.includes("paid") && !isPaid) {
          return false; // Хотим платные, а это бесплатное
        }
      }
    }
    
    // Фильтр по ограничению участников (max_members)
    // Если выбраны оба варианта или ничего не выбрано - показываем все
    const limitFilter = filters.limit;
    if (limitFilter && limitFilter !== null) {
      const limitValues = Array.isArray(limitFilter) ? limitFilter : [limitFilter];
      // Если выбраны оба - показываем все
      if (limitValues.length === 1) {
        const maxMembers = event.max_members || event.maxMembers || event.max_participants;
        const hasLimit = maxMembers && maxMembers > 0;
        
        if (limitValues.includes("no_limit") && hasLimit) {
          return false; // Хотим без ограничения, а тут есть
        }
        if (limitValues.includes("limit") && !hasLimit) {
          return false; // Хотим с ограничением, а тут нет
        }
      }
    }
    
    return true;
  });

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

  // Состояние для мобильного модального окна фильтров
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Мобильные табы навигации (только на мобильных) - стиль как на десктопе */}
      <div className="lg:hidden sticky top-[56px] md:top-[72px] z-30 bg-[#FAFAFA] px-4 py-3">
        <nav className="flex items-center p-[2px] bg-[#EFEFEF] rounded-[20px] overflow-x-auto scrollbar-hide" style={{ height: 44 }}>
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 h-[40px] px-3 text-[14px] font-medium rounded-[18px] transition-all duration-200 flex items-center justify-center whitespace-nowrap ${
                  isActive
                    ? "bg-[#E3E3E3] text-neutral-900"
                    : "text-neutral-900 hover:bg-white/50"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Мобильный поиск и кнопка фильтров */}
      <div className="lg:hidden px-4 py-3 flex gap-2">
        {/* Поиск */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <img src={searchIcon} alt="" className="w-5 h-5 opacity-50" />
          </div>
          <input
            type="text"
            placeholder="Введите название события"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-[#EFEFEF] rounded-full text-sm placeholder-neutral-400 outline-none focus:ring-1 focus:ring-neutral-300"
          />
        </div>
        
        {/* Кнопка фильтров */}
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="w-11 h-11 flex items-center justify-center bg-[#EFEFEF] rounded-full shrink-0"
        >
          <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-[47px] py-4 lg:py-8">
        <div className="flex gap-8">
          {/* Боковая панель фильтров (скрыта на мобильных) */}
          <div className="hidden lg:block">
            <EventsFilter
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </div>

          {/* Основной контент */}
          <main className="flex-1 min-w-0">
            {/* Заголовок с количеством */}
            <div className="flex items-baseline gap-3 mb-4 lg:mb-6 relative">
              <h1 className="text-xl lg:text-[28px] font-medium text-neutral-900">
                {getTitle()}
              </h1>
              <span className="text-xl lg:text-[28px] font-medium text-[#828282]">
                {formatNumber(events.length)}
              </span>
            </div>

            {/* Сетка событий */}
            {isLoading ? (
              // Состояние загрузки - скелетоны
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-5">
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
              <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-5">
                {events.map((event, index) => (
                  <EventCard key={event.id || index} event={event} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Мобильное модальное окно фильтров */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Затемнение */}
          <div 
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsFilterModalOpen(false)}
          />
          
          {/* Панель фильтров */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
            {/* Заголовок */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100 shrink-0">
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-base text-neutral-600"
              >
                Закрыть
              </button>
              <h3 className="text-lg font-semibold text-neutral-900">Фильтры</h3>
              <button
                onClick={() => {
                  handleResetFilters();
                }}
                className="text-base text-[#EE2C34]"
              >
                Очистить
              </button>
            </div>
            
            {/* Контент фильтров */}
            <div className="flex-1 overflow-y-auto p-4">
              <EventsFilter
                filters={filters}
                onFiltersChange={setFilters}
                onApply={(newFilters) => {
                  handleApplyFilters(newFilters);
                  setIsFilterModalOpen(false);
                }}
                onReset={handleResetFilters}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsPage;
