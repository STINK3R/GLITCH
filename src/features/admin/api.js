/**
 * API сервис для админки
 * Работа с событиями и пользователями
 */

import { http } from "../../services/http";

const API_URL = import.meta.env.VITE_API_URL || "";

export const adminApi = {
  // ==================== СОБЫТИЯ ====================

  /**
   * Получить все события (для админа)
   * @returns {Promise<Array>} Список всех событий
   */
  getEvents: () => http("/api/events"),

  /**
   * Получить активные события
   * @returns {Promise<Array>} Список активных событий
   */
  getActiveEvents: () => http("/api/events/active"),

  /**
   * Получить прошедшие события
   * @returns {Promise<Array>} Список прошедших событий
   */
  getPastEvents: () => http("/api/events/past"),

  /**
   * Получить событие по ID
   * @param {number|string} id - ID события
   * @returns {Promise<Object>} Данные события
   */
  getEventById: (id) => http(`/api/events/${id}`),

  /**
   * Создать новое событие
   * @param {FormData} formData - Данные события с файлом обложки
   * @returns {Promise<Object>} Созданное событие
   */
  createEvent: async (formData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || "Ошибка создания события");
    }

    return res.json();
  },

  /**
   * Обновить событие
   * @param {number|string} id - ID события
   * @param {FormData} formData - Данные события
   * @returns {Promise<Object>} Обновленное событие
   */
  updateEvent: async (id, formData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/events/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || "Ошибка обновления события");
    }

    return res.json();
  },

  /**
   * Удалить событие
   * @param {number|string} id - ID события
   * @returns {Promise<void>}
   */
  deleteEvent: (id) =>
    http(`/api/events/${id}`, {
      method: "DELETE",
    }),

  // ==================== ПОЛЬЗОВАТЕЛИ ====================

  /**
   * Получить всех пользователей
   * @returns {Promise<Array>} Список пользователей
   */
  getUsers: () => http("/api/users"),

  /**
   * Поиск пользователей
   * @param {string} query - Поисковый запрос
   * @returns {Promise<Array>} Список найденных пользователей
   */
  searchUsers: (query) => http(`/api/users/search?q=${encodeURIComponent(query)}`),

  // ==================== ТИПЫ СОБЫТИЙ ====================

  /**
   * Получить типы событий
   * @returns {Promise<Array>} Список типов событий
   */
  getEventTypes: () => http("/api/event-types"),

  // ==================== ГОРОДА ====================

  /**
   * Получить список городов
   * @returns {Promise<Array>} Список городов
   */
  getCities: () => http("/api/cities"),

  // ==================== ЗАГРУЗКА ФАЙЛОВ ====================

  /**
   * Загрузить изображение
   * @param {File} file - Файл изображения
   * @returns {Promise<Object>} URL загруженного изображения
   */
  uploadImage: async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/api/upload/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || error.message || "Ошибка загрузки изображения");
    }

    return res.json();
  },
};
