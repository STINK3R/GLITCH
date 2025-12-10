/**
 * Модальное окно для добавления отзыва к событию
 * Дизайн: звездный рейтинг + текстовое поле + кнопка "Оценить"
 */

import { useState, useEffect, useRef } from "react";
import { useAddComment } from "../../features/events/useEvents";

// Иконка звезды (заполненная)
const StarFilledIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="#EE2C34" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

// Иконка звезды (пустая)
const StarEmptyIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#D4D4D4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * Компонент звездного рейтинга
 */
function StarRating({ rating, onRatingChange, label }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110 active:scale-95"
          >
            {star <= (hoverRating || rating) ? <StarFilledIcon /> : <StarEmptyIcon />}
          </button>
        ))}
      </div>
      {label && (
        <p className="text-sm text-neutral-500">
          {label}
        </p>
      )}
    </div>
  );
}

/**
 * Основной компонент модального окна отзыва
 */
export function ReviewModal({ isOpen, onClose, eventId, eventName }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const modalRef = useRef(null);
  
  const addCommentMutation = useAddComment();

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Закрытие по клику вне модалки
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  // Блокировка скролла
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Сброс формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setComment("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Пожалуйста, выберите оценку");
      return;
    }

    addCommentMutation.mutate(
      { eventId, comment: comment.trim() || "Неплохо", rating },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (error) => {
          console.error("Ошибка при добавлении отзыва:", error);
          alert("Не удалось добавить отзыв. Попробуйте позже.");
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-[420px] bg-white rounded-[20px] shadow-2xl transform animate-scale-in p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        {/* Заголовок */}
        <h3
          id="review-modal-title"
          className="text-xl font-semibold text-neutral-900 text-center mb-2"
        >
          Оценить событие
        </h3>
        {eventName && (
          <p className="text-sm text-neutral-500 text-center mb-6">
            {eventName}
          </p>
        )}

        {/* Звездный рейтинг */}
        <div className="mb-6">
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            label={rating > 0 ? getRatingLabel(rating) : "Выберите оценку"}
          />
        </div>

        {/* Текстовое поле для комментария */}
        <div className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Напишите отзыв (необязательно)"
            className="w-full h-24 px-4 py-3 bg-[#F5F5F5] rounded-[16px] text-base text-neutral-900 placeholder-neutral-400 outline-none resize-none focus:ring-2 focus:ring-[#EE2C34] transition-all"
            maxLength={500}
          />
          <p className="text-xs text-neutral-400 text-right mt-1">
            {comment.length}/500
          </p>
        </div>

        {/* Кнопка отправки */}
        <button
          onClick={handleSubmit}
          disabled={addCommentMutation.isPending || rating === 0}
          className="w-full h-[48px] px-4 text-base font-medium text-white bg-[#EE2C34] rounded-[20px] hover:bg-[#D42930] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addCommentMutation.isPending ? (
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
              Отправка...
            </span>
          ) : (
            "Оценить"
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Получить текстовую метку для рейтинга
 */
function getRatingLabel(rating) {
  const labels = {
    1: "Неплохо",
    2: "Неплохо",
    3: "Неплохо",
    4: "Неплохо",
    5: "Неплохо",
  };
  return labels[rating] || "Неплохо";
}

export default ReviewModal;
