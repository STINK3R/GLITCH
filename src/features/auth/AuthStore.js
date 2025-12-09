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

  // JWT токен
  token: localStorage.getItem("token") || null,

  /**
   * Авторизация пользователя
   * @param {Object} data - Данные авторизации { token, user }
   */
  login: (data) =>
    set(() => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { user: data.user, token: data.token };
    }),

  /**
   * Обновить только токен
   * @param {string} token - Новый токен
   */
  setToken: (token) =>
    set(() => {
      localStorage.setItem("token", token);
      return { token };
    }),

  /**
   * Выход из системы
   */
  logout: () =>
    set(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { user: null, token: null };
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
    return !!state.token;
  },
}));
