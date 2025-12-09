/**
 * Хук для работы с авторизацией
 * Объединяет API вызовы и управление store
 */

import { useNavigate } from "react-router-dom";
import { useAuthStore } from "./AuthStore";
import { authApi } from "./api";

export function useAuth() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const logoutStore = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  /**
   * Авторизация пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль
   * @returns {Promise<Object>} Данные авторизации
   */
  async function login(email, password) {
    const data = await authApi.login(email, password);
    loginStore(data);
    return data;
  }

  /**
   * Регистрация пользователя
   * @param {string} email - Email
   * @param {string} password - Пароль
   * @returns {Promise<Object>} Результат регистрации
   */
  async function register(email, password) {
    const data = await authApi.register(email, password);
    return data;
  }

  /**
   * Выход из системы
   */
  function logout() {
    logoutStore();
    navigate("/login");
  }

  /**
   * Проверка авторизации
   * @returns {boolean}
   */
  function isAuthenticated() {
    return !!token;
  }

  /**
   * Проверка роли администратора
   * @returns {boolean}
   */
  function isAdmin() {
    return user?.role === "admin";
  }

  return {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
  };
}
