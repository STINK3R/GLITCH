/**
 * Компонент фильтрации событий (боковая панель)
 * Содержит фильтры: место, тип, даты, ограничения, цена
 */

import { useState } from "react";

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
 * Кастомный селект
 */
function FilterSelect({ label, value, options, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-neutral-500">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 pr-10 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all cursor-pointer"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <ChevronDownIcon />
        </div>
      </div>
    </div>
  );
}

/**
 * Кастомное поле для даты
 */
function DateInput({ label, value, onChange, onClear }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-neutral-500">{label}</label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Группа переключателей (toggle buttons)
 */
function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="text-sm text-neutral-500">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(isActive ? null : opt.value)}
              className={`
                px-4 py-2 text-sm font-medium rounded-full border transition-all
                ${isActive
                  ? "border-[#EE2C34] text-[#EE2C34] bg-red-50"
                  : "border-neutral-200 text-neutral-600 bg-white hover:border-neutral-300"
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
  { value: "Москва", label: "Москва" },
  { value: "Санкт-Петербург", label: "Санкт-Петербург" },
  { value: "Новосибирск", label: "Новосибирск" },
  { value: "Екатеринбург", label: "Екатеринбург" },
  { value: "Краснодар", label: "Краснодар" },
  { value: "Самара", label: "Самара" },
  { value: "Уфа", label: "Уфа" },
  { value: "Волгоград", label: "Волгоград" },
  { value: "Казань", label: "Казань" },
  { value: "Рязань", label: "Рязань" },
  { value: "Саратов", label: "Саратов" },
  { value: "Тольятти", label: "Тольятти" },
  { value: "Ростов-на-Дону", label: "Ростов-на-Дону" },
  { value: "Минск", label: "Минск" },
  { value: "Гомель", label: "Гомель" },
  { value: "Брест", label: "Брест" },
  { value: "Витебск", label: "Витебск" },
  { value: "Гродно", label: "Гродно" },
  { value: "Могилев", label: "Могилев" },
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
  { value: "Экскурсия", label: "Экскурсия" },
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

/**
 * Преобразовать UI фильтры в формат для API
 * API параметры: user_id, start_date, end_date, max_members, name, type, status, city
 */
function transformToApiFilters(uiFilters) {
  const apiFilters = {};
  
  // Город -> city
  if (uiFilters.city) {
    apiFilters.city = uiFilters.city;
  }
  
  // Тип события -> type
  if (uiFilters.type) {
    apiFilters.type = uiFilters.type;
  }
  
  // Статус -> status
  if (uiFilters.status) {
    apiFilters.status = uiFilters.status;
  }
  
  // Дата начала -> start_date (формат YYYY-MM-DD)
  if (uiFilters.start_date) {
    apiFilters.start_date = uiFilters.start_date;
  }
  
  // Дата окончания -> end_date (формат YYYY-MM-DD)
  if (uiFilters.end_date) {
    apiFilters.end_date = uiFilters.end_date;
  }
  
  // Поиск по названию -> name
  if (uiFilters.name) {
    apiFilters.name = uiFilters.name;
  }
  
  // Максимальное количество участников -> max_members
  if (uiFilters.max_members) {
    apiFilters.max_members = uiFilters.max_members;
  }
  
  return apiFilters;
}

export function EventsFilter({ filters, onFiltersChange, onApply, onReset }) {
  // Локальное состояние фильтров (используем ключи API)
  const [localFilters, setLocalFilters] = useState({
    city: "",
    type: "",
    status: "",
    start_date: "",
    end_date: "",
    name: "",
    ...filters,
  });

  // Обновление локального фильтра
  const updateFilter = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Применить фильтры
  const handleApply = () => {
    const apiFilters = transformToApiFilters(localFilters);
    if (onFiltersChange) {
      onFiltersChange(apiFilters);
    }
    if (onApply) {
      onApply(apiFilters);
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
    };
    setLocalFilters(defaultFilters);
    if (onFiltersChange) {
      onFiltersChange({});
    }
    if (onReset) {
      onReset();
    }
  };

  // Проверка, есть ли активные фильтры
  const hasActiveFilters = Object.values(localFilters).some(
    (val) => val !== "" && val !== null && val !== undefined
  );

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      {/* Город */}
      <FilterSelect
        label="Город"
        value={localFilters.city}
        onChange={(val) => updateFilter("city", val)}
        options={CITY_OPTIONS}
        placeholder="Все города"
      />

      {/* Тип события */}
      <FilterSelect
        label="Тип события"
        value={localFilters.type}
        onChange={(val) => updateFilter("type", val)}
        options={EVENT_TYPE_OPTIONS}
        placeholder="Все типы"
      />

      {/* Статус события */}
      <FilterSelect
        label="Статус"
        value={localFilters.status}
        onChange={(val) => updateFilter("status", val)}
        options={STATUS_OPTIONS}
        placeholder="Все статусы"
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
          label="Дата окончания"
          value={localFilters.end_date}
          onChange={(val) => updateFilter("end_date", val)}
          onClear={() => updateFilter("end_date", "")}
        />
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleReset}
          disabled={!hasActiveFilters}
          className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
            hasActiveFilters
              ? "text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
              : "text-neutral-400 bg-neutral-50 cursor-not-allowed"
          }`}
        >
          Сбросить всё
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-3 text-sm font-medium text-white bg-[#EE2C34] rounded-xl hover:bg-[#D42930] transition-colors"
        >
          Применить
        </button>
      </div>
    </aside>
  );
}

export default EventsFilter;
