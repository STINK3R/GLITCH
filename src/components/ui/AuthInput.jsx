import React, { useState } from "react";

/**
 * AuthInput - Поле ввода для форм авторизации
 * 
 * Состояния:
 * - Начальное: серый фон, без границы
 * - Ховер + начальное: серый фон, тонкая граница
 * - Заполненное: белый фон, граница
 * - Заполненное + ховер: белый фон, более яркая граница
 * - Ошибка: красная граница + текст ошибки справа от лейбла
 */
export const AuthInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,        // boolean или string - если string, показываем текст ошибки
  errorText,    // альтернативный текст ошибки
  name,
  className = "",
  rightElement,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const hasValue = value && value.length > 0;
  const hasError = !!error;
  const displayErrorText = typeof error === 'string' ? error : errorText;

  // Определяем реальный тип инпута (email заменяем на text для отключения валидации браузера)
  const inputType = type === "email" ? "text" : type;

  // Определяем стили в зависимости от состояния
  const getInputStyles = () => {
    const baseStyles = "w-full rounded-2xl px-4 py-3.5 text-base outline-none transition-all duration-200 placeholder:text-neutral-400";
    
    if (hasError) {
      // Состояние ошибки - красная граница
      return `${baseStyles} bg-white border border-[#EE2C34] text-neutral-900`;
    }
    
    if (hasValue) {
      // Заполненное состояние
      if (isFocused || isHovered) {
        // Заполненное + ховер/фокус - более яркая граница
        return `${baseStyles} bg-white border border-neutral-300 text-neutral-900`;
      }
      // Просто заполненное - белый фон с границей
      return `${baseStyles} bg-white border border-neutral-200 text-neutral-900`;
    }
    
    // Пустое состояние
    if (isFocused || isHovered) {
      // Ховер + начальное - серый фон с границей
      return `${baseStyles} bg-[#F5F5F5] border border-neutral-300 text-neutral-900`;
    }
    
    // Начальное - серый фон, без границы
    return `${baseStyles} bg-[#F5F5F5] border border-transparent text-neutral-900`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Лейбл и текст ошибки в одной строке */}
      {(label || displayErrorText) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="block text-sm text-neutral-500 font-normal">
              {label}
            </label>
          )}
          {hasError && displayErrorText && (
            <span className="text-sm text-[#EE2C34] font-normal">
              {displayErrorText}
            </span>
          )}
        </div>
      )}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          name={name}
          value={value}
          onChange={onChange}
          type={inputType}
          autoComplete="off"
          className={getInputStyles()}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
};
