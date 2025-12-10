/**
 * Защищённый маршрут только для администраторов
 * Проверяет авторизацию и роль пользователя
 */

import { Navigate } from "react-router-dom";
import { useAuthStore, USER_ROLES } from "../../features/auth/AuthStore";

export const AdminRoute = ({ children }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  // Если не авторизован - на страницу входа
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Если не админ - на главную
  if (user?.role !== USER_ROLES.ADMIN) {
    return <Navigate to="/events" replace />;
  }

  return children;
};
