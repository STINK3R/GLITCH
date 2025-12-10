/**
 * Компонент шапки приложения "Слёт"
 * Содержит навигацию, логотип и кнопки действий
 */

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore, USER_ROLES } from "../../../features/auth/AuthStore";

// Логотип Слёт - из официального SVG файла (только иконка)
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
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Логотип - текст чёрный */}
          <Link
            to="/"
            className="flex items-center gap-1 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            <svg width="57" height="45" viewBox="0 0 57 45" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5204 15.9996C14.8899 16.9922 17.2132 18.0262 19.2457 19.0137C19.9474 24.1709 24.2176 28.1378 29.3807 28.1378C32.965 28.1377 36.119 26.2257 37.9475 23.331C38.2032 23.2446 38.4535 23.158 38.6979 23.0704C41.6852 22.0003 43.9121 20.8113 45.4091 19.4097C45.4697 19.3558 45.6475 19.2399 46.0156 19.1079C46.1068 19.0752 46.2057 19.0427 46.3125 19.011C45.1465 31.4718 31.4061 43.2796 30.9947 43.6671C30.5669 44.07 29.4359 44.9952 29.4301 45C29.4242 44.9952 28.2952 44.0646 27.8654 43.6671C27.434 43.2682 12.4688 30.4024 12.4688 17.3506C12.4688 16.8982 12.4862 16.4475 12.5204 15.9996Z" fill="#EE2C34"/>
<path d="M29.4301 0C33.9284 8.4472e-06 38.2425 1.82804 41.4234 5.08187C42.396 6.07685 43.238 7.18049 43.9388 8.36452C41.9054 9.63328 40.2318 11.0023 38.8763 12.2024L38.446 12.5773C36.733 9.19722 33.3162 6.89219 29.3807 6.89218C28.0219 6.89218 26.7249 7.16708 25.5386 7.66599C22.4997 6.93029 19.3756 6.5038 16.2615 6.41565C16.6288 5.95274 17.0207 5.5073 17.4366 5.08187C20.6174 1.82801 24.9317 0 29.4301 0Z" fill="#EE2C34"/>
<path d="M52.9317 8.79995L45.3779 15.7644C45.3783 15.7645 46.1687 15.8476 46.6603 15.9716C47.753 16.2474 49.2637 17.2038 49.2708 17.2083C49.2669 17.2097 48.4323 17.5146 47.4039 17.6827C46.1503 17.8877 45.2864 18.1981 44.8865 18.5454C42.2034 20.9859 36.6017 22.9168 27.0597 24.7306C20.1505 26.0294 16.6639 26.4021 16.716 25.8579C16.7868 25.3168 20.0656 23.1325 22.4924 21.9531C22.4916 21.9646 22.491 21.9709 22.491 21.9709L28.8189 19.187C28.8115 19.1879 25.9874 19.5063 24.1669 20.1081L22.2301 19.1201C16.0634 15.9557 5.25582 11.8569 0 10.3761C0.021889 10.369 7.65647 7.8866 14.7851 7.79091C21.9239 7.6951 29.2215 9.406 35.444 12.5614L38.5134 14.1459L39.7177 13.1313C41.6705 11.4587 44.2634 9.46934 47.6374 7.9457C51.0869 6.38801 57 5.3999 57 5.3999L52.9317 8.79995Z" fill="#EE2C34"/>
</svg>

            <span className="text-neutral-900 font-bold text-xl">Слёт</span>
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
                        ? "bg-red-50 text-[#EE2C34]"
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
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-[#EE2C34] transition-colors"
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
                    `px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#EE2C34] text-white"
                        : "bg-[#EE2C34] text-white hover:bg-[#D42930]"
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
