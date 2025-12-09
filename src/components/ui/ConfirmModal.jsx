/**
 * Модальное окно подтверждения действия
 * Используется для подтверждения отмены участия в событии
 */

import { useEffect, useRef } from "react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Подтверждение",
  message = "Вы уверены?",
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  isLoading = false,
  variant = "danger", // danger | warning | info
}) {
  const modalRef = useRef(null);

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

  // Блокировка скролла при открытом модальном окне
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

  if (!isOpen) return null;

  // Стили кнопки подтверждения в зависимости от варианта
  const confirmButtonStyles = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-400",
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl transform animate-scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Заголовок */}
        <div className="px-6 pt-6 pb-4">
          <h3
            id="modal-title"
            className="text-xl font-semibold text-neutral-900"
          >
            {title}
          </h3>
        </div>

        {/* Содержимое */}
        <div className="px-6 pb-6">
          <p className="text-neutral-600 leading-relaxed">{message}</p>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-300 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${confirmButtonStyles[variant]}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
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
                Загрузка...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

