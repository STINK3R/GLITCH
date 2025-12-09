import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

/**
 * Страница политики конфиденциальности
 */
export const PrivacyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Определяем куда вернуться - избегаем цикла между terms и privacy
  const handleBack = () => {
    // Если пришли с terms, идём на главную или логин
    const from = location.state?.from;
    if (from && !from.includes('/privacy') && !from.includes('/terms')) {
      navigate(from);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Хедер */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-neutral-100 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center">
          <button 
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors mr-4"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-neutral-900">Политика конфиденциальности</h1>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">
        <div className="prose text-neutral-600">
          <p className="text-sm text-neutral-400 mb-6">
            Последнее обновление: 9 декабря 2025 года
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">1. Сбор информации</h2>
          <p>
            При использовании приложения «Слёт» мы собираем следующую информацию:
          </p>
          <ul>
            <li>Имя, фамилия и отчество (при регистрации)</li>
            <li>Адрес электронной почты</li>
            <li>Данные об участии в мероприятиях</li>
            <li>Техническая информация об устройстве</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900">2. Использование информации</h2>
          <p>Собранная информация используется для:</p>
          <ul>
            <li>Идентификации пользователя в системе</li>
            <li>Отправки уведомлений о мероприятиях</li>
            <li>Улучшения качества сервиса</li>
            <li>Связи с пользователем по важным вопросам</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900">3. Защита данных</h2>
          <p>
            Мы принимаем все необходимые технические и организационные меры для защиты 
            ваших персональных данных от несанкционированного доступа, изменения, 
            раскрытия или уничтожения.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">4. Передача данных третьим лицам</h2>
          <p>
            Мы не передаём ваши персональные данные третьим лицам без вашего согласия, 
            за исключением случаев, предусмотренных законодательством РФ.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">5. Cookies и аналитика</h2>
          <p>
            Приложение может использовать cookies и аналогичные технологии для 
            улучшения пользовательского опыта и сбора статистики использования.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">6. Права пользователя</h2>
          <p>Вы имеете право:</p>
          <ul>
            <li>Получить информацию о хранящихся данных</li>
            <li>Потребовать исправления неточных данных</li>
            <li>Потребовать удаления ваших данных</li>
            <li>Отозвать согласие на обработку данных</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900">7. Хранение данных</h2>
          <p>
            Персональные данные хранятся на серверах, расположенных на территории 
            Российской Федерации, в течение срока, необходимого для достижения 
            целей обработки.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">8. Контакты</h2>
          <p>
            По вопросам, связанным с обработкой персональных данных, обращайтесь: 
            RomanPavlovichWork@yandex.ru
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100">
          <Link 
            to="/terms" 
            className="text-[#EE2C34] hover:text-[#D42930] transition-colors duration-300 text-sm font-medium"
          >
            ← Условия использования
          </Link>
        </div>
      </div>
    </div>
  );
};

