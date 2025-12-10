import React from "react";

/**
 * AuthButton - Кнопка авторизации с состояниями
 * 
 * Состояния:
 * - Обычное: стандартный красный
 * - Неактивное (disabled): светлее, без hover
 * - Активное (loading): с спиннером
 * - Ховер: немного темнее
 */
export const AuthButton = ({ 
  children, 
  onClick, 
  disabled, 
  loading = false,
  type = "button", 
  className = "" 
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full rounded-2xl font-medium py-4 text-base
        transition-all duration-200 ease-out
        flex items-center justify-center gap-2
        ${isDisabled 
          ? 'bg-[#F5A5A8] text-white cursor-not-allowed' 
          : 'bg-[#EE2C34] text-white hover:bg-[#D42930] active:scale-[0.98]'
        }
        ${className}
      `}
    >
      {loading && (
        <svg 
          className="animate-spin h-5 w-5 text-white" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
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
      )}
      {children}
    </button>
  );
};
