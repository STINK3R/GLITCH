/**
 * Layout для админ-панели
 * Содержит боковое меню и основной контент
 */

import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../auth/AuthStore";
import { exportUsersToCSV, exportUsersToXLSX } from "../../../utils/exportUsers";

// Иконка логотипа Слёт
const LogoIcon = () => (
  <svg width="57" height="45" viewBox="0 0 57 45" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5204 15.9996C14.8899 16.9922 17.2132 18.0262 19.2457 19.0137C19.9474 24.1709 24.2176 28.1378 29.3806 28.1378C32.965 28.1377 36.119 26.2257 37.9475 23.331C38.2032 23.2446 38.4534 23.158 38.6979 23.0704C41.6852 22.0003 43.9121 20.8113 45.4091 19.4097C45.4697 19.3558 45.6475 19.2399 46.0155 19.1079C46.1068 19.0752 46.2057 19.0427 46.3125 19.011C45.1465 31.4718 31.4061 43.2796 30.9947 43.6671C30.5669 44.07 29.4359 44.9952 29.43 45C29.4242 44.9952 28.2951 44.0646 27.8654 43.6671C27.434 43.2682 12.4688 30.4024 12.4688 17.3506C12.4688 16.8982 12.4862 16.4475 12.5204 15.9996Z" fill="#EE2C34"/>
<path d="M29.43 0C33.9284 8.4472e-06 38.2425 1.82804 41.4234 5.08187C42.396 6.07685 43.238 7.18049 43.9388 8.36452C41.9054 9.63328 40.2317 11.0023 38.8763 12.2024L38.446 12.5773C36.733 9.19722 33.3162 6.89219 29.3806 6.89218C28.0218 6.89218 26.7249 7.16708 25.5386 7.66599C22.4997 6.93029 19.3756 6.5038 16.2614 6.41565C16.6288 5.95274 17.0207 5.5073 17.4366 5.08187C20.6174 1.82801 24.9316 0 29.43 0Z" fill="#EE2C34"/>
<path d="M52.9317 8.79995L45.3779 15.7644C45.3783 15.7645 46.1687 15.8476 46.6603 15.9716C47.753 16.2474 49.2637 17.2038 49.2708 17.2083C49.2669 17.2097 48.4323 17.5146 47.4039 17.6827C46.1503 17.8877 45.2864 18.1981 44.8865 18.5454C42.2034 20.9859 36.6017 22.9168 27.0597 24.7306C20.1505 26.0294 16.6639 26.4021 16.716 25.8579C16.7868 25.3168 20.0656 23.1325 22.4924 21.9531C22.4916 21.9646 22.491 21.9709 22.491 21.9709L28.8189 19.187C28.8115 19.1879 25.9874 19.5063 24.1669 20.1081L22.2301 19.1201C16.0634 15.9557 5.25582 11.8569 0 10.3761C0.021889 10.369 7.65647 7.8866 14.7851 7.79091C21.9239 7.6951 29.2215 9.406 35.444 12.5614L38.5134 14.1459L39.7177 13.1313C41.6705 11.4587 44.2634 9.46934 47.6374 7.9457C51.0869 6.38801 57 5.3999 57 5.3999L52.9317 8.79995Z" fill="#EE2C34"/>
</svg>

);

// Иконка закрытия
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Иконка меню (бургер)
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Иконка темы
const ThemeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.414 1.414M11.536 11.536l1.414 1.414M3.05 12.95l1.414-1.414M11.536 4.464l1.414-1.414" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Иконка экспорта
const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 1h8l3 3v11a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6v6M5 9l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Иконка личных данных
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 14c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Иконка выхода
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Модальное окно подтверждения выхода
function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl transform animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-end px-6 pt-4">
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="px-6 pb-6 text-center">
          <p className="text-lg text-neutral-900">
            Вы точно хотите выйти из аккаунта?
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
          >
            Выйти
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);
  const profileMenuRef = useRef(null);

  // Закрытие меню профиля при клике вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Скрытие сообщения об экспорте
  useEffect(() => {
    if (exportMessage) {
      const timer = setTimeout(() => setExportMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [exportMessage]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    navigate("/login");
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    setIsProfileMenuOpen(false);
    try {
      const result = await exportUsersToCSV();
      setExportMessage({ type: "success", text: `Экспортировано ${result.count} пользователей в CSV` });
    } catch (error) {
      setExportMessage({ type: "error", text: error.message || "Ошибка экспорта" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportXLSX = async () => {
    setIsExporting(true);
    setIsProfileMenuOpen(false);
    try {
      const result = await exportUsersToXLSX();
      setExportMessage({ type: "success", text: `Экспортировано ${result.count} пользователей в Excel` });
    } catch (error) {
      setExportMessage({ type: "error", text: error.message || "Ошибка экспорта" });
    } finally {
      setIsExporting(false);
    }
  };

  const menuItems = [
    { path: "/admin/users", label: "Управление пользователями" },
    { path: "/admin/events", label: "Управление событиями" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Хедер */}
      <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          {/* Левая часть: меню + логотип */}
          <div className="flex items-center gap-3">
            {/* Кнопка мобильного меню */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            
            <LogoIcon />
            <div className="hidden sm:block">
              <div className="text-lg font-semibold text-neutral-900">Слёт</div>
              <div className="text-xs text-neutral-500">Администрирование</div>
            </div>
          </div>

          {/* Правая часть хедера */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Профиль */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-200 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500 font-medium text-sm sm:text-base">
                      {user?.name?.[0] || "A"}
                    </div>
                  )}
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={`hidden sm:block text-neutral-400 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`}
                >
                  <path
                    d="M4 6l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Выпадающее меню профиля */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
                  {/* Настройки */}
                  <div className="px-4 py-2">
                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
                      Настройки
                    </div>
                    <button className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center gap-3">
                      <span className="text-red-500"><ThemeIcon /></span>
                      Тема: Светлая
                    </button>
                  </div>

                  {/* Экспорт */}
                  <div className="px-4 py-2 border-t border-neutral-100">
                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
                      Экспорт
                    </div>
                    <button
                      onClick={handleExportCSV}
                      disabled={isExporting}
                      className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center gap-3 disabled:opacity-50"
                    >
                      <span className="text-red-500"><ExportIcon /></span>
                      Экспорт пользователей в CSV
                    </button>
                    <button
                      onClick={handleExportXLSX}
                      disabled={isExporting}
                      className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center gap-3 disabled:opacity-50"
                    >
                      <span className="text-red-500"><ExportIcon /></span>
                      Экспорт пользователей в Excel
                    </button>
                  </div>

                  {/* Аккаунт */}
                  <div className="px-4 py-2 border-t border-neutral-100">
                    <div className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-2">
                      Аккаунт
                    </div>
                    <button className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center gap-3">
                      <span className="text-red-500"><UserIcon /></span>
                      Личные данные
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center gap-3"
                    >
                      <span className="text-neutral-400"><LogoutIcon /></span>
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Уведомление об экспорте */}
      {exportMessage && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in ${
            exportMessage.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {exportMessage.type === "success" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="text-sm font-medium">{exportMessage.text}</span>
        </div>
      )}

      <div className="flex">
        {/* Оверлей для мобильного меню */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Боковое меню */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 min-h-[calc(100vh-57px)] lg:min-h-[calc(100vh-73px)]
            bg-white border-r border-neutral-200 p-4
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            top-[57px] sm:top-[65px] lg:top-0
          `}
        >
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full lg:w-auto">
          <Outlet />
        </main>
      </div>

      {/* Модальное окно подтверждения выхода */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
