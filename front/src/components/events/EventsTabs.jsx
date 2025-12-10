/**
 * Компонент вкладок для фильтрации событий
 * Мои события | Активные события | Прошедшие события
 */

import { useEventsStore, EVENT_TABS } from "../../features/events/EventsStore";

// Конфигурация вкладок
const TABS_CONFIG = [
  {
    id: EVENT_TABS.MY,
    label: "Мои события",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
  {
    id: EVENT_TABS.ACTIVE,
    label: "Активные события",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    id: EVENT_TABS.PAST,
    label: "Прошедшие события",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

export function EventsTabs() {
  const activeTab = useEventsStore((s) => s.activeTab);
  const setActiveTab = useEventsStore((s) => s.setActiveTab);

  return (
    <div className="flex flex-wrap gap-2 p-1 bg-neutral-100 rounded-2xl">
      {TABS_CONFIG.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              group relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
              ${
                isActive
                  ? "bg-white text-neutral-900 shadow-md"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
              }
            `}
            title={tab.label}
          >
            {/* Иконка */}
            <span
              className={`transition-colors ${
                isActive ? "text-violet-600" : "text-neutral-400 group-hover:text-neutral-600"
              }`}
            >
              {tab.icon}
            </span>

            {/* Текст */}
            <span className="hidden sm:inline">{tab.label}</span>

            {/* Индикатор активной вкладки */}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-600 rounded-full" />
            )}

            {/* Всплывающая подсказка для мобильных */}
            <span className="sm:hidden absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-neutral-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

