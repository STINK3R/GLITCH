/**
 * Модальное окно подтверждения отмены участия
 * Дизайн как на скриншоте
 */

import { useEffect, useRef } from "react";

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Вы точно хотите отменить участие?",
  confirmText = "Отменить участие",
  cancelText = "Назад",
  isLoading = false,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/70 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl transform animate-scale-in p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Заголовок */}
        <h3
          id="modal-title"
          className="text-xl font-semibold text-neutral-900 text-center mb-6"
        >
          {title}
        </h3>

        {/* Кнопки */}
        <div className="flex gap-4">
          {/* Кнопка отмены участия (серая) */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-4 text-base font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
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
              confirmText
            )}
          </button>
          
          {/* Кнопка "Назад" (красная) */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-6 py-4 text-base font-medium text-white bg-[#EE2C34] rounded-xl hover:bg-[#D42930] transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
