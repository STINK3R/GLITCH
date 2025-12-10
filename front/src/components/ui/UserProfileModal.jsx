/**
 * Модальное окно профиля пользователя
 * Содержит: Личные данные, Безопасность, Уведомления, Тема, Помощь
 */

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../features/auth/AuthStore";
import { authApi } from "../../features/auth/api";
import { http } from "../../services/http";

// Иконки для пунктов меню (inline SVG)
const PersonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="#EE2C34" strokeWidth="2"/>
    <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="10" width="14" height="10" rx="2" stroke="#EE2C34" strokeWidth="2"/>
    <path d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3C8.68629 3 6 5.68629 6 9V14L4 17H20L18 14V9C18 5.68629 15.3137 3 12 3Z" stroke="#EE2C34" strokeWidth="2"/>
    <path d="M9 17V18C9 19.6569 10.3431 21 12 21C13.6569 21 15 19.6569 15 18V17" stroke="#EE2C34" strokeWidth="2"/>
  </svg>
);

const ThemeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L14.5 8.5L20.5 9.5L16 14L17 20L12 17L7 20L8 14L3.5 9.5L9.5 8.5L12 3Z" stroke="#EE2C34" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="#EE2C34" strokeWidth="2"/>
    <path d="M12 17V17.01" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 14C12 11 15 11 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6L15 12L9 18" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 12C14 14.2091 12.2091 16 10 16C7.79086 16 6 14.2091 6 12C6 9.79086 7.79086 8 10 8C12.2091 8 14 9.79086 14 12Z" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round"/>
    <path d="M14 12L20 6" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round"/>
    <path d="M20 6L22 8" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 16L21 12L17 8" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12H9" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H9" stroke="#EE2C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Экраны модального окна
const SCREENS = {
  MAIN: "main",
  PERSONAL_DATA: "personal_data",
  SECURITY: "security",
  EMAIL_INSTRUCTION: "email_instruction",
  NOTIFICATIONS: "notifications",
  THEME: "theme",
  HELP: "help",
};

// Опции темы
const THEME_OPTIONS = [
  { id: "light", label: "Светлая" },
  { id: "dark", label: "Тёмная" },
  { id: "system", label: "Системная" },
];

// Пункты главного меню (группы как на скриншоте)
const MENU_SECTIONS = [
  {
    title: "Аккаунт",
    items: [
      { id: SCREENS.PERSONAL_DATA, label: "Личные данные", icon: PersonIcon },
      { id: SCREENS.SECURITY, label: "Безопасность", icon: LockIcon },
    ]
  },
  {
    title: "Интерфейс",
    items: [
      { id: SCREENS.THEME, label: "Тема", icon: ThemeIcon, showValue: true },
    ]
  },
];

/**
 * Экран "Личные данные"
 */
function PersonalDataScreen({ user, onBack, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    surname: user?.surname || "",
    father_name: user?.father_name || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    // Для ФИО разрешаем только русские буквы, пробел и дефис
    if (["name", "surname", "father_name"].includes(field)) {
      if (value === "" || /^[а-яА-ЯёЁ\s-]+$/.test(value)) {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-[#F5F5F5] rounded-full hover:bg-neutral-200 transition-colors"
        >
          <BackIcon />
        </button>
        <h2 className="text-xl font-semibold text-neutral-900">Личные данные</h2>
      </div>

      {/* Форма */}
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm text-neutral-500 mb-2">
            Имя <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full h-[52px] px-4 bg-[#F5F5F5] rounded-2xl text-base outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full h-[52px] px-4 bg-[#F5F5F5] rounded-2xl text-base outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-2">
            Фамилия <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.surname}
            onChange={(e) => handleChange("surname", e.target.value)}
            className="w-full h-[52px] px-4 bg-[#F5F5F5] rounded-2xl text-base outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-500 mb-2">
            Отчество
          </label>
          <input
            type="text"
            value={formData.father_name}
            onChange={(e) => handleChange("father_name", e.target.value)}
            className="w-full h-[52px] px-4 bg-[#F5F5F5] rounded-2xl text-base outline-none focus:ring-2 focus:ring-neutral-300 transition-all"
          />
        </div>
      </div>

      {/* Кнопка сохранения */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full h-[52px] mt-6 bg-[#EE2C34] text-white font-medium rounded-2xl hover:bg-[#D42930] transition-colors disabled:opacity-50"
      >
        {isLoading ? "Сохранение..." : "Изменить"}
      </button>
    </div>
  );
}

/**
 * Экран "Безопасность" - Меню выбора
 */
function SecurityMenuScreen({ onBack, onChangePassword, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-[#F5F5F5] rounded-full hover:bg-neutral-200 transition-colors"
        >
          <BackIcon />
        </button>
        <h2 className="text-xl font-semibold text-neutral-900">Безопасность</h2>
      </div>

      <div className="space-y-4">
        {/* Сменить пароль */}
        <button
          onClick={onChangePassword}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#F5F5F5] rounded-2xl transition-colors group border border-transparent hover:border-neutral-200"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <KeyIcon />
          </div>
          <span className="flex-1 text-left font-medium text-neutral-900">
            Сменить пароль
          </span>
          <ChevronRightIcon />
        </button>

        {/* Выйти (Удалить) */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-red-50 rounded-2xl transition-colors group border border-transparent hover:border-red-100"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <LogoutIcon />
          </div>
          <span className="flex-1 text-left font-medium text-[#EE2C34]">
            Выйти
          </span>
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}

/**
 * Экран "Инструкция по почте" (Вместо ввода кода)
 */
function EmailInstructionScreen({ email, onBack, onResend, onClose }) {
  const [countdown, setCountdown] = useState(38);
  
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResendClick = () => {
    if (countdown === 0) {
      setCountdown(60);
      onResend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-[#F5F5F5] rounded-full hover:bg-neutral-200 transition-colors"
        >
          <BackIcon />
        </button>
        <h2 className="text-xl font-semibold text-neutral-900">Проверьте вашу почту</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#EE2C34"/>
          </svg>
        </div>
        
        <p className="text-neutral-900 font-medium mb-2">
          Мы отправили письмо на
        </p>
        <p className="text-neutral-500 mb-8 break-all">
          {email}
        </p>
        <p className="text-sm text-neutral-500 mb-8">
          Перейдите по ссылке в письме, чтобы задать новый пароль.
        </p>

        <button
          onClick={onClose}
          className="w-full h-[52px] bg-[#EE2C34] text-white font-medium rounded-2xl hover:bg-[#D42930] transition-colors mb-4"
        >
          Понятно
        </button>
        
        {/* Таймер повторной отправки */}
        <button
          onClick={handleResendClick}
          disabled={countdown > 0}
          className={`text-sm ${countdown > 0 ? "text-neutral-400" : "text-[#EE2C34] hover:text-[#D42930]"}`}
        >
          {countdown > 0 
            ? `Отправить новое письмо через ${formatTime(countdown)}`
            : "Отправить письмо повторно"
          }
        </button>
      </div>
    </div>
  );
}

/**
 * Экран "Выбор темы"
 */
function ThemeScreen({ currentTheme, onBack, onSelectTheme }) {
  return (
    <div className="flex flex-col h-full">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center bg-[#F5F5F5] rounded-full hover:bg-neutral-200 transition-colors"
        >
          <BackIcon />
        </button>
        <h2 className="text-xl font-semibold text-neutral-900">Выберите тему</h2>
      </div>

      {/* Опции темы */}
      <div className="space-y-2">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectTheme(option.id)}
            className={`w-full h-[52px] px-4 rounded-2xl text-left font-medium transition-colors ${
              currentTheme === option.id
                ? "bg-[#EE2C34] text-white"
                : "bg-[#F5F5F5] text-neutral-900 hover:bg-neutral-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Главный экран меню
 */
function MainMenuScreen({ user, theme, onSelectItem }) {
  const getThemeLabel = () => {
    const option = THEME_OPTIONS.find(o => o.id === theme);
    return option?.label || "Светлая";
  };

  return (
    <div className="space-y-6">
      {MENU_SECTIONS.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          <h3 className="text-sm text-neutral-400 mb-2 px-1">{section.title}</h3>
          <div className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectItem(item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#F5F5F5] rounded-2xl transition-colors group"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <Icon />
                  </div>
                  <span className="flex-1 text-left font-medium text-neutral-900">
                    {item.label}
                    {item.showValue && (
                      <span className="text-neutral-400">: {getThemeLabel()}</span>
                    )}
                  </span>
                  <ChevronRightIcon />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Экран подтверждения выхода
 */
function LogoutConfirmScreen({ onConfirm, onCancel }) {
  return (
    <div className="flex flex-col h-full items-center justify-center text-center px-4">
      <h3 className="text-xl font-semibold text-neutral-900 mb-8 max-w-[280px]">
        Вы точно хотите выйти из аккаунта?
      </h3>
      
      <div className="flex gap-3 w-full">
        <button
          onClick={onConfirm}
          className="flex-1 h-[52px] bg-[#EFEFEF] text-neutral-900 font-medium rounded-2xl hover:bg-[#E5E5E5] transition-colors"
        >
          Выйти
        </button>
        <button
          onClick={onCancel}
          className="flex-1 h-[52px] bg-[#EE2C34] text-white font-medium rounded-2xl hover:bg-[#D42930] transition-colors"
        >
          Назад
        </button>
      </div>
    </div>
  );
}

/**
 * Основной компонент модального окна профиля
 */
export function UserProfileModal({ isOpen, onClose }) {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  
  const [currentScreen, setCurrentScreen] = useState(SCREENS.MAIN);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  const modalRef = useRef(null);

  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        if (currentScreen !== SCREENS.MAIN) {
          setCurrentScreen(SCREENS.MAIN);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, currentScreen, onClose]);

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

  // Сброс экрана при закрытии
  useEffect(() => {
    if (!isOpen) {
      setCurrentScreen(SCREENS.MAIN);
    }
  }, [isOpen]);

  const handleSelectItem = (screenId) => {
    setCurrentScreen(screenId);
  };

  const handleBack = () => {
    if (currentScreen === SCREENS.EMAIL_INSTRUCTION) {
      setCurrentScreen(SCREENS.SECURITY);
    } else {
      setCurrentScreen(SCREENS.MAIN);
    }
  };

  const handleSavePersonalData = async (data) => {
    // Вызвать API для обновления данных
    try {
      updateUser(data);
      // TODO: Реализовать API вызов
    } catch (e) {
      console.error(e);
    }
    setCurrentScreen(SCREENS.MAIN);
  };

  const handleSelectTheme = (themeId) => {
    setTheme(themeId);
    localStorage.setItem("theme", themeId);
    setCurrentScreen(SCREENS.MAIN);
  };

  // --- ЛОГИКА БЕЗОПАСНОСТИ ---

  const handleSendResetEmail = async () => {
    try {
       await authApi.resetPasswordRequest(user.email);
       setCurrentScreen(SCREENS.EMAIL_INSTRUCTION);
    } catch (error) {
       console.error("Failed to request password reset", error);
       alert("Ошибка при отправке письма. Попробуйте позже.");
    }
  };

  const handleChangePasswordClick = () => {
    handleSendResetEmail();
  };

  const handleLogoutClick = () => {
    setCurrentScreen(SCREENS.LOGOUT_CONFIRM);
  };

  const handleConfirmLogout = () => {
    logout();
    onClose();
    window.location.href = "/login";
  };

  if (!isOpen) return null;

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.PERSONAL_DATA:
        return (
          <PersonalDataScreen
            user={user}
            onBack={handleBack}
            onSave={handleSavePersonalData}
          />
        );
      case SCREENS.SECURITY:
        return (
          <SecurityMenuScreen
            onBack={handleBack}
            onChangePassword={handleChangePasswordClick}
            onLogout={handleLogoutClick}
          />
        );
      case SCREENS.EMAIL_INSTRUCTION:
        return (
          <EmailInstructionScreen
            email={user?.email}
            onBack={handleBack}
            onResend={handleSendResetEmail}
            onClose={onClose}
          />
        );
      case SCREENS.LOGOUT_CONFIRM:
        return (
          <LogoutConfirmScreen
            onConfirm={handleConfirmLogout}
            onCancel={handleBack}
          />
        );
      case SCREENS.THEME:
        return (
          <ThemeScreen
            currentTheme={theme}
            onBack={handleBack}
            onSelectTheme={handleSelectTheme}
          />
        );
      case SCREENS.NOTIFICATIONS:
      case SCREENS.HELP:
        // Заглушки для других экранов
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBack}
                className="w-10 h-10 flex items-center justify-center bg-[#F5F5F5] rounded-full hover:bg-neutral-200 transition-colors"
              >
                <BackIcon />
              </button>
              <h2 className="text-xl font-semibold text-neutral-900">
                {currentScreen === SCREENS.NOTIFICATIONS ? "Уведомления" : "Помощь и поддержка"}
              </h2>
            </div>
            <div className="flex-1 flex items-center justify-center text-neutral-400">
              Раздел в разработке
            </div>
          </div>
        );
      default:
        return (
          <MainMenuScreen
            user={user}
            theme={theme}
            onSelectItem={handleSelectItem}
          />
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="absolute right-4 top-20 w-full max-w-[400px] bg-white rounded-[20px] shadow-2xl transform animate-slide-in-right"
        style={{ maxHeight: "calc(100vh - 120px)" }}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 152px)" }}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
