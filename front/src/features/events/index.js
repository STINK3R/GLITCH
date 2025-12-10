/**
 * Экспорт модуля событий
 */

// API
export { eventsApi } from "./api";

// Store
export {
  useEventsStore,
  EVENT_TABS,
  EVENT_STATUS,
} from "./EventsStore";

// Хуки
export {
  useMyEvents,
  useActiveEvents,
  usePastEvents,
  useAllEvents,
  useEventDetail,
  useConfirmParticipation,
  useCancelParticipation,
  useEventParticipants,
  EVENTS_QUERY_KEYS,
} from "./useEvents";

