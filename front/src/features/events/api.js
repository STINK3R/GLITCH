/**
 * API сервис для работы с событиями
 * Подключен к бэкенду http://185.211.5.223:1488/api
 * 
 * GET /api/events - основной эндпоинт для получения событий
 * Параметр -1 возвращает события пользователя
 */

import { http } from "../../services/http";

/**
 * Построить query string из объекта фильтров
 */
function buildQueryString(filters = {}) {
  const params = new URLSearchParams();
  
  // Все фильтры передаём как есть, если они заданы
  // Массивы разворачиваем в повторяющиеся параметры: type=A&type=B
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        // Каждый элемент массива добавляем как отдельный параметр
        value.forEach((item) => {
          if (item !== undefined && item !== null && item !== "") {
            params.append(key, item);
          }
        });
      } else {
        params.append(key, value);
      }
    }
  });
  
  return params.toString();
}

export const eventsApi = {
  /**
   * Получить все события с фильтрами
   * @param {Object} filters - Параметры фильтрации
   * @returns {Promise<Array>} Список событий
   */
  getAll: (filters = {}) => {
    const queryString = buildQueryString(filters);
    return http(`/api/events${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Получить активные события (все события без специальных фильтров)
   * @param {Object} filters - Параметры фильтрации
   * @returns {Promise<Array>} Список активных событий
   */
  getActive: (filters = {}) => {
    const queryString = buildQueryString(filters);
    return http(`/api/events${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Получить события пользователя (передаём -1)
   * @param {Object} filters - Дополнительные фильтры
   * @returns {Promise<Array>} Список событий пользователя
   */
  getMy: (filters = {}) => {
    // Параметр -1 возвращает события пользователя
    const queryParams = { ...filters, user_id: -1 };
    const queryString = buildQueryString(queryParams);
    return http(`/api/events${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Получить прошедшие события (status=completed)
   * @param {Object} filters - Дополнительные фильтры
   * @returns {Promise<Array>} Список прошедших событий
   */
  getPast: (filters = {}) => {
    const queryParams = { ...filters, status: "completed" };
    const queryString = buildQueryString(queryParams);
    return http(`/api/events${queryString ? `?${queryString}` : ""}`);
  },

  /**
   * Получить похожие события по типу
   * @param {string} type - Тип события
   * @param {number|string} excludeId - ID события для исключения
   * @returns {Promise<Array>} Список похожих событий
   */
  getSimilar: async (type, excludeId) => {
    const events = await http(`/api/events?type=${encodeURIComponent(type)}`);
    const eventsList = Array.isArray(events) ? events : [];
    return eventsList.filter((e) => String(e.id) !== String(excludeId)).slice(0, 4);
  },

  /**
   * Получить событие по ID
   * @param {number|string} id - ID события
   * @returns {Promise<Object>} Данные события
   */
  getById: (id) => http(`/api/events/${id}`),

  /**
   * Подтвердить участие в событии
   * @param {number|string} eventId - ID события
   * @returns {Promise<Object>} Результат операции
   */
  confirmParticipation: (eventId) =>
    http(`/api/events/${eventId}/join`, {
      method: "POST",
    }),

  /**
   * Отменить участие в событии
   * API использует GET для /events/{id}/leave
   * @param {number|string} eventId - ID события
   * @returns {Promise<Object>} Результат операции
   */
  cancelParticipation: (eventId) =>
    http(`/api/events/${eventId}/leave`, {
      method: "GET",
    }),

  /**
   * Добавить событие в избранное (лайк)
   * @param {number|string} eventId - ID события
   * @returns {Promise<Object>} Обновленное событие
   */
  likeEvent: (eventId) =>
    http(`/api/events/${eventId}/like`, {
      method: "POST",
    }),

  /**
   * Удалить событие из избранного (убрать лайк)
   * @param {number|string} eventId - ID события
   * @returns {Promise<Object>} Обновленное событие
   */
  unlikeEvent: (eventId) =>
    http(`/api/events/${eventId}/unlike`, {
      method: "DELETE",
    }),

  /**
   * Получить избранные события
   * @returns {Promise<Array>} Список избранных событий
   */
  getFavorites: () => http("/api/events/liked"),

  /**
   * Получить участников события
   * @param {number|string} eventId - ID события
   * @returns {Promise<Array>} Список участников
   */
  getParticipants: (eventId) => http(`/api/events/${eventId}/participants`),

  /**
   * Получить отзывы/комментарии события
   * @param {number|string} eventId - ID события
   * @returns {Promise<Array>} Список отзывов
   */
  getComments: (eventId) => http(`/api/events/${eventId}/comments`),

  /**
   * Добавить отзыв/комментарий к событию
   * @param {number|string} eventId - ID события
   * @param {Object} data - Данные отзыва { comment: string, rating: number }
   * @returns {Promise<Object>} Созданный отзыв
   */
  addComment: (eventId, data) =>
    http(`/api/events/${eventId}/comment`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
