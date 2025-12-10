/**
 * Компонент фильтрации событий (боковая панель)
 * Содержит фильтры: место, тип, даты, ограничения, цена
 */

import React, { useState } from "react";

// Иконка стрелки вниз для селекта
const ChevronDownIcon = () => (
  <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

// Иконка крестика для очистки даты
const CloseIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/**
 * Кастомный чекбокс (используем div вместо button чтобы избежать вложенных кнопок)
 */
function CustomCheckbox({ checked }) {
  return (
    <div
      className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-all shrink-0 ${
        checked 
          ? "border-[#EE2C34] bg-[#EE2C34]/10" 
          : "border-[#ADADAD] bg-white"
      }`}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path 
            d="M2.5 6L5 8.5L9.5 3.5" 
            stroke="#EE2C34" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

/**
 * Красивый кастомный выпадающий список с чекбоксами
 */
function FilterSelect({ label, value, options, onChange, placeholder, multiSelect = false }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);
  
  // Для мультиселекта value - массив, для обычного - строка
  const selectedValues = multiSelect 
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : [];
  
  // Закрытие при клике вне компонента
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Склонение слова в зависимости от числа
  const pluralize = (count, one, few, many) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    
    if (mod100 >= 11 && mod100 <= 19) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  };
  
  // Текст для отображения
  const getDisplayText = () => {
    if (multiSelect) {
      if (selectedValues.length === 0) return placeholder;
      // Если выбран один - показываем его название
      if (selectedValues.length === 1) {
        const selectedOption = options.find(opt => opt.value === selectedValues[0]);
        return selectedOption ? selectedOption.label : placeholder;
      }
      // Если несколько - показываем количество с правильным склонением
      const count = selectedValues.length;
      // Определяем тип по placeholder
      if (placeholder.toLowerCase().includes("город") || placeholder.toLowerCase().includes("мест")) {
        return `${count} ${pluralize(count, "место", "места", "мест")}`;
      }
      return `${count} ${pluralize(count, "тип", "типа", "типов")}`;
    }
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };
  
  const handleSelect = (optValue) => {
    if (multiSelect) {
      // Мультиселект - добавляем/убираем из массива
      const newValues = selectedValues.includes(optValue)
        ? selectedValues.filter(v => v !== optValue)
        : [...selectedValues, optValue];
      onChange(newValues.length > 0 ? newValues : "");
    } else {
      // Обычный селект
      onChange(optValue);
      setIsOpen(false);
    }
  };
  
  const isSelected = (optValue) => {
    if (multiSelect) {
      return selectedValues.includes(optValue);
    }
    return value === optValue;
  };
  
  return (
    <div className="flex flex-col gap-[8px]" ref={containerRef}>
      <label className="text-sm text-[#828282]">{label}</label>
      <div className="relative">
        {/* Кнопка открытия */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between rounded-[20px] px-4 py-3 text-base text-left transition-all cursor-pointer ${
            isOpen ? "bg-[#EFEFEF] border border-[#ADADAD] rounded-b-none border-b-0" : "bg-[#EFEFEF] border border-transparent"
          } ${(multiSelect ? selectedValues.length > 0 : value) ? "text-[#282828]" : "text-[#828282]"}`}
        >
          <span className="truncate">{getDisplayText()}</span>
          <svg 
            className={`w-5 h-5 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Выпадающий список */}
        {isOpen && (
          <div className="absolute z-50 w-full bg-white rounded-b-[20px] shadow-lg border border-t-0 border-[#ADADAD] max-h-[300px] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Остальные опции */}
            {options.map((opt, index) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-4 py-3 text-base text-left transition-colors hover:bg-[#EFEFEF] flex items-center gap-3 ${
                  index === options.length - 1 ? "rounded-b-[20px]" : ""
                }`}
              >
                <CustomCheckbox checked={isSelected(opt.value)} />
                <span className="text-[#282828]">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Кастомное поле для даты
 */
/**
 * Преобразовать дату из DD.MM.YYYY в YYYY-MM-DD для внутреннего состояния
 */
function parseDateInput(dateString) {
  if (!dateString) return "";
  // Проверяем формат DD.MM.YYYY
  const match = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }
  return "";
}

/**
 * Преобразовать дату из YYYY-MM-DD в DD.MM.YYYY для отображения
 */
function formatDateDisplay(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  if (year && month && day) {
    return `${day}.${month}.${year}`;
  }
  return "";
}

function DateInput({ label, value, onChange, onClear, placeholder, minDate, maxDate }) {
  // value приходит в формате YYYY-MM-DD
  const inputRef = React.useRef(null);
  
  // Локальное состояние для хранения только цифр
  const [digits, setDigits] = React.useState(() => {
    if (value) {
      const [year, month, day] = value.split("-");
      return `${day}${month}${year}`;
    }
    return "";
  });
  
  const [error, setError] = React.useState("");
  
  // Синхронизация при изменении value извне
  React.useEffect(() => {
    if (value) {
      const [year, month, day] = value.split("-");
      setDigits(`${day}${month}${year}`);
    } else {
      setDigits("");
    }
  }, [value]);
  
  // Валидация даты
  const validateDate = (day, month, year) => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    
    if (d < 1 || d > 31) return "День должен быть от 1 до 31";
    if (m < 1 || m > 12) return "Месяц должен быть от 1 до 12";
    if (y < 2000 || y > 2099) return "Год должен быть от 2000 до 2099";
    
    // Проверка дней в месяце
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d > daysInMonth) return `В этом месяце только ${daysInMonth} дней`;
    
    // Проверка minDate
    if (minDate) {
      const inputDate = new Date(y, m - 1, d);
      const min = new Date(minDate);
      if (inputDate < min) return "Дата не может быть раньше даты начала";
    }
    
    return "";
  };
  
  // Формирует отображаемое значение с маской __.__.____ 
  const getDisplayWithMask = (digitStr) => {
    if (!digitStr) return "";
    const mask = "__.__.____";
    let result = "";
    let digitIndex = 0;
    
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === "_") {
        if (digitIndex < digitStr.length) {
          result += digitStr[digitIndex];
          digitIndex++;
        } else {
          result += "_";
        }
      } else {
        result += mask[i];
      }
    }
    return result;
  };
  
  // Вычисляем позицию курсора на основе количества цифр
  const getCursorPosition = (digitCount) => {
    if (digitCount === 0) return 0;
    if (digitCount === 1) return 1;
    if (digitCount === 2) return 2;
    if (digitCount === 3) return 4;
    if (digitCount === 4) return 5;
    if (digitCount === 5) return 7;
    if (digitCount === 6) return 8;
    if (digitCount === 7) return 9;
    if (digitCount >= 8) return 10;
    return digitCount;
  };
  
  // Автокоррекция значений при вводе
  const autoCorrectDigits = (inputDigits) => {
    let corrected = inputDigits;
    
    // Коррекция дня (первые 2 цифры)
    if (corrected.length >= 2) {
      let day = parseInt(corrected.slice(0, 2), 10);
      if (day > 31) day = 31;
      if (day < 1 && corrected.slice(0, 2) !== "0_") day = 1;
      corrected = day.toString().padStart(2, "0") + corrected.slice(2);
    }
    
    // Коррекция месяца (цифры 3-4)
    if (corrected.length >= 4) {
      let month = parseInt(corrected.slice(2, 4), 10);
      if (month > 12) month = 12;
      if (month < 1) month = 1;
      corrected = corrected.slice(0, 2) + month.toString().padStart(2, "0") + corrected.slice(4);
    }
    
    // Коррекция года (цифры 5-8)
    if (corrected.length >= 5) {
      const yearPart = corrected.slice(4);
      // Если первая цифра года < 2, заменяем на 2
      if (yearPart.length >= 1 && parseInt(yearPart[0], 10) < 2) {
        corrected = corrected.slice(0, 4) + "2" + corrected.slice(5);
      }
      // Если первая цифра года > 2, заменяем на 2
      if (yearPart.length >= 1 && parseInt(yearPart[0], 10) > 2) {
        corrected = corrected.slice(0, 4) + "2" + corrected.slice(5);
      }
      // Проверяем полный год на максимум 2099
      if (corrected.length === 8) {
        let year = parseInt(corrected.slice(4, 8), 10);
        if (year > 2099) {
          corrected = corrected.slice(0, 4) + "2099";
        }
      }
    }
    
    return corrected;
  };
  
  const handleChange = (e) => {
    const rawValue = e.target.value;
    // Извлекаем только цифры
    let newDigits = rawValue.replace(/\D/g, "").slice(0, 8);
    
    // Автокоррекция
    newDigits = autoCorrectDigits(newDigits);
    
    setDigits(newDigits);
    setError("");
    
    // Если введено 8 цифр - полная дата
    if (newDigits.length === 8) {
      const day = newDigits.slice(0, 2);
      const month = newDigits.slice(2, 4);
      const year = newDigits.slice(4, 8);
      
      const validationError = validateDate(day, month, year);
      if (validationError) {
        setError(validationError);
      } else {
        const isoDate = `${year}-${month}-${day}`;
        onChange(isoDate);
      }
    } else {
      onChange("");
    }
    
    // Устанавливаем позицию курсора после обновления
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const pos = getCursorPosition(newDigits.length);
        inputRef.current.setSelectionRange(pos, pos);
      }
    });
  };
  
  const handleKeyDown = (e) => {
    // Обработка Backspace - удаляем последнюю цифру
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits.length > 0) {
        const newDigits = digits.slice(0, -1);
        setDigits(newDigits);
        setError("");
        // Очищаем value только если удалили все цифры
        if (newDigits.length === 0) {
          onChange("");
        } else {
          // Если осталось меньше 8 цифр - дата неполная, очищаем value
          onChange("");
        }
        requestAnimationFrame(() => {
          if (inputRef.current) {
            const pos = getCursorPosition(newDigits.length);
            inputRef.current.setSelectionRange(pos, pos);
          }
        });
      }
    }
    // Обработка Delete - удаляем последнюю цифру (как Backspace)
    if (e.key === "Delete") {
      e.preventDefault();
      if (digits.length > 0) {
        const newDigits = digits.slice(0, -1);
        setDigits(newDigits);
        setError("");
        if (newDigits.length === 0 || newDigits.length < 8) {
          onChange("");
        }
        requestAnimationFrame(() => {
          if (inputRef.current) {
            const pos = getCursorPosition(newDigits.length);
            inputRef.current.setSelectionRange(pos, pos);
          }
        });
      }
    }
  };
  
  const handleFocus = () => {
    requestAnimationFrame(() => {
      if (inputRef.current) {
        const pos = getCursorPosition(digits.length);
        inputRef.current.setSelectionRange(pos, pos);
      }
    });
  };
  
  const handleClear = () => {
    setDigits("");
    setError("");
    onClear();
  };
  
  const displayValue = digits ? getDisplayWithMask(digits) : "";
  
  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-sm text-[#828282]">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder || "__.__.____"}
          className={`w-full bg-[#EFEFEF] rounded-[20px] px-4 py-3 pr-10 text-base text-[#282828] focus:outline-none transition-all ${
            error ? 'border border-red-400' : 'border-none'
          } ${!value && !digits ? 'text-[#828282]' : ''}`}
        />
        {/* Кнопка очистки - показываем если есть хоть какой-то ввод */}
        {(value || digits) && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
          >
            <CloseIcon />
          </button>
        )}
      </div>
      {/* Сообщение об ошибке */}
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}

/**
 * Группа переключателей (toggle buttons) - фиксированная ширина кнопок
 */
function ToggleGroup({ label, options, value, onChange, multiSelect = false }) {
  // value может быть массивом (для мультиселекта) или строкой
  const selectedValues = multiSelect 
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : [];
  
  const isSelected = (optValue) => {
    if (multiSelect) {
      return selectedValues.includes(optValue);
    }
    return value === optValue;
  };
  
  const handleClick = (optValue) => {
    if (multiSelect) {
      if (selectedValues.includes(optValue)) {
        // Убираем из выбранных
        const newValues = selectedValues.filter(v => v !== optValue);
        onChange(newValues.length > 0 ? newValues : null);
      } else {
        // Добавляем к выбранным
        onChange([...selectedValues, optValue]);
      }
    } else {
      // Одиночный выбор - toggle
      onChange(value === optValue ? null : optValue);
    }
  };
  
  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-sm text-[#828282]">{label}</label>
      <div className="flex gap-[10px]">
        {options.map((opt) => {
          const isActive = isSelected(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => handleClick(opt.value)}
              className={`
                h-[34px] px-4 flex items-center justify-center text-sm font-medium rounded-[20px] transition-all whitespace-nowrap
                ${isActive
                  ? "bg-transparent border border-[#EE2C34] text-[#EE2C34]"
                  : "bg-[#EFEFEF] text-[#282828] hover:bg-[#E5E5E5] border border-transparent"
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Опции для фильтров (согласно API)
// Города из EventCity enum
const CITY_OPTIONS = [
  { value: "Москва", label: "Москва, Россия" },
  { value: "Санкт-Петербург", label: "Санкт-Петербург, Россия" },
  { value: "Новосибирск", label: "Новосибирск, Россия" },
  { value: "Екатеринбург", label: "Екатеринбург, Россия" },
  { value: "Краснодар", label: "Краснодар, Россия" },
  { value: "Самара", label: "Самара, Россия" },
  { value: "Уфа", label: "Уфа, Россия" },
  { value: "Волгоград", label: "Волгоград, Россия" },
  { value: "Казань", label: "Казань, Россия" },
  { value: "Рязань", label: "Рязань, Россия" },
  { value: "Саратов", label: "Саратов, Россия" },
  { value: "Тольятти", label: "Тольятти, Россия" },
  { value: "Ростов-на-Дону", label: "Ростов-на-Дону, Россия" },
  { value: "Минск", label: "Минск, Беларусь" },
  { value: "Гомель", label: "Гомель, Беларусь" },
  { value: "Брест", label: "Брест, Беларусь" },
  { value: "Витебск", label: "Витебск, Беларусь" },
  { value: "Гродно", label: "Гродно, Беларусь" },
  { value: "Могилев", label: "Могилев, Беларусь" },
];

// Типы событий из EventType enum
const EVENT_TYPE_OPTIONS = [
  { value: "День рождения", label: "День рождения" },
  { value: "Вечеринка", label: "Вечеринка" },
  { value: "Встреча", label: "Встреча" },
  { value: "Тренинг", label: "Тренинг" },
  { value: "Конференция", label: "Конференция" },
  { value: "Мастер-класс", label: "Мастер-класс" },
  { value: "Семинар", label: "Семинар" },
  { value: "Концерт", label: "Концерт" },
  { value: "Фестиваль", label: "Фестиваль" },
  { value: "Экскурсия", label: "Экскурсии" },
  { value: "Тур", label: "Тур" },
  { value: "Другое", label: "Другое" },
];

// Статусы событий из EventStatus enum
const STATUS_OPTIONS = [
  { value: "coming soon", label: "Скоро" },
  { value: "active", label: "Активное" },
  { value: "completed", label: "Завершено" },
  { value: "cancelled", label: "Отменено" },
];

// Опции ограничения участников
const MEMBER_LIMIT_OPTIONS = [
  { value: "no_limit", label: "Без ограничения" },
  { value: "limit", label: "С ограничением" },
];

// Опции цены
const PRICE_OPTIONS = [
  { value: "free", label: "Бесплатно" },
  { value: "paid", label: "Платно" },
];

/**
 * Преобразовать дату в формат для API (YYYY-MM-DD)
 * Входной формат может быть YYYY-MM-DD или DD.MM.YYYY
 */
function formatDateForApi(dateString) {
  if (!dateString) return "";
  
  let year, month, day;
  
  // Проверяем формат YYYY-MM-DD
  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    [, year, month, day] = isoMatch;
  } else {
    // Проверяем формат DD.MM.YYYY
    const ruMatch = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (ruMatch) {
      [, day, month, year] = ruMatch;
    } else {
      return "";
    }
  }
  
  // Возвращаем в простом формате YYYY-MM-DD
  return `${year}-${month}-${day}`;
}

/**
 * Преобразовать UI фильтры в формат для API
 * API параметры: user_id, start_date, end_date, max_members, name, type, status, city
 */
function transformToApiFilters(uiFilters) {
  const apiFilters = {};
  
  // Город -> city (передаём массив как есть для повторяющихся параметров)
  if (uiFilters.city && (!Array.isArray(uiFilters.city) || uiFilters.city.length > 0)) {
    apiFilters.city = uiFilters.city;
  }
  
  // Тип события -> type (передаём массив как есть для повторяющихся параметров)
  if (uiFilters.type && (!Array.isArray(uiFilters.type) || uiFilters.type.length > 0)) {
    apiFilters.type = uiFilters.type;
  }
  
  // Статус -> status
  if (uiFilters.status) {
    apiFilters.status = uiFilters.status;
  }
  
  // Дата начала -> start_date (формат ISO: YYYY-MM-DDTHH:mm:ss.sssZ)
  if (uiFilters.start_date) {
    apiFilters.start_date = formatDateForApi(uiFilters.start_date);
  }
  
  // Дата окончания -> end_date (формат ISO: YYYY-MM-DDTHH:mm:ss.sssZ)
  if (uiFilters.end_date) {
    apiFilters.end_date = formatDateForApi(uiFilters.end_date);
  }
  
  // Поиск по названию -> name
  if (uiFilters.name) {
    apiFilters.name = uiFilters.name;
  }
  
  // Максимальное количество участников -> max_members
  if (uiFilters.limit === "limit" && uiFilters.max_members) {
    apiFilters.max_members = uiFilters.max_members;
  }
  
  return apiFilters;
}

export function EventsFilter({ filters, onFiltersChange, onApply, onReset, isMobile = false }) {
  // Локальное состояние фильтров (используем ключи API + UI helpers)
  const [localFilters, setLocalFilters] = useState({
    city: "",
    type: "",
    status: "",
    start_date: "",
    end_date: "",
    name: "",
    limit: null, // UI only - не выбрано по умолчанию
    price: null, // UI only - не выбрано по умолчанию
    ...filters,
  });

  // Обновление локального фильтра
  const updateFilter = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Применить фильтры
  const handleApply = () => {
    const apiFilters = transformToApiFilters(localFilters);
    // Добавляем price и limit для клиентской фильтрации
    const filtersWithClientSide = {
      ...apiFilters,
      price: localFilters.price,
      limit: localFilters.limit,
    };
    if (onFiltersChange) {
      onFiltersChange(filtersWithClientSide);
    }
    if (onApply) {
      onApply(filtersWithClientSide);
    }
  };

  // Сбросить фильтры
  const handleReset = () => {
    const defaultFilters = {
      city: "",
      type: "",
      status: "",
      start_date: "",
      end_date: "",
      name: "",
      limit: null,
      price: null,
    };
    setLocalFilters(defaultFilters);
    if (onFiltersChange) {
      onFiltersChange({});
    }
    if (onReset) {
      onReset();
    }
  };

  // Проверка, есть ли активные фильтры (считаем все выбранные значения)
  // Для массивов (limit, price) считаем каждый элемент отдельно
  const activeCount = Object.entries(localFilters).reduce((count, [key, val]) => {
    if (Array.isArray(val)) {
      return count + val.length; // Каждый элемент массива = +1
    }
    if (val !== "" && val !== null && val !== undefined) {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      {/* Место проведения - мультиселект */}
      <FilterSelect
        label="Место проведения"
        value={localFilters.city}
        onChange={(val) => updateFilter("city", val)}
        options={CITY_OPTIONS}
        placeholder="Все города"
        multiSelect={true}
      />

      {/* Тип события - мультиселект */}
      <FilterSelect
        label="Тип события"
        value={localFilters.type}
        onChange={(val) => updateFilter("type", val)}
        options={EVENT_TYPE_OPTIONS}
        placeholder="Все типы"
        multiSelect={true}
      />

      {/* Даты */}
      <div className="grid grid-cols-2 gap-3">
        <DateInput
          label="Дата начала"
          value={localFilters.start_date}
          onChange={(val) => updateFilter("start_date", val)}
          onClear={() => updateFilter("start_date", "")}
        />
        <DateInput
          label="Дата завершения"
          value={localFilters.end_date}
          onChange={(val) => updateFilter("end_date", val)}
          onClear={() => updateFilter("end_date", "")}
          minDate={localFilters.start_date}
        />
      </div>

      {/* Ограничение по участникам */}
      <ToggleGroup
        label="Ограничение по участникам"
        options={MEMBER_LIMIT_OPTIONS}
        value={localFilters.limit}
        onChange={(val) => updateFilter("limit", val)}
        multiSelect={true}
      />

      {/* Цена */}
      <ToggleGroup
        label="Цена"
        options={PRICE_OPTIONS}
        value={localFilters.price}
        onChange={(val) => updateFilter("price", val)}
        multiSelect={true}
      />

      {/* Кнопки действий - скрыты на мобильных (используются кнопки в модалке) */}
      {isMobile ? (
        <div className="flex gap-[10px] mt-[24px] pb-4">
          <button
            onClick={handleReset}
            className="relative flex-1 h-[50px] flex items-center justify-center text-base font-medium text-neutral-900 bg-[#EFEFEF] rounded-[16px] hover:bg-neutral-200 transition-colors"
          >
            Отменить
          </button>
          <button
            onClick={handleApply}
            className="flex-1 h-[50px] flex items-center justify-center text-base font-medium text-white bg-[#EE2C34] rounded-[16px] hover:bg-[#D42930] transition-colors"
          >
            Применить
          </button>
        </div>
      ) : (
        <div className="flex gap-[10px] mt-[24px]">
          <button
            onClick={handleReset}
            className="relative flex-1 h-[56px] flex items-center justify-center text-base font-medium text-neutral-900 bg-[#EFEFEF] rounded-[20px] hover:bg-neutral-200 transition-colors"
          >
            Очистить всё
            {activeCount > 0 && (
              <span className="ml-2 flex items-center justify-center w-5 h-5 text-[10px] text-white bg-[#EE2C34] rounded-full">
                {activeCount}
              </span>
            )}
          </button>
          <button
            onClick={handleApply}
            className="flex-1 h-[56px] flex items-center justify-center text-base font-medium text-[#F3FBFF] bg-[#EE2C34] rounded-[20px] hover:bg-[#D42930] transition-colors"
          >
            Применить
          </button>
        </div>
      )}
    </aside>
  );
}

export default EventsFilter;
