/**
 * Хук для работы с событиями
 * Объединяет API вызовы и управление store
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "./api";
import { useEventsStore, EVENT_TABS } from "./EventsStore";

// Ключи для React Query
export const EVENTS_QUERY_KEYS = {
  all: ["events"],
  active: ["events", "active"],
  my: ["events", "my"],
  past: ["events", "past"],
  favorites: ["events", "favorites"],
  detail: (id) => ["events", "detail", id],
  similar: (type, excludeId) => ["events", "similar", type, excludeId],
  participants: (id) => ["events", "participants", id],
};

/**
 * Нормализовать ответ API (может быть массив или объект с items)
 */
function normalizeResponse(data) {
  if (Array.isArray(data)) return data;
  if (data?.items) return data.items;
  if (data?.events) return data.events;
  if (data?.data) return data.data;
  return [];
}

/**
 * Безопасное выполнение запроса с обработкой ошибок
 */
async function safeFetch(fetchFn) {
  try {
    const data = await fetchFn();
    return normalizeResponse(data);
  } catch (error) {
    const status = error?.response?.status || error?.status;
    // Если 404 или 400 (нет результатов по фильтру), возвращаем пустой список
    if (status === 404 || status === 400 || status === 422) {
      return [];
    }
    // Если ошибка сети или сервера недоступен, возвращаем пустой список
    if (error?.code === 'ERR_NETWORK' || error?.code === 'ECONNREFUSED') {
      console.warn('Network error, returning empty list:', error.message);
      return [];
    }
    throw error;
  }
}

/**
 * Хук для получения событий пользователя
 */
export function useMyEvents(filters = {}) {
  const setMyEvents = useEventsStore((s) => s.setMyEvents);

  return useQuery({
    queryKey: [...EVENTS_QUERY_KEYS.my, filters],
    queryFn: async () => {
      const events = await safeFetch(() => eventsApi.getMy(filters));
      setMyEvents(events);
      return events;
    },
    staleTime: 1000 * 60 * 5,
    retry: false, // Не повторять запросы при ошибках (особенно 404)
  });
}

/**
 * Хук для получения активных событий с фильтрацией
 */
export function useActiveEvents(filters = {}) {
  const setActiveEvents = useEventsStore((s) => s.setActiveEvents);

  return useQuery({
    queryKey: [...EVENTS_QUERY_KEYS.active, filters],
    queryFn: async () => {
      const events = await safeFetch(() => eventsApi.getActive(filters));
      setActiveEvents(events);
      return events;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

/**
 * Хук для получения прошедших событий
 */
export function usePastEvents(filters = {}) {
  const setPastEvents = useEventsStore((s) => s.setPastEvents);

  return useQuery({
    queryKey: [...EVENTS_QUERY_KEYS.past, filters],
    queryFn: async () => {
      const events = await safeFetch(() => eventsApi.getPast(filters));
      setPastEvents(events);
      return events;
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

/**
 * Хук для загрузки всех событий по вкладкам
 * @param {Object} filters - Параметры фильтрации (применяются ко всем вкладкам)
 */
export function useAllEvents(filters = {}) {
  const activeTab = useEventsStore((s) => s.activeTab);

  const myEventsQuery = useMyEvents(filters);
  const activeEventsQuery = useActiveEvents(filters);
  const pastEventsQuery = usePastEvents(filters);

  // Определяем текущий запрос на основе активной вкладки
  const currentQuery = {
    [EVENT_TABS.MY]: myEventsQuery,
    [EVENT_TABS.ACTIVE]: activeEventsQuery,
    [EVENT_TABS.PAST]: pastEventsQuery,
  }[activeTab];

  return {
    myEventsQuery,
    activeEventsQuery,
    pastEventsQuery,
    currentQuery,
    isLoading: currentQuery?.isLoading || false,
    isError: currentQuery?.isError || false,
  };
}

/**
 * Хук для получения детальной информации о событии
 * @param {number|string} eventId - ID события
 */
export function useEventDetail(eventId) {
  const setSelectedEvent = useEventsStore((s) => s.setSelectedEvent);

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.detail(eventId),
    queryFn: async () => {
      const data = await eventsApi.getById(eventId);
      setSelectedEvent(data);
      return data;
    },
    enabled: !!eventId,
  });
}

/**
 * Хук для подтверждения участия в событии
 */
export function useConfirmParticipation() {
  const queryClient = useQueryClient();
  const updateEventParticipation = useEventsStore(
    (s) => s.updateEventParticipation
  );

  return useMutation({
    mutationFn: (eventId) => eventsApi.confirmParticipation(eventId),
    onSuccess: (_, eventId) => {
      updateEventParticipation(eventId, true);
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEYS.all });
    },
  });
}

/**
 * Хук для отмены участия в событии
 */
export function useCancelParticipation() {
  const queryClient = useQueryClient();
  const updateEventParticipation = useEventsStore(
    (s) => s.updateEventParticipation
  );

  return useMutation({
    mutationFn: (eventId) => eventsApi.cancelParticipation(eventId),
    onSuccess: (_, eventId) => {
      updateEventParticipation(eventId, false);
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEYS.all });
    },
  });
}

/**
 * Хук для получения списка участников события
 * @param {number|string} eventId - ID события
 */
export function useEventParticipants(eventId) {
  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.participants(eventId),
    queryFn: () => eventsApi.getParticipants(eventId),
    enabled: !!eventId,
  });
}

/**
 * Хук для получения похожих событий по типу
 * @param {string} type - Тип события
 * @param {number|string} excludeId - ID события для исключения
 */
export function useSimilarEvents(type, excludeId) {
  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.similar(type, excludeId),
    queryFn: () => eventsApi.getSimilar(type, excludeId),
    enabled: !!type && !!excludeId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Хук для добавления/удаления события из избранного (лайк/анлайк)
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, isLiked }) => {
      if (isLiked) {
        return eventsApi.unlikeEvent(eventId);
      } else {
        return eventsApi.likeEvent(eventId);
      }
    },
    onSuccess: (data, variables) => {
      // Инвалидируем кэш событий
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEYS.all });
      // Инвалидируем детали события
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEYS.detail(variables.eventId) });
      // Инвалидируем список избранного
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEYS.favorites });
    },
  });
}

/**
 * Хук для получения избранных событий
 */
export function useFavoriteEvents() {
  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.favorites,
    queryFn: () => safeFetch(() => eventsApi.getFavorites()),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
