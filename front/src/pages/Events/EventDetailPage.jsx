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
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  useEventDetail,
  useConfirmParticipation,
  useCancelParticipation,
  useSimilarEvents,
  useToggleFavorite,
} from "../../features/events/useEvents";
import { EVENT_STATUS } from "../../features/events/EventsStore";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { ReviewModal } from "../../components/ui/ReviewModal";
import { EventCard } from "../../components/events/EventCard";
import { getImageUrl } from "../../utils/imageUrl";

// Иконки из public/icons
import peopleIcon from "/icons/people.svg";
import heartIcon from "/icons/heart.svg";
import heartFilledIcon from "/icons/heart-on-events-card.svg";

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
      {/* Мобильная версия */}
      <div className="lg:hidden">
        {/* Изображение на всю ширину */}
        <div className="w-full h-[300px] bg-neutral-200" />
        
        {/* Контент */}
        <div className="px-4 py-4 space-y-3">
          {/* Бейджи */}
          <div className="flex gap-2">
            <div className="h-7 w-20 bg-neutral-200 rounded-full" />
            <div className="h-7 w-16 bg-neutral-200 rounded-full" />
            <div className="h-7 w-24 bg-neutral-200 rounded-full" />
          </div>
          {/* Заголовок */}
          <div className="h-6 bg-neutral-200 rounded w-3/4" />
          {/* Дата */}
          <div className="h-4 bg-neutral-100 rounded w-1/2" />
          {/* Описание */}
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-neutral-100 rounded w-full" />
            <div className="h-4 bg-neutral-100 rounded w-5/6" />
            <div className="h-4 bg-neutral-100 rounded w-4/6" />
          </div>
        </div>
      </div>
      
      {/* Десктопная версия */}
      <div className="hidden lg:flex gap-12">
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
  const navigate = useNavigate();

  // Состояния
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isParticipating, setIsParticipating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Скролл наверх при монтировании компонента
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Загрузка данных события
  const { data: event, isLoading, isError, refetch } = useEventDetail(id);

  // Мутации для управления участием и избранным
  const confirmMutation = useConfirmParticipation();
  const cancelMutation = useCancelParticipation();
  const toggleFavoriteMutation = useToggleFavorite();
  
  // Обработчик добавления в избранное (оптимистичное обновление)
  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Сразу меняем UI
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    // Отправляем запрос в фоне
    toggleFavoriteMutation.mutate(
      { eventId: id, isLiked: !newValue },
      {
        onError: () => {
          // Откатываем при ошибке
          setIsFavorite(!newValue);
          console.error("Ошибка изменения избранного");
        },
      }
    );
  };

  // Получаем тип события для загрузки похожих
  const eventType = event?.type || event?.event_type || event?.category;
  
  // Загрузка похожих событий по типу
  const { data: similarEvents = [], isLoading: isSimilarLoading } = useSimilarEvents(eventType, id);

  // Синхронизация состояния участия и избранного с данными события
  useEffect(() => {
    if (event) {
      setIsParticipating(
        getField(event, "is_user_in_event", "isParticipating", "is_participating", "user_participates") || false
      );
      setIsFavorite(
        getField(event, "is_user_liked_event", "is_favorite", "isFavorite", "isLiked") || false
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
  const rawImageUrl = getField(event, "image_url", "image", "photo", "cover", "preview");
  const imageUrl = getImageUrl(rawImageUrl) || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop";
  const title = getField(event, "name", "title", "event_name") || "Название события";
  const description = getField(event, "description", "about", "text") || "";
  const startDate = getField(event, "start_date", "startDate", "date_start", "start_at");
  const endDate = getField(event, "end_date", "endDate", "date_end", "end_at");
  const location = getField(event, "location", "address", "place", "venue") || "";
  // Количество участников из массива members
  const members = getField(event, "members") || [];
  const participantsCount = members.length || getField(event, "participantsCount", "participants_count", "members_count") || 0;
  // Максимальное количество участников (ограничение)
  const maxMembers = getField(event, "max_members", "maxMembers", "max_participants", "limit");
  const displayEventType = getField(event, "type", "event_type", "category") || "Экскурсия";
  const status = getField(event, "status", "state") || EVENT_STATUS.ACTIVE;
  const paymentInfo = getField(event, "pay_data", "paymentInfo", "payment_info", "price_info", "prices");
  
  // Проверяем, завершено ли событие (по статусу или по дате)
  const isEventCompleted = status === EVENT_STATUS.COMPLETED || 
    (endDate && new Date(endDate) < new Date());

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto lg:px-6 lg:py-8">
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
    <div className="min-h-screen bg-[#FAFAFA] animate-fade-in">
      {/* Уведомление об участии */}
      <ParticipationToast show={showToast} onHide={() => setShowToast(false)} />

      {/* Мобильная версия - изображение на всю ширину с кнопками поверх (скроллятся вместе со страницей) */}
      <div className="lg:hidden relative">
        {/* Изображение на всю ширину */}
        <div className="relative h-[300px] w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop";
            }}
          />
          
          {/* Кнопка назад - левый верхний угол с блюром */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-12 left-4 w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-md rounded-[16px] z-[30]"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Кнопка лайк - правый верхний угол с блюром */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-12 right-4 w-12 h-12 flex items-center justify-center bg-black/30 backdrop-blur-md rounded-[16px] z-[30]"
          >
            {isFavorite ? (
              <svg className="w-6 h-6 text-[#EE2C34]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-[47px] py-4 lg:py-8">
        {/* Основной контент: изображение + информация */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-12">
          {/* Левая колонка: изображение (только десктоп) */}
          <div className="hidden lg:block lg:w-[610px]">
            <div className="h-[376px] rounded-[40px] overflow-hidden bg-neutral-100">
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
          <div className="lg:flex-1">
            {/* Бейджи */}
            <div className="flex flex-wrap items-center gap-2 mb-3 lg:mb-4">
              {/* Статус */}
              <span className="px-2.5 lg:px-3 py-1 lg:py-1.5 text-sm lg:text-base font-medium bg-[#EE2C34] text-neutral-50 rounded-full lg:rounded-[18px]">
                Активное
              </span>

              {/* Участники */}
              <span className="flex items-center gap-1 lg:gap-1.5 px-2.5 lg:px-3 py-1 lg:py-1.5 text-sm lg:text-base font-medium bg-[#EFEFEF] text-neutral-900 rounded-full lg:rounded-[18px]">
                <img src={peopleIcon} alt="" className="w-4 h-4 lg:w-5 lg:h-5" />
                {maxMembers && maxMembers > 0 
                  ? `${participantsCount} / ${maxMembers}` 
                  : participantsCount}
              </span>
              
              {/* Тип события */}
              <span className="px-2.5 lg:px-3 py-1 lg:py-1.5 text-sm lg:text-base font-medium bg-[#EFEFEF] text-neutral-900 rounded-full lg:rounded-[18px]">
                {displayEventType}
              </span>
            </div>

            {/* Название */}
            <h1 className="text-xl lg:text-[34px] font-medium text-neutral-900 mb-2 lg:mb-3">
              {title}
            </h1>

            {/* Дата и место */}
            <p className="text-sm lg:text-base text-[#2a2a2a] mb-4 lg:mb-8">
              {formatDateRange(startDate, endDate)}
              {location && `  |  ${location}`}
            </p>

            {/* Кнопка участия - только на десктопе */}
            <div className="hidden lg:block w-full max-w-[480px]">
              {isEventCompleted ? (
                /* Событие завершено */
                isParticipating ? (
                  /* Участник может оставить отзыв */
                  <>
                    <button
                      onClick={() => setShowReviewModal(true)}
                      className="relative z-10 w-full h-[60px] px-4 text-[17px] font-medium text-white bg-[#EE2C34] rounded-[20px] hover:bg-[#D42930] transition-colors"
                    >
                      Оценить
                    </button>
                    <div className="bg-[#EFEFEF] rounded-b-[20px] px-4 pt-[42px] pb-3 -mt-[30px]">
                      <p className="text-center text-[13px] text-[#828282]">
                        Это событие уже прошло
                      </p>
                    </div>
                  </>
                ) : (
                  /* Не участник - не может оставить отзыв */
                  <>
                    <button
                      disabled
                      className="relative z-10 w-full h-[60px] px-4 text-[17px] font-medium text-white bg-[#F8ABAE] rounded-[20px] cursor-not-allowed"
                    >
                      Событие закончилось
                    </button>
                    <div className="bg-[#EFEFEF] rounded-b-[20px] px-4 pt-[42px] pb-3 -mt-[30px]">
                      <p className="text-center text-[13px] text-[#828282]">
                        Это событие уже прошло
                      </p>
                    </div>
                  </>
                )
              ) : isParticipating ? (
                <>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    disabled={isPending}
                    className="relative z-10 w-full h-[60px] px-4 text-[17px] font-medium text-neutral-700 bg-[#E3E3E3] rounded-[20px] hover:bg-[#D5D5D5] transition-colors disabled:opacity-50"
                  >
                    {cancelMutation.isPending ? "Отмена..." : "Отменить участие"}
                  </button>
                  <div className="bg-[#EFEFEF] rounded-b-[20px] px-4 pt-[42px] pb-3 -mt-[30px]">
                    <p className="text-center text-[13px] text-[#828282]">
                      Вы участвуете!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConfirmParticipation}
                    disabled={isPending}
                    className={`relative z-10 w-full h-[60px] px-4 text-[17px] font-medium text-[#f3fbff] rounded-[20px] transition-all duration-300 ${
                      isPending 
                        ? "bg-[#F8ABAE] cursor-wait" 
                        : "bg-[#EE2C34] hover:bg-[#D42930]"
                    }`}
                  >
                    {confirmMutation.isPending ? "Подтверждение..." : "Подтвердить участие"}
                  </button>
                  <div className="bg-[#EFEFEF] rounded-b-[20px] px-4 pt-[42px] pb-3 -mt-[30px]">
                    <p className="text-center text-[13px] text-[#828282]">
                      Вы не участвуете
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Секции "О событии" и "Оплата" */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mt-6 lg:mt-12">
          {/* О событии */}
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-neutral-900 mb-3 lg:mb-4">
              О событии
            </h2>
            <p className="text-sm lg:text-base text-neutral-600 leading-relaxed whitespace-pre-wrap">
              {description || "Мы рады предложить вам самую полную программу по Бункеру, в которой можно осмотреть ВЕСЬ объект (Не только музей, но и инженерно-техническую, неотреставрированную часть)."}
            </p>
          </div>

          {/* Оплата */}
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-neutral-900 mb-3 lg:mb-4">
              Оплата
            </h2>
            <div className="text-sm lg:text-base text-neutral-600 leading-relaxed whitespace-pre-wrap">
              {paymentInfo ? paymentInfo : "Бесплатно"}
            </div>
          </div>
        </div>

        {/* Похожие события */}
        {similarEvents.length > 0 && (
          <div className="mt-8 lg:mt-16">
            <h2 className="text-lg lg:text-xl font-semibold text-neutral-900 mb-4 lg:mb-6">
              Похожие события
            </h2>
            {isSimilarLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-neutral-200 rounded-2xl" />
                    <div className="mt-3 h-5 bg-neutral-200 rounded w-3/4" />
                    <div className="mt-2 h-4 bg-neutral-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
                {similarEvents.map((relatedEvent, index) => (
                  <EventCard key={relatedEvent.id || index} event={relatedEvent} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Отступ снизу для мобильной фиксированной кнопки */}
        <div className="lg:hidden h-[120px]" />
      </div>

      {/* Модальное окно подтверждения отмены */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelParticipation}
        isLoading={cancelMutation.isPending}
      />

      {/* Модальное окно отзыва */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        eventId={id}
        eventName={title}
      />

      {/* Тост уведомление */}
      {showToast && <ParticipationToast />}

      {/* Мобильная кнопка участия */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 z-40">
        {isEventCompleted ? (
          isParticipating ? (
            <button
              onClick={() => setShowReviewModal(true)}
              className="w-full h-[56px] px-4 text-[17px] font-medium text-white bg-[#EE2C34] rounded-[28px] hover:bg-[#D42930] transition-colors"
            >
              Оценить
            </button>
          ) : (
            <button
              disabled
              className="w-full h-[56px] px-4 text-[17px] font-medium text-white bg-[#F8ABAE] rounded-[28px] cursor-not-allowed"
            >
              Событие закончилось
            </button>
          )
        ) : isParticipating ? (
          <button
            onClick={() => setShowCancelModal(true)}
            disabled={isPending}
            className="w-full h-[56px] px-4 text-[17px] font-medium text-neutral-700 bg-[#E3E3E3] rounded-[28px] hover:bg-[#D5D5D5] transition-colors disabled:opacity-50"
          >
            {cancelMutation.isPending ? "Отмена..." : "Отменить участие"}
          </button>
        ) : (
          <button
            onClick={handleConfirmParticipation}
            disabled={isPending}
            className={`w-full h-[56px] px-4 text-[17px] font-medium text-white rounded-[28px] transition-all duration-300 ${
              isPending 
                ? "bg-[#F8ABAE] cursor-wait" 
                : "bg-[#EE2C34] hover:bg-[#D42930]"
            }`}
          >
            {confirmMutation.isPending ? "Подтверждение..." : "Подтвердить участие"}
          </button>
        )}
      </div>
    </div>
  );
}

export default EventDetailPage;
