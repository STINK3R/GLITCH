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
  const setTokens = useAuthStore((state) => state.setTokens);
  const logoutStore = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token); // accessToken

  /**
   * Авторизация пользователя
   * @param {string} email - Email пользователя
   * @param {string} password - Пароль
   */
  async function login(email, password) {
    // API использует email
    const data = await authApi.login(email, password);
    loginStore(data, { email });
    return data;
  }

  /**
   * Регистрация (полная)
   * Для совместимости, если вызывается старый метод
   */
  async function register(data) {
    return await authApi.registerRequest(data);
  }

  /**
   * Отправка кода регистрации (использует полный запрос регистрации)
   */
  async function sendRegisterCode(data) {
    return await authApi.registerRequest(data);
  }

  /**
   * Проверка кода (финализация регистрации)
   */
  async function verifyCode(email, code) {
    return await authApi.registerConfirm(email, code);
  }

  /**
   * Отправка кода восстановления
   */
  async function sendRecoveryCode(email) {
    return await authApi.resetPasswordRequest(email);
  }

  /**
   * Сброс пароля
   */
  async function resetPassword(token, password, repeatPassword) {
    return await authApi.resetPasswordConfirm(token, password, repeatPassword);
  }

  /**
   * Обновить токен
   */
  async function refresh() {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) throw new Error("No refresh token");

      const data = await authApi.refresh(refreshToken);
      if (data && data.access_token) {
        setTokens(data.access_token, data.refresh_token);
      }
      return data;
    } catch (error) {
      logout();
      throw error;
    }
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
    sendRegisterCode,
    verifyCode,
    sendRecoveryCode,
    resetPassword,
    refresh,
    logout,
    isAuthenticated,
    isAdmin,
  };
}
