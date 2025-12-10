/**
 * Мобильная нижняя навигация
 * Отображается только на мобильных устройствах
 */

import { NavLink, useLocation } from "react-router-dom";

// Иконки
import eventsIcon from "/icons/events.svg";
import heartIcon from "/icons/heart.svg";
import accountIcon from "/icons/account.svg";

// Конфигурация пунктов меню
const NAV_ITEMS = [
  {
    id: "events",
    label: "События",
    icon: eventsIcon,
    path: "/events",
    activeColor: "#EE2C34",
  },
  {
    id: "favorites",
    label: "Избранные",
    icon: heartIcon,
    path: "/favorites",
    activeColor: "#EE2C34",
  },
  {
    id: "account",
    label: "Аккаунт",
    icon: accountIcon,
    path: "/profile",
    activeColor: "#EE2C34",
  },
];

export default function MobileBottomNav() {
  const location = useLocation();
  
  // Определяем активный пункт меню
  const isActive = (path) => {
    if (path === "/events") {
      return location.pathname === "/events" || location.pathname.startsWith("/events/");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-neutral-100">
      <div className="flex items-center justify-around h-[56px] px-4">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1 min-w-[70px] py-2"
            >
              <div 
                className="w-6 h-6 flex items-center justify-center"
                style={{ 
                  filter: active 
                    ? "invert(24%) sepia(94%) saturate(2255%) hue-rotate(340deg) brightness(89%) contrast(101%)" 
                    : "invert(60%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)"
                }}
              >
                <img src={item.icon} alt="" className="w-6 h-6" />
              </div>
              <span 
                className={`text-[11px] font-medium ${
                  active ? "text-[#EE2C34]" : "text-neutral-400"
                }`}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
