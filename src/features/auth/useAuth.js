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
   * @param {string} email - Email пользователя (username)
   * @param {string} password - Пароль
   */
  async function login(email, password) {
    const data = await authApi.login(email, password);
    // data = { access_token, refresh_token, type: "Bearer" }
    loginStore(data, { email }); // Сохраняем email как данные пользователя, т.к. API не возвращает user object
    return data;
  }

  /**
   * Регистрация (финальный вызов API)
   * @param {Object} data - { email, password, confirmPassword }
   */
  async function register(data) {
    // API: { username, password, repeat_password }
    const res = await authApi.register(data.email, data.password, data.confirmPassword || data.password);
    return res;
  }

  // Методы-заглушки для UI потока (т.к. API не поддерживает верификацию email)
  async function sendRegisterCode(email) {
    // Имитация задержки
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async function verifyCode(email, code) {
    // Имитация проверки (принимаем любой код)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Можно добавить простую проверку длины
        if (code.length === 4) resolve(true);
        else reject(new Error("Неверный формат кода"));
      }, 1000);
    });
  }

  // Методы заглушки для восстановления пароля
  async function sendRecoveryCode(email) {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  async function resetPassword(email, code, password) {
    // Здесь нет API сброса пароля, поэтому просто имитируем
    // Или можно вызвать какой-то другой метод, если он появится
    return new Promise(resolve => setTimeout(resolve, 1000));
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
