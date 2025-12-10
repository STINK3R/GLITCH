/**
 * API сервис для работы с уведомлениями
 */

import { http } from "../../services/http";

export const notificationsApi = {
  /**
   * Получить все уведомления пользователя
   * @returns {Promise<Array>} Список уведомлений
   */
  getAll: () => http("/api/notifications"),

  /**
   * Отметить уведомление как прочитанное
   * @param {number|string} notificationId - ID уведомления
   * @returns {Promise<Object>} Обновленное уведомление
   */
  markAsRead: (notificationId) =>
    http(`/api/notifications/${notificationId}/read`, {
      method: "GET",
    }),

  /**
   * Отметить все уведомления как прочитанные
   * @returns {Promise<void>}
   */
  markAllAsRead: async () => {
    // Получаем все уведомления и отмечаем каждое как прочитанное
    const notifications = await http("/api/notifications");
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => 
      http(`/api/notifications/${n.id}/read`, { method: "GET" })
    ));
  },
};
