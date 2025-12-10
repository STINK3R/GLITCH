/**
 * Компонент шапки приложения "Слёт"
 * Содержит логотип, табы навигации, поиск и пользовательское меню
 */

import { useState, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, USER_ROLES } from "../../../features/auth/AuthStore";
import { useEventsStore, EVENT_TABS } from "../../../features/events/EventsStore";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "../../../features/notifications/useNotifications";

import searchIcon from "/icons/search-normal.svg";
import heartIcon from "/icons/heart.svg";
import bellIcon from "/icons/notification.svg";
import { NotificationsPanel, NOTIFICATION_TYPES } from "../../ui/NotificationsPanel";
import { UserProfileModal } from "../../ui/UserProfileModal";
import { FavoritesModal } from "../../ui/FavoritesModal";

// Высота всех элементов в хедере
const HEADER_ELEMENT_HEIGHT = 48;

// Полный логотип Слёт - иконка птицы + текст "Слёт" (SVG)
const SletFullLogo = ({ height = 45 }) => (
  <svg 
    height={height}
    viewBox="0 0 799 264" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Текст "Слёт" */}
    <path d="M449.017 197.925C428.833 197.925 413.258 192.092 402.292 180.425C391.558 169.342 386.192 153.942 386.192 134.225V132.825C386.192 113.925 392.142 98.525 404.042 86.625C415.592 74.8417 430.35 68.95 448.317 68.95C463.95 68.95 476.608 72.6833 486.292 80.15C496.558 88.2 502.392 99.6333 503.792 114.45H474.742C472.642 99.05 463.892 91.35 448.492 91.35C438.575 91.35 430.7 95.025 424.867 102.375C419.033 109.608 416.117 119.7 416.117 132.65V134.05C416.117 147.117 418.917 157.208 424.517 164.325C430.233 171.442 438.283 175 448.667 175C456.6 175 463.075 173.017 468.092 169.05C473.108 164.967 476.2 158.958 477.367 151.025H505.192C503.675 166.308 497.783 177.975 487.517 186.025C477.6 193.958 464.767 197.925 449.017 197.925ZM549.125 158.375C547.609 171.792 544.809 181.708 540.725 188.125C536.642 194.542 530.167 197.75 521.3 197.75C518.15 197.75 515.934 197.517 514.65 197.05L512.55 196.35V176.225C512.667 176.342 512.959 176.458 513.425 176.575C514.359 176.808 515.35 176.925 516.4 176.925C519.667 176.925 522.117 175 523.75 171.15C525.384 167.183 526.55 161.233 527.25 153.3C527.367 151.433 527.484 148.983 527.6 145.95C527.834 142.917 528.009 139.242 528.125 134.925C528.359 130.492 528.534 126.992 528.65 124.425C528.884 116.025 529 109.375 529 104.475H599.525V196H574.5V122.5H550.875C550.642 138.25 550.059 150.208 549.125 158.375ZM665.649 197.925C651.415 197.925 640.04 193.783 631.524 185.5C622.424 177.1 617.874 165.725 617.874 151.375V149.975C617.874 135.742 622.424 124.192 631.524 115.325C640.39 106.692 651.532 102.375 664.949 102.375C677.665 102.375 688.049 106.05 696.099 113.4C705.082 121.567 709.574 133.408 709.574 148.925V155.925H643.599C643.949 163.625 646.049 169.575 649.899 173.775C653.865 177.858 659.349 179.9 666.349 179.9C677.315 179.9 683.674 175.642 685.424 167.125H709.399C707.882 177.042 703.332 184.683 695.749 190.05C688.282 195.3 678.249 197.925 665.649 197.925ZM684.899 140.35C684.082 126.7 677.432 119.875 664.949 119.875C659.232 119.875 654.507 121.683 650.774 125.3C647.157 128.8 644.882 133.817 643.949 140.35H684.899ZM655.674 87.325C653.224 89.775 650.19 91 646.574 91C642.957 91 639.865 89.775 637.299 87.325C634.849 84.875 633.624 81.9 633.624 78.4C633.624 74.9 634.849 71.925 637.299 69.475C639.865 67.025 642.957 65.8 646.574 65.8C650.19 65.8 653.224 67.025 655.674 69.475C658.24 71.925 659.524 74.9 659.524 78.4C659.524 81.9 658.24 84.875 655.674 87.325ZM691.374 87.325C688.924 89.775 685.89 91 682.274 91C678.657 91 675.565 89.775 672.999 87.325C670.549 84.875 669.324 81.9 669.324 78.4C669.324 74.9 670.549 71.925 672.999 69.475C675.565 67.025 678.657 65.8 682.274 65.8C685.89 65.8 688.924 67.025 691.374 69.475C693.94 71.925 695.224 74.9 695.224 78.4C695.224 81.9 693.94 84.875 691.374 87.325ZM795.834 122.5H768.709V196H743.509V122.5H716.384V104.475H795.834V122.5Z" fill="#171717"/>
    {/* Иконка */}
    <path d="M77.3112 93.8645C91.5939 99.6876 105.598 105.754 117.849 111.547C122.079 141.802 147.819 165.075 178.94 165.075C200.545 165.075 219.557 153.858 230.578 136.875C232.12 136.368 233.628 135.86 235.102 135.347C253.108 129.069 266.531 122.093 275.555 113.871C275.92 113.554 276.992 112.874 279.21 112.1C279.76 111.908 280.356 111.717 281 111.531C273.972 184.635 191.149 253.907 188.669 256.18C186.09 258.544 179.273 263.972 179.238 264C179.202 263.972 172.397 258.512 169.806 256.18C167.206 253.84 77.0002 178.361 77 101.79C77 99.1359 77.1052 96.4922 77.3112 93.8645Z" fill="#EE2C34"/>
    <path d="M179.238 0C206.352 4.95569e-05 232.357 10.7245 251.53 29.8136C257.393 35.6508 262.468 42.1256 266.692 49.0719C254.435 56.5152 244.347 64.5468 236.177 71.5876L233.583 73.7867C223.258 53.957 202.662 40.4342 178.94 40.4341C170.749 40.4341 162.932 42.0469 155.781 44.9738C137.463 40.6577 118.633 38.1556 99.8612 37.6385C102.076 34.9228 104.438 32.3095 106.945 29.8136C126.118 10.7243 152.123 0 179.238 0Z" fill="#EE2C34"/>
    <path d="M320.376 48.8602L274.656 91.589C274.658 91.5893 279.442 92.0992 282.417 92.8603C289.031 94.5525 298.175 100.42 298.218 100.447C298.195 100.456 293.143 102.327 286.918 103.358C279.331 104.616 274.102 106.52 271.682 108.651C255.442 123.624 221.537 135.471 163.782 146.599C121.964 154.568 100.86 156.854 101.176 153.515C101.605 150.196 121.45 136.794 136.138 129.558C136.133 129.629 136.13 129.667 136.13 129.667L174.43 112.588C174.385 112.593 157.292 114.546 146.273 118.239L134.551 112.177C97.2257 92.7623 31.8115 67.6156 0 58.5304C0.132486 58.4867 46.3418 43.2565 89.4886 42.6695C132.697 42.0816 176.867 52.5785 214.529 71.9376L233.107 81.659L240.396 75.4344C252.216 65.1725 267.91 52.9671 288.332 43.6192C309.21 34.0623 345 28 345 28L320.376 48.8602Z" fill="#EE2C34"/>
  </svg>
);

// Конфигурация вкладок навигации
const NAV_TABS = [
  { id: EVENT_TABS.ACTIVE, label: "Активные" },
  { id: EVENT_TABS.MY, label: "Мои события" },
  { id: EVENT_TABS.PAST, label: "Прошедшие" },
];

// Получить заголовок уведомления по типу
function getNotificationTitle(type) {
  const titles = {
    "event_created": "Вас пригласили на событие",
    "event_updated": "Изменение в событии",
    "event_deleted": "Событие отменено",
    "event_reminder": "Напоминание о событии",
    "review_request": "Оставьте отзыв на событие",
    "invitation": "Вас пригласили на событие",
  };
  return titles[type] || "Уведомление";
}

// Получить сообщение уведомления
function getNotificationMessage(type, eventName) {
  const messages = {
    "event_created": "Подтвердите ваше участие",
    "event_updated": eventName ? `Дата начала события изменена` : "Информация о событии обновлена",
    "event_deleted": "Событие было отменено организатором",
    "event_reminder": "Событие начнется скоро",
    "review_request": "Поделитесь впечатлениями",
    "invitation": "Подтвердите ваше участие",
  };
  return messages[type] || "";
}

export default function Header() {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  
  // Состояние для табов и поиска
  const activeTab = useEventsStore((s) => s.activeTab);
  const setActiveTab = useEventsStore((s) => s.setActiveTab);
  const searchQuery = useEventsStore((s) => s.searchQuery);
  const setSearchQuery = useEventsStore((s) => s.setSearchQuery);
  
  // Состояние для фокуса и ховера поиска (как в AuthInput)
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  
  // Состояние для панели уведомлений
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // Состояние для модального окна профиля
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Состояние для модального окна избранного
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  
  // Получаем уведомления с API
  const { data: rawNotifications = [], isLoading: isLoadingNotifications } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  
  // Маппинг типов уведомлений с бэкенда на UI типы
  const mapNotificationType = (type) => {
    const typeMap = {
      "event_created": NOTIFICATION_TYPES.INVITATION,
      "event_updated": NOTIFICATION_TYPES.EVENT_UPDATED,
      "event_deleted": NOTIFICATION_TYPES.EVENT_DELETED,
      "event_reminder": NOTIFICATION_TYPES.REMINDER,
      "review_request": NOTIFICATION_TYPES.REVIEW,
      "invitation": NOTIFICATION_TYPES.INVITATION,
    };
    return typeMap[type] || NOTIFICATION_TYPES.SYSTEM;
  };
  
  // Преобразуем уведомления с бэкенда в формат UI
  const notifications = useMemo(() => {
    return rawNotifications.map(n => ({
      id: n.id,
      type: mapNotificationType(n.type),
      title: getNotificationTitle(n.type),
      message: getNotificationMessage(n.type, n.event_name),
      eventName: n.event_name,
      eventLink: n.event_id ? `/events/${n.event_id}` : null,
      createdAt: n.created_at,
      isRead: n.is_read,
      actionText: n.type === "event_created" || n.type === "invitation" ? "Принять" : 
                  n.type === "review_request" ? "Оценить" : null,
      actionData: { eventId: n.event_id },
    }));
  }, [rawNotifications]);
  
  // Обработчики уведомлений
  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  const handleNotificationAction = (id, actionData) => {
    // Обработка действия (например, переход на событие)
    if (actionData?.eventId) {
      navigate(`/events/${actionData.eventId}`);
    }
    handleMarkAsRead(id);
    setIsNotificationsOpen(false);
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

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
    <header className="sticky top-0 z-40 w-full bg-[#FAFAFA] border-b border-neutral-100 transform-gpu backface-visibility-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-[47px] py-3 md:py-4 lg:py-[26px]">
        <div className="flex items-center">
          {/* 1. Аватар пользователя (только на мобильных) */}
          {token && (
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="shrink-0 md:hidden mr-3"
            >
              <div 
                className="bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm w-10 h-10"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-neutral-600 font-semibold text-sm">
                    {getUserInitials()}
                  </span>
                )}
              </div>
            </button>
          )}

          {/* 2. Дата (только на мобильных) или Логотип (на десктопе) */}
          <div className="md:hidden flex-1 text-center">
            <span className="text-lg font-semibold text-neutral-900">
              {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
            </span>
          </div>
          
          {/* Логотип (скрыт на мобильных) */}
          <button
            onClick={() => {
              setActiveTab(EVENT_TABS.MY);
              navigate("/events");
            }}
            className="hidden md:flex flex-col hover:opacity-80 transition-opacity shrink-0 mr-4 lg:mr-[32px]"
          >
            <SletFullLogo height={45} />
          </button>

          {/* 3. Табы навигации (скрыты на мобильных) */}
          {token && (
            <nav className="hidden lg:flex items-center p-[2px] bg-[#EFEFEF] rounded-[20px] shrink-0 mr-[10px]" style={{ height: HEADER_ELEMENT_HEIGHT }}>
              {NAV_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      navigate("/events");
                    }}
                    className={`
                      h-[44px] px-6 xl:px-[55px] text-[15px] font-medium rounded-[18px] transition-all duration-200 flex items-center justify-center whitespace-nowrap
                      ${isActive
                        ? "bg-[#E3E3E3] text-neutral-900"
                        : "text-neutral-900 hover:bg-white/50"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* 4. Поиск (скрыт на мобильных) */}
          {token && (
            <div 
              className="hidden md:block relative w-[200px] lg:w-[320px] shrink-0 mr-[10px]"
              onMouseEnter={() => setIsSearchHovered(true)}
              onMouseLeave={() => setIsSearchHovered(false)}
            >
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <img src={searchIcon} alt="" className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Введите название события"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={{ height: HEADER_ELEMENT_HEIGHT }}
                className={`w-full pl-12 pr-4 bg-[#EFEFEF] rounded-[20px] text-base placeholder-neutral-400 outline-none transition-all duration-200 border ${
                  isSearchFocused || isSearchHovered
                    ? "border-neutral-900"
                    : "border-transparent"
                } ${searchQuery ? "font-semibold text-neutral-900" : "text-neutral-900"}`}
              />
            </div>
          )}

          {/* Спейсер для выравнивания справа (скрыт на мобильных) */}
          <div className="hidden md:flex flex-1" />

          {/* 5. Действия (Избранное, Колокольчик, Аватар) */}
          <div className="flex items-center shrink-0">
            {token ? (
              <>
                {/* Кнопка Избранное (скрыта на мобильных) */}
                <button 
                  onClick={() => setIsFavoritesModalOpen(true)}
                  className="hidden md:flex items-center gap-2 px-4 text-sm font-medium bg-[#EFEFEF] rounded-[20px] text-neutral-700 hover:bg-neutral-200 transition-colors mr-[10px]"
                  style={{ height: HEADER_ELEMENT_HEIGHT }}
                >
                  <img src={heartIcon} alt="" className="w-5 h-5" />
                  <span className="hidden lg:inline">Избранное</span>
                </button>

                {/* Колокольчик уведомлений */}
                <div className="relative">
                  <button 
                    data-notification-bell
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative flex items-center justify-center text-neutral-500 rounded-full md:rounded-[20px] bg-[#EFEFEF] hover:text-neutral-700 hover:bg-neutral-200 transition-colors w-10 h-10 md:w-12 md:h-12"
                  >
                    <img src={bellIcon} alt="" className="w-5 h-5 md:w-6 md:h-6" />
                    {/* Индикатор уведомления */}
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 md:top-2 md:right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                    )}
                  </button>
                  
                  {/* Панель уведомлений */}
                  <NotificationsPanel
                    isOpen={isNotificationsOpen}
                    onClose={() => setIsNotificationsOpen(false)}
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onAction={handleNotificationAction}
                  />
                </div>

                {/* Аватар пользователя (скрыт на мобильных - показан слева) */}
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="hidden md:block shrink-0 ml-[10px]"
                >
                  <div 
                    className="bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-[20px] flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm hover:ring-neutral-300 transition-all"
                    style={{ height: HEADER_ELEMENT_HEIGHT, width: HEADER_ELEMENT_HEIGHT }}
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-neutral-600 font-semibold text-sm">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                </button>
                
                {/* Модальное окно профиля */}
                <UserProfileModal
                  isOpen={isProfileModalOpen}
                  onClose={() => setIsProfileModalOpen(false)}
                />
                
                {/* Модальное окно избранного */}
                <FavoritesModal
                  isOpen={isFavoritesModalOpen}
                  onClose={() => setIsFavoritesModalOpen(false)}
                />
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
