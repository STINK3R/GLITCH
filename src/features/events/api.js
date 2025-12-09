/**
 * API сервис для работы с событиями
 * Все методы подготовлены для подключения к FastAPI бэкенду
 */

import { http } from "../../services/http";

export const eventsApi = {
  /**
   * Получить все события
   * @returns {Promise<Array>} Список всех событий
   */
  getAll: () => http("/api/events"),

  /**
   * Получить активные события
   * @returns {Promise<Array>} Список активных событий
   */
  getActive: () => http("/api/events/active"),

  /**
   * Получить события пользователя (в которых он участвует)
   * @returns {Promise<Array>} Список событий пользователя
   */
  getMy: () => http("/api/events/my"),

  /**
   * Получить прошедшие события
   * @returns {Promise<Array>} Список прошедших событий
   */
  getPast: () => http("/api/events/past"),

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
    http(`/api/events/${eventId}/participate`, {
      method: "POST",
    }),

  /**
   * Отменить участие в событии
   * @param {number|string} eventId - ID события
   * @returns {Promise<Object>} Результат операции
   */
  cancelParticipation: (eventId) =>
    http(`/api/events/${eventId}/participate`, {
      method: "DELETE",
    }),

  /**
   * Получить участников события
   * @param {number|string} eventId - ID события
   * @returns {Promise<Array>} Список участников
   */
  getParticipants: (eventId) => http(`/api/events/${eventId}/participants`),
};

