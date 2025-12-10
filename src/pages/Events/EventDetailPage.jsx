/**
 * Страница детального просмотра события
 * Показывает полную информацию о событии и позволяет управлять участием
 */

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useEventDetail,
  useConfirmParticipation,
  useCancelParticipation,
} from "../../features/events/useEvents";
import { EVENT_STATUS } from "../../features/events/EventsStore";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { getImageUrl } from "../../utils/imageUrl";

// Конфигурация статусов
const STATUS_CONFIG = {
  [EVENT_STATUS.ACTIVE]: {
    label: "Активное",
    className: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  [EVENT_STATUS.PAST]: {
    label: "Прошедшее",
    className: "bg-neutral-100 text-neutral-600",
    dot: "bg-neutral-400",
  },
  [EVENT_STATUS.REJECTED]: {
    label: "Отклонено",
    className: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

/**
 * Форматирование даты для отображения
 */
function formatDateTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Компонент скелетона для загрузки
 */
function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Изображение */}
      <div className="aspect-[21/9] bg-neutral-200 rounded-2xl" />

      <div className="mt-8 space-y-4">
        <div className="h-10 bg-neutral-200 rounded w-2/3" />
        <div className="h-4 bg-neutral-100 rounded w-1/3" />

        <div className="space-y-2 pt-4">
          <div className="h-4 bg-neutral-100 rounded" />
          <div className="h-4 bg-neutral-100 rounded" />
          <div className="h-4 bg-neutral-100 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Состояние модального окна
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Загрузка данных события
  const { data: event, isLoading, isError, refetch } = useEventDetail(id);

  // Мутации для управления участием
  const confirmMutation = useConfirmParticipation();
  const cancelMutation = useCancelParticipation();

  // Обработчик подтверждения участия
  const handleConfirmParticipation = async () => {
    try {
      await confirmMutation.mutateAsync(id);
    } catch (error) {
      console.error("Ошибка подтверждения участия:", error);
    }
  };

  // Обработчик отмены участия
  const handleCancelParticipation = async () => {
    try {
      await cancelMutation.mutateAsync(id);
      setShowCancelModal(false);
    } catch (error) {
      console.error("Ошибка отмены участия:", error);
    }
  };

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (isError || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
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
                className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
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

  const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG[EVENT_STATUS.ACTIVE];
  const isActive = event.status === EVENT_STATUS.ACTIVE;
  const isPending = confirmMutation.isPending || cancelMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Навигация назад */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Назад к событиям
        </button>

        {/* Главное изображение */}
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-neutral-100 mb-8">
          {event.image_url ? (
            <img
              src={getImageUrl(event.image_url)}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100">
              <svg
                className="w-24 h-24 text-violet-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Бейдж статуса */}
          <div className="absolute top-4 right-4">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full shadow-lg ${statusConfig.className}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Заголовок и мета-информация */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">{event.name}</h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-neutral-600">
            {/* Даты */}
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <div>Начало: {formatDateTime(event.start_date)}</div>
                <div>Окончание: {formatDateTime(event.end_date)}</div>
              </div>
            </div>

            {/* Участники */}
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>
                {event.members?.length || 0} участник(ов)
                {event.max_members && ` из ${event.max_members}`}
              </span>
            </div>

            {/* Индикатор участия */}
            {event.is_user_in_event && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium bg-violet-100 text-violet-700 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Вы участвуете
              </span>
            )}
          </div>
        </div>

        {/* Описание */}
        <div className="prose prose-neutral max-w-none mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Описание
          </h2>
          <div className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
            {event.description}
          </div>
        </div>

        {/* Данные по оплате */}
        {event.pay_data && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-amber-900">
                  Информация об оплате
                </h3>
                <p className="mt-2 text-amber-800 whitespace-pre-wrap">
                  {event.pay_data}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        {isActive && (
          <div className="flex gap-4">
            {event.is_user_in_event ? (
              <button
                onClick={() => setShowCancelModal(true)}
                disabled={isPending}
                className="flex-1 sm:flex-none px-6 py-3 text-base font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {cancelMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Отмена...
                  </span>
                ) : (
                  "Отменить участие"
                )}
              </button>
            ) : (
              <button
                onClick={handleConfirmParticipation}
                disabled={isPending || (event.max_members && (event.members?.length || 0) >= event.max_members)}
                className="flex-1 sm:flex-none px-6 py-3 text-base font-medium text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirmMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Подтверждение...
                  </span>
                ) : event.max_members && (event.members?.length || 0) >= event.max_members ? (
                  "Мест нет"
                ) : (
                  "Подтвердить участие"
                )}
              </button>
            )}
          </div>
        )}

        {/* Модальное окно подтверждения отмены */}
        <ConfirmModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelParticipation}
          title="Отменить участие?"
          message="Вы уверены, что хотите отменить своё участие в этом событии? Вы сможете снова подтвердить участие позже."
          confirmText="Да, отменить"
          cancelText="Нет, остаться"
          isLoading={cancelMutation.isPending}
          variant="danger"
        />
      </div>
    </div>
  );
}

