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
    // API возвращает user в ответе с полем role
    const userData = data.user || { email };
    loginStore(data, userData);
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
    // Сохраняем email для последующей верификации через ссылку
    localStorage.setItem("pending_verification_email", data.email);
    return await authApi.registerRequest(data);
  }

  /**
   * Проверка кода (финализация регистрации)
   * @param {string} email - Email пользователя
   * @param {string} code - Код подтверждения
   */
  async function verifyCode(email, code) {
    const result = await authApi.registerConfirm(email, code);
    // Очищаем сохраненный email после успешной верификации
    localStorage.removeItem("pending_verification_email");
    return result;
  }

  /**
   * Проверка кода по ссылке (только код, email берется из localStorage)
   * @param {string} code - Код из ссылки
   */
  async function verifyEmailByCode(code) {
    // Пробуем получить email из localStorage
    const email = localStorage.getItem("pending_verification_email");
    
    if (email) {
      // Если email есть, используем стандартный метод
      const result = await authApi.registerConfirm(email, code);
      localStorage.removeItem("pending_verification_email");
      return result;
    } else {
      // Если email нет, пробуем только с кодом (если API поддерживает)
      const result = await authApi.registerConfirmByCode(code);
      return result;
    }
  }

  /**
   * Отправка кода восстановления
   */
  async function sendRecoveryCode(email) {
    return await authApi.resetPasswordRequest(email);
  }

  /**
   * Сброс пароля по токену
   * @param {string} token - JWT токен из ссылки
   * @param {string} password - Новый пароль
   * @param {string} repeatPassword - Подтверждение пароля
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
    verifyEmailByCode,
    sendRecoveryCode,
    resetPassword,
    refresh,
    logout,
    isAuthenticated,
    isAdmin,
  };
}
