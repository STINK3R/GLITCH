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
  detail: (id) => ["events", "detail", id],
  participants: (id) => ["events", "participants", id],
};

/**
 * Хук для получения событий пользователя
 */
export function useMyEvents() {
  const setMyEvents = useEventsStore((s) => s.setMyEvents);

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.my,
    queryFn: async () => {
      const data = await eventsApi.getMy();
      setMyEvents(data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

/**
 * Хук для получения активных событий
 */
export function useActiveEvents() {
  const setActiveEvents = useEventsStore((s) => s.setActiveEvents);

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.active,
    queryFn: async () => {
      const data = await eventsApi.getActive();
      setActiveEvents(data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Хук для получения прошедших событий
 */
export function usePastEvents() {
  const setPastEvents = useEventsStore((s) => s.setPastEvents);

  return useQuery({
    queryKey: EVENTS_QUERY_KEYS.past,
    queryFn: async () => {
      const data = await eventsApi.getPast();
      setPastEvents(data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Хук для загрузки всех событий по вкладкам
 */
export function useAllEvents() {
  const activeTab = useEventsStore((s) => s.activeTab);

  const myEventsQuery = useMyEvents();
  const activeEventsQuery = useActiveEvents();
  const pastEventsQuery = usePastEvents();

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
    isLoading:
      myEventsQuery.isLoading ||
      activeEventsQuery.isLoading ||
      pastEventsQuery.isLoading,
    isError:
      myEventsQuery.isError ||
      activeEventsQuery.isError ||
      pastEventsQuery.isError,
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
      // Обновляем локальное состояние
      updateEventParticipation(eventId, true);

      // Инвалидируем кэш для обновления данных с сервера
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
      // Обновляем локальное состояние
      updateEventParticipation(eventId, false);

      // Инвалидируем кэш для обновления данных с сервера
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

