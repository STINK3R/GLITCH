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
    // Базовые стили: радиус 20px, высота 48px (через h-12 и flex/centering), отступы
    // Используем py-3 для высоты контента ~24px + 24px padding = 48px. 
    // Или проще задать h-12 и flex items-center, но для input это сложнее.
    // text-base line-height is 24px. 48-24=24. py-3 is 12px top+bottom. Perfect.
    let styles = "w-full rounded-[20px] px-6 py-3 text-base outline-none transition-all duration-200 placeholder:text-neutral-400 border";
    
    if (hasError) {
      // Ошибка: светло-красный фон, красная рамка, жирный текст
      return `${styles} bg-[#FDF2F2] border-[#EE2C34] text-neutral-900 font-semibold`;
    }

    // Во всех остальных случаях фон серый
    styles += " bg-[#F5F5F5]";

    // Рамка при ховере или фокусе
    if (isFocused || isHovered) {
      styles += " border-neutral-900";
    } else {
      styles += " border-transparent";
    }

    // Жирность текста
    if (hasValue) {
      styles += " text-neutral-900 font-semibold";
    } else {
      styles += " text-neutral-900";
    }
    
    return styles;
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
