/**
 * Zustand store для управления состоянием событий
 */

import { create } from "zustand";

// Типы вкладок для фильтрации событий
export const EVENT_TABS = {
  MY: "my",
  ACTIVE: "active",
  PAST: "past",
};

// Статусы событий (согласно API: "coming soon", "active", "completed", "cancelled")
export const EVENT_STATUS = {
  COMING_SOON: "coming soon",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  // Для обратной совместимости
  PAST: "completed",
  REJECTED: "cancelled",
};

export const useEventsStore = create((set, get) => ({
  // Текущая активная вкладка (по умолчанию "Активные")
  activeTab: EVENT_TABS.ACTIVE,

  // Списки событий по категориям
  myEvents: [],
  activeEvents: [],
  pastEvents: [],

  // Состояние загрузки
  isLoading: false,
  error: null,

  // Детальная информация о выбранном событии
  selectedEvent: null,

  /**
   * Установить активную вкладку
   * @param {string} tab - Идентификатор вкладки
   */
  setActiveTab: (tab) => set({ activeTab: tab }),

  /**
   * Установить события пользователя
   * @param {Array} events - Список событий
   */
  setMyEvents: (events) => set({ myEvents: events }),

  /**
   * Установить активные события
   * @param {Array} events - Список событий
   */
  setActiveEvents: (events) => set({ activeEvents: events }),

  /**
   * Установить прошедшие события
   * @param {Array} events - Список событий
   */
  setPastEvents: (events) => set({ pastEvents: events }),

  /**
   * Установить выбранное событие
   * @param {Object|null} event - Данные события
   */
  setSelectedEvent: (event) => set({ selectedEvent: event }),

  /**
   * Установить состояние загрузки
   * @param {boolean} loading - Флаг загрузки
   */
  setLoading: (loading) => set({ isLoading: loading }),

  /**
   * Установить ошибку
   * @param {string|null} error - Текст ошибки
   */
  setError: (error) => set({ error }),

  /**
   * Получить события для текущей вкладки
   * @returns {Array} Отфильтрованный список событий
   */
  getCurrentEvents: () => {
    const state = get();
    switch (state.activeTab) {
      case EVENT_TABS.MY:
        return state.myEvents;
      case EVENT_TABS.ACTIVE:
        return state.activeEvents;
      case EVENT_TABS.PAST:
        return state.pastEvents;
      default:
        return state.myEvents;
    }
  },

  /**
   * Обновить статус участия в событии локально
   * @param {number|string} eventId - ID события
   * @param {boolean} isParticipating - Участвует ли пользователь
   */
  updateEventParticipation: (eventId, isParticipating) => {
    set((state) => {
      // Обновляем во всех списках
      const updateList = (events) =>
        events.map((event) =>
          String(event.id) === String(eventId)
            ? {
                ...event,
                is_user_in_event: isParticipating,
                isParticipating,
              }
            : event
        );

      return {
        myEvents: isParticipating
          ? [...state.myEvents, state.activeEvents.find((e) => String(e.id) === String(eventId))].filter(Boolean)
          : state.myEvents.filter((e) => String(e.id) !== String(eventId)),
        activeEvents: updateList(state.activeEvents),
        pastEvents: updateList(state.pastEvents),
        selectedEvent:
          String(state.selectedEvent?.id) === String(eventId)
            ? {
                ...state.selectedEvent,
                is_user_in_event: isParticipating,
                isParticipating,
              }
            : state.selectedEvent,
      };
    });
  },

  /**
   * Очистить store
   */
  reset: () =>
    set({
      activeTab: EVENT_TABS.MY,
      myEvents: [],
      activeEvents: [],
      pastEvents: [],
      isLoading: false,
      error: null,
      selectedEvent: null,
    }),
}));

