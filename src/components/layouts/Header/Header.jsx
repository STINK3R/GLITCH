/**
 * Компонент шапки приложения
 * Содержит навигацию, логотип и кнопки действий
 */

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, USER_ROLES } from "../../../features/auth/AuthStore";

export default function Header() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  // Проверяем, является ли пользователь администратором
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  // Обработчик выхода
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight text-neutral-900 hover:text-violet-600 transition-colors"
          >
            <span className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
              Я
            </span>
            <span>Ябуду</span>
          </Link>

          {/* Навигация */}
          <nav className="flex items-center gap-1">
            {token ? (
              <>
                {/* Ссылка на события */}
                <NavLink
                  to="/events"
                  title="События"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-violet-100 text-violet-700"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`
                  }
                >
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="hidden sm:inline">События</span>
                </NavLink>

                {/* Ссылка на админку (только для администраторов) */}
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    title="Администрирование"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-amber-100 text-amber-700"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      }`
                    }
                  >
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
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Админка</span>
                  </NavLink>
                )}

                {/* Разделитель */}
                <div className="w-px h-6 bg-neutral-200 mx-2" />

                {/* Информация о пользователе */}
                <div className="flex items-center gap-3">
                  {/* Аватар и имя */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <span className="text-sm font-medium text-neutral-700 max-w-[120px] truncate">
                      {user?.name || "Пользователь"}
                    </span>
                  </div>

                  {/* Кнопка выхода */}
                  <button
                    onClick={handleLogout}
                    title="Выход"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
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
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span className="hidden sm:inline">Выход</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Ссылки для неавторизованных */}
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-neutral-100 text-neutral-900"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                    }`
                  }
                >
                  Вход
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : "bg-violet-600 text-white hover:bg-violet-700"
                    }`
                  }
                >
                  Регистрация
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
