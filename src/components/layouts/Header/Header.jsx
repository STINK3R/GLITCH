/**
 * Компонент шапки приложения "Слёт"
 * Содержит логотип, табы навигации, поиск и пользовательское меню
 */

import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore, USER_ROLES } from "../../../features/auth/AuthStore";
import { useEventsStore, EVENT_TABS } from "../../../features/events/EventsStore";

// Логотип Слёт - красная птица
const SletLogo = ({ size = 36 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 345 264" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M77.3112 93.8645C91.5939 99.6876 105.598 105.754 117.849 111.547C122.079 141.802 147.819 165.075 178.94 165.075C200.545 165.075 219.557 153.858 230.578 136.875C232.12 136.368 233.628 135.86 235.102 135.347C253.108 129.069 266.531 122.093 275.555 113.871C275.92 113.554 276.992 112.874 279.21 112.1C279.76 111.908 280.356 111.717 281 111.531C273.972 184.635 191.149 253.907 188.669 256.18C186.09 258.544 179.273 263.972 179.238 264C179.202 263.972 172.397 258.512 169.806 256.18C167.206 253.84 77.0002 178.361 77 101.79C77 99.1359 77.1052 96.4922 77.3112 93.8645Z" fill="#EE2C34"/>
    <path d="M179.238 0C206.352 4.95569e-05 232.357 10.7245 251.53 29.8136C257.393 35.6508 262.468 42.1256 266.692 49.0719C254.435 56.5152 244.347 64.5468 236.177 71.5876L233.583 73.7867C223.258 53.957 202.662 40.4342 178.94 40.4341C170.749 40.4341 162.932 42.0469 155.781 44.9738C137.463 40.6577 118.633 38.1556 99.8612 37.6385C102.076 34.9228 104.438 32.3095 106.945 29.8136C126.118 10.7243 152.123 0 179.238 0Z" fill="#EE2C34"/>
    <path d="M320.376 48.8602L274.656 91.589C274.658 91.5893 279.442 92.0992 282.417 92.8603C289.031 94.5525 298.175 100.42 298.218 100.447C298.195 100.456 293.143 102.327 286.918 103.358C279.331 104.616 274.102 106.52 271.682 108.651C255.442 123.624 221.537 135.471 163.782 146.599C121.964 154.568 100.86 156.854 101.176 153.515C101.605 150.196 121.45 136.794 136.138 129.558C136.133 129.629 136.13 129.667 136.13 129.667L174.43 112.588C174.385 112.593 157.292 114.546 146.273 118.239L134.551 112.177C97.2257 92.7623 31.8115 67.6156 0 58.5304C0.132486 58.4867 46.3418 43.2565 89.4886 42.6695C132.697 42.0816 176.867 52.5785 214.529 71.9376L233.107 81.659L240.396 75.4344C252.216 65.1725 267.91 52.9671 288.332 43.6192C309.21 34.0623 345 28 345 28L320.376 48.8602Z" fill="#EE2C34"/>
  </svg>
);

// Иконка поиска
const SearchIcon = () => (
  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Иконка сердца
const HeartIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

// Иконка колокольчика
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// Конфигурация вкладок навигации
const NAV_TABS = [
  { id: EVENT_TABS.ACTIVE, label: "Активные" },
  { id: EVENT_TABS.MY, label: "Мои события" },
  { id: EVENT_TABS.PAST, label: "Прошедшие" },
];

export default function Header() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Состояние для табов и поиска
  const activeTab = useEventsStore((s) => s.activeTab);
  const setActiveTab = useEventsStore((s) => s.setActiveTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Проверяем, находимся ли мы на странице детали события
  const isEventDetailPage = /^\/events\/\d+/.test(location.pathname);

  // Обработчик выхода
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Получаем инициалы пользователя
  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.name || user.email || "";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-100">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Левая часть: Логотип и город */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
          >
            <SletLogo size={32} />
            <div className="flex flex-col">
              <span className="text-neutral-900 font-bold text-lg leading-tight">Слёт</span>
              <span className="text-neutral-400 text-xs leading-tight">Москва, Россия</span>
            </div>
          </Link>

          {/* Центральная часть: Табы навигации */}
          {token && (
            <nav className="flex items-center gap-1 bg-neutral-100 rounded-full p-1">
              {NAV_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                // На странице детали события разрешаем только вкладку "Активные"
                const isDisabled = isEventDetailPage && tab.id !== EVENT_TABS.ACTIVE;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isDisabled) return;
                      setActiveTab(tab.id);
                      // Если на странице детали, переходим на главную
                      if (isEventDetailPage) {
                        navigate("/events");
                      }
                    }}
                    disabled={isDisabled}
                    className={`
                      px-5 py-2 text-sm font-medium rounded-full transition-all duration-200
                      ${isActive
                        ? "bg-white text-neutral-900 shadow-sm"
                        : isDisabled
                          ? "text-neutral-300 cursor-not-allowed"
                          : "text-neutral-500 hover:text-neutral-700"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Правая часть: Поиск и действия */}
          <div className="flex items-center gap-3">
            {token ? (
              <>
                {/* Поле поиска */}
                <div className="relative hidden md:block">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Введите название события"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full text-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
                  />
                </div>

                {/* Кнопка Избранное */}
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-full transition-colors">
                  <span className="text-red-500">
                    <HeartIcon />
                  </span>
                  <span className="hidden lg:inline">Избранное</span>
                </button>

                {/* Колокольчик уведомлений */}
                <button className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 rounded-full transition-colors">
                  <BellIcon />
                  {/* Индикатор уведомления */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {/* Аватар пользователя */}
                <Link to="/profile" className="shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-neutral-600 font-semibold text-sm">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                </Link>
              </>
            ) : (
              <>
                {/* Кнопки для неавторизованных */}
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Вход
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-5 py-2 text-sm font-medium bg-[#EE2C34] text-white rounded-full hover:bg-[#D42930] transition-colors"
                >
                  Регистрация
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
