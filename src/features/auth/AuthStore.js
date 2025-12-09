/**
 * Zustand store для управления состоянием авторизации
 * Хранит токен, данные пользователя и его роль
 */

import { create } from "zustand";

// Роли пользователей
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

/**
 * Получить сохраненные данные пользователя из localStorage
 */
function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create((set, get) => ({
  // Данные пользователя (включая роль)
  user: getSavedUser(),

  // Токены
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  token: localStorage.getItem("accessToken") || null, // Для обратной совместимости

  /**
   * Авторизация пользователя
   * @param {Object} data - Ответ API { access_token, refresh_token, ... }
   * @param {Object} userData - Данные пользователя (если есть)
   */
  login: (data, userData = null) =>
    set(() => {
      const accessToken = data.access_token;
      const refreshToken = data.refresh_token;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // Для совместимости с http.js
      localStorage.setItem("token", accessToken);

      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      return {
        user: userData || get().user,
        accessToken,
        refreshToken,
        token: accessToken
      };
    }),

  /**
   * Обновить только токены
   */
  setTokens: (accessToken, refreshToken) =>
    set(() => {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("token", accessToken);
      return { accessToken, refreshToken, token: accessToken };
    }),

  /**
   * Выход из системы
   */
  logout: () =>
    set(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { user: null, accessToken: null, refreshToken: null, token: null };
    }),

  /**
   * Обновить данные пользователя
   * @param {Object} userData - Новые данные пользователя
   */
  updateUser: (userData) =>
    set((state) => {
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { user: updatedUser };
    }),

  /**
   * Проверить, является ли пользователь администратором
   * @returns {boolean}
   */
  isAdmin: () => {
    const state = get();
    return state.user?.role === USER_ROLES.ADMIN;
  },

  /**
   * Проверить, авторизован ли пользователь
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const state = get();
    return !!state.accessToken;
  },
}));
