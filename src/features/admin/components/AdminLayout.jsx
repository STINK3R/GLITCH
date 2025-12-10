/**
 * Layout для админ-панели
 * Содержит боковое меню и основной контент
 */

import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../../auth/AuthStore";

// Иконка логотипа Слёт
const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6z"
      fill="#EE2C34"
    />
    <path
      d="M16 8c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm-2 4l6 4-6 4V12z"
      fill="#EE2C34"
    />
  </svg>
);

// Иконка колокольчика
const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export function AdminLayout() {
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { path: "/admin/users", label: "Управление пользователями" },
    { path: "/admin/events", label: "Управление событиями" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Хедер */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <div className="flex items-center gap-3">
            <LogoIcon />
            <div>
              <div className="text-lg font-semibold text-neutral-900">Слёт</div>
              <div className="text-xs text-neutral-500">Администрирование</div>
            </div>
          </div>

          {/* Правая часть хедера */}
          <div className="flex items-center gap-4">
            {/* Уведомления */}
            <button className="relative p-2 text-neutral-500 hover:text-neutral-700 transition-colors">
              <BellIcon />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Профиль */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-500 font-medium">
                    {user?.first_name?.[0] || "A"}
                  </div>
                )}
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-neutral-400"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Боковое меню */}
        <aside className="w-64 min-h-[calc(100vh-73px)] bg-white border-r border-neutral-200 p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
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
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
