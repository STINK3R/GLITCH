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
   * Получить активные события (статусы: active, coming soon)
   * @returns {Promise<Array>} Список активных событий
   */
  getActiveEvents: async () => {
    const events = await http("/api/events");
    return (events || []).filter(e => {
      // Исключаем отменённые и завершённые
      if (e.status === "cancelled" || e.status === "completed") {
        return false;
      }
      // Активные и скоро начнутся
      return e.status === "active" || e.status === "coming soon";
    });
  },

  /**
   * Получить прошедшие события (статус: completed)
   * @returns {Promise<Array>} Список прошедших событий
   */
  getPastEvents: async () => {
    const events = await http("/api/events");
    return (events || []).filter(e => e.status === "completed");
  },

  /**
   * Получить отклонённые события (статус: cancelled)
   * @returns {Promise<Array>} Список отклонённых событий
   */
  getCancelledEvents: async () => {
    const events = await http("/api/events");
    console.log("All events for cancelled filter:", events?.map(e => ({ id: e.id, name: e.name, status: e.status })));
    const cancelled = (events || []).filter(e => e.status === "cancelled");
    console.log("Cancelled events:", cancelled);
    return cancelled;
  },

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
   * Удалить событие (отмена через изменение статуса на cancelled)
   * @param {number|string} id - ID события
   * @returns {Promise<Object>}
   */
  deleteEvent: async (id) => {
    const token = localStorage.getItem("token");
    
    // Сначала получаем текущее событие
    const event = await http(`/api/events/${id}`);
    console.log("Current event before delete:", event);
    
    // Формируем FormData со всеми обязательными полями + новый статус
    const formData = new FormData();
    formData.append("name", event.name || "");
    formData.append("description", event.description || "");
    formData.append("start_date", event.start_date ? event.start_date.split("T")[0] : "");
    formData.append("end_date", event.end_date ? event.end_date.split("T")[0] : "");
    formData.append("city", event.city || "moscow");
    formData.append("event_status", "cancelled");
    
    console.log("Deleting event:", id, "with status: cancelled");
    
    const res = await fetch(`${API_URL}/api/events/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseData = await res.json().catch(() => ({}));
    console.log("Delete response:", res.status, responseData);

    if (!res.ok) {
      throw new Error(responseData.detail || responseData.message || "Ошибка удаления события");
    }

    return responseData;
  },

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

  /**
   * Получить пользователя по ID
   * @param {number|string} id - ID пользователя
   * @returns {Promise<Object>} Данные пользователя
   */
  getUserById: (id) => http(`/api/users/${id}`),

  /**
   * Обновить пользователя (PUT /api/users/{user_id})
   * @param {number|string} id - ID пользователя
   * @param {Object} data - Данные для обновления (id, name, surname, father_name, role, status)
   * @returns {Promise<Object>} Обновленный пользователь
   */
  updateUser: (id, data) =>
    http(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Удалить пользователя (мягкое удаление через изменение статуса)
   * @param {number|string} id - ID пользователя
   * @returns {Promise<void>}
   */
  deleteUser: (id) =>
    http(`/api/users/${id}`, {
      method: "DELETE",
    }),

  /**
   * Сбросить пароль пользователя
   * @param {number|string} id - ID пользователя
   * @param {string} newPassword - Новый пароль
   * @returns {Promise<Object>}
   */
  resetUserPassword: (id, newPassword) =>
    http(`/api/users/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ new_password: newPassword }),
    }),

  // ==================== ТИПЫ СОБЫТИЙ ====================

  /**
   * Получить типы событий (из OpenAPI схемы EventType enum)
   * @returns {Promise<Array>} Список типов событий
   */
  getEventTypes: () => Promise.resolve([
    { id: "День рождения", name: "День рождения" },
    { id: "Вечеринка", name: "Вечеринка" },
    { id: "Встреча", name: "Встреча" },
    { id: "Тренинг", name: "Тренинг" },
    { id: "Конференция", name: "Конференция" },
    { id: "Мастер-класс", name: "Мастер-класс" },
    { id: "Семинар", name: "Семинар" },
    { id: "Концерт", name: "Концерт" },
    { id: "Фестиваль", name: "Фестиваль" },
    { id: "Экскурсия", name: "Экскурсия" },
    { id: "Тур", name: "Тур" },
    { id: "Другое", name: "Другое" },
  ]),

  // ==================== ГОРОДА ====================

  /**
   * Получить список городов (из OpenAPI схемы EventCity enum)
   * @returns {Promise<Array>} Список городов
   */
  getCities: () => Promise.resolve([
    { id: "Москва", name: "Москва" },
    { id: "Санкт-Петербург", name: "Санкт-Петербург" },
    { id: "Новосибирск", name: "Новосибирск" },
    { id: "Екатеринбург", name: "Екатеринбург" },
    { id: "Краснодар", name: "Краснодар" },
    { id: "Самара", name: "Самара" },
    { id: "Уфа", name: "Уфа" },
    { id: "Волгоград", name: "Волгоград" },
    { id: "Казань", name: "Казань" },
    { id: "Рязань", name: "Рязань" },
    { id: "Саратов", name: "Саратов" },
    { id: "Тольятти", name: "Тольятти" },
    { id: "Ростов-на-Дону", name: "Ростов-на-Дону" },
    { id: "Минск", name: "Минск" },
    { id: "Гомель", name: "Гомель" },
    { id: "Брест", name: "Брест" },
    { id: "Витебск", name: "Витебск" },
    { id: "Гродно", name: "Гродно" },
    { id: "Могилев", name: "Могилев" },
  ]),

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
