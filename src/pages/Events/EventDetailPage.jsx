/**
 * Страница детального просмотра события
 * Дизайн как на скриншотах:
 * - Двухколоночный макет (фото слева, инфо справа)
 * - Бейджи статуса, участников, типа
 * - Кнопка участия с уведомлением
 * - Секции "О событии" и "Оплата"
 * - Похожие события
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useEventDetail,
  useConfirmParticipation,
  useCancelParticipation,
  useSimilarEvents,
} from "../../features/events/useEvents";
import { EVENT_STATUS } from "../../features/events/EventsStore";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { EventCard } from "../../components/events/EventCard";

// Иконка участников (4 квадратика)
const ParticipantsIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="6" rx="1.5" />
    <rect x="9" y="1" width="6" height="6" rx="1.5" />
    <rect x="1" y="9" width="6" height="6" rx="1.5" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
  </svg>
);

// Иконка галочки для уведомления
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

/**
 * Получить значение поля с поддержкой разных названий
 */
function getField(obj, ...keys) {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }
  return null;
}

/**
 * Форматирование диапазона дат
 */
function formatDateRange(startDate, endDate) {
  if (!startDate) return "";
  
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;
  
  if (isNaN(start.getTime())) return "";
  
  const startDay = start.getDate();
  const startMonth = months[start.getMonth()];
  
  if (!end || isNaN(end.getTime()) || start.toDateString() === end.toDateString()) {
    return `${startDay} ${startMonth}`;
  }
  
  const endDay = end.getDate();
  const endMonth = months[end.getMonth()];
  
  if (start.getMonth() === end.getMonth()) {
    return `${startDay} — ${endDay} ${startMonth}`;
  }
  
  return `${startDay} ${startMonth} — ${endDay} ${endMonth}`;
}

/**
 * Компонент скелетона для загрузки
 */
function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-12">
        <div className="w-1/2 aspect-[4/3] bg-neutral-200 rounded-2xl" />
        <div className="w-1/2 space-y-4">
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-neutral-200 rounded-lg" />
            <div className="h-8 w-16 bg-neutral-200 rounded-lg" />
          </div>
          <div className="h-10 bg-neutral-200 rounded w-3/4" />
          <div className="h-5 bg-neutral-100 rounded w-1/2" />
          <div className="h-14 bg-neutral-200 rounded-xl w-full mt-8" />
        </div>
      </div>
    </div>
  );
}

/**
 * Компонент уведомления об участии
 */
function ParticipationToast({ show, onHide }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
      <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-lg border border-neutral-100">
        <span className="text-[#EE2C34]">
          <CheckIcon />
        </span>
        <span className="text-sm font-medium text-neutral-900">
          Вы участвуете в событии!
        </span>
      </div>
    </div>
  );
}

export function EventDetailPage() {
  const { id } = useParams();

  // Состояния
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);

  // Загрузка данных события
  const { data: event, isLoading, isError, refetch } = useEventDetail(id);

  // Мутации для управления участием
  const confirmMutation = useConfirmParticipation();
  const cancelMutation = useCancelParticipation();

  // Получаем тип события для загрузки похожих
  const eventType = event?.type || event?.event_type || event?.category;
  
  // Загрузка похожих событий по типу
  const { data: similarEvents = [], isLoading: isSimilarLoading } = useSimilarEvents(eventType, id);

  // Синхронизация состояния участия с данными события
  useEffect(() => {
    if (event) {
      setIsParticipating(
        getField(event, "is_user_in_event", "isParticipating", "is_participating", "user_participates") || false
      );
    }
  }, [event]);

  // Обработчик подтверждения участия
  const handleConfirmParticipation = async () => {
    try {
      await confirmMutation.mutateAsync(id);
      setIsParticipating(true);
      setShowToast(true);
    } catch (error) {
      console.error("Ошибка подтверждения участия:", error);
    }
  };

  // Обработчик отмены участия
  const handleCancelParticipation = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      setIsParticipating(false);
      setShowCancelModal(false);
    } catch (error) {
      console.error("Ошибка отмены участия:", error);
    }
  };

  // Получаем данные события
  const imageUrl = getField(event, "image_url", "image", "photo", "cover", "preview") 
    || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop";
  const title = getField(event, "name", "title", "event_name") || "Название события";
  const description = getField(event, "description", "about", "text") || "";
  const startDate = getField(event, "start_date", "startDate", "date_start", "start_at");
  const endDate = getField(event, "end_date", "endDate", "date_end", "end_at");
  const location = getField(event, "location", "address", "place", "venue") || "";
  // Количество участников из массива members
  const members = getField(event, "members") || [];
  const participantsCount = members.length || getField(event, "participantsCount", "participants_count", "members_count") || 0;
  const displayEventType = getField(event, "type", "event_type", "category") || "Экскурсия";
  const status = getField(event, "status", "state") || EVENT_STATUS.ACTIVE;
  const paymentInfo = getField(event, "pay_data", "paymentInfo", "payment_info", "price_info", "prices");

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-8">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (isError || !event) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1400px] mx-auto px-6 py-16">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Событие не найдено
            </h2>
            <p className="mt-2 text-neutral-500">
              Возможно, оно было удалено или у вас нет доступа
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 text-sm font-medium text-[#EE2C34] bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                Попробовать снова
              </button>
              <Link
                to="/events"
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                К списку событий
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPending = confirmMutation.isPending || cancelMutation.isPending;

  return (
    <div className="min-h-screen bg-white">
      {/* Уведомление об участии */}
      <ParticipationToast show={showToast} onHide={() => setShowToast(false)} />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Основной контент: изображение + информация */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Левая колонка: изображение */}
          <div className="lg:w-1/2">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100">
              <img
                src={imageUrl}
                alt={title}
              className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop";
                }}
              />
          </div>
        </div>

          {/* Правая колонка: информация */}
          <div className="lg:w-1/2">
            {/* Бейджи */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {/* Статус */}
              <span className="px-3 py-1.5 text-xs font-medium bg-[#EE2C34] text-white rounded-lg">
                Активное
              </span>

            {/* Участники */}
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-lg">
                <ParticipantsIcon />
                {participantsCount}
              </span>
              
              {/* Тип события */}
              <span className="px-3 py-1.5 text-xs font-medium bg-neutral-100 text-neutral-700 rounded-lg">
                {displayEventType}
              </span>
            </div>

            {/* Название */}
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-3">
              {title}
            </h1>

            {/* Дата и место */}
            <p className="text-neutral-500 mb-8">
              {formatDateRange(startDate, endDate)}
              {location && ` | ${location}`}
            </p>

            {/* Кнопка участия */}
            <div className="space-y-2">
              {isParticipating ? (
                <>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={isPending}
                    className="w-full px-6 py-4 text-base font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? "Отмена..." : "Отменить участие"}
                  </button>
                  <p className="text-center text-sm text-neutral-500">
                    Вы участвуете!
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConfirmParticipation}
                    disabled={isPending}
                    className="w-full px-6 py-4 text-base font-medium text-white bg-[#EE2C34] rounded-xl hover:bg-[#D42930] transition-colors disabled:opacity-50"
                  >
                    {confirmMutation.isPending ? "Подтверждение..." : "Подтвердить участие"}
                  </button>
                  <p className="text-center text-sm text-neutral-400">
                    Вы не участвуете
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Секции "О событии" и "Оплата" */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-12">
          {/* О событии */}
          <div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              О событии
          </h2>
            <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
              {description || "Мы рады предложить вам самую полную программу по Бункеру, в которой можно осмотреть ВЕСЬ объект (Не только музей, но и инженерно-техническую, неотреставрированную часть)."}
            </p>
        </div>

          {/* Оплата */}
              <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">
              Оплата
            </h2>
            <div className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
              {paymentInfo || (
                <>
                  <p>Входной билет — 1 000 ₽</p>
                  <p>Одиночное кресло — 3 000 ₽</p>
                  <p>Диван 3-х местный — 9 000 ₽</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Похожие события */}
        {similarEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">
              Похожие события
            </h2>
            {isSimilarLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-neutral-200 rounded-2xl" />
                    <div className="mt-3 h-5 bg-neutral-200 rounded w-3/4" />
                    <div className="mt-2 h-4 bg-neutral-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {similarEvents.map((relatedEvent, index) => (
                  <EventCard key={relatedEvent.id || index} event={relatedEvent} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

        {/* Модальное окно подтверждения отмены */}
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelParticipation}
        title="Вы точно хотите отменить участие?"
        confirmText="Отменить участие"
        cancelText="Назад"
          isLoading={cancelMutation.isPending}
        />
    </div>
  );
}

export default EventDetailPage;
