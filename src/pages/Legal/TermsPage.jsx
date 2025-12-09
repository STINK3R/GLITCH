import React from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Страница условий использования
 */
export const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Хедер */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-neutral-100 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors mr-4"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="text-xl font-bold text-neutral-900">Условия использования</h1>
        </div>
      </div>

      {/* Контент */}
      <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">
        <div className="prose text-neutral-600">
          <p className="text-sm text-neutral-400 mb-6">
            Последнее обновление: 9 декабря 2025 года
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">1. Общие положения</h2>
          <p>
            Добро пожаловать в приложение «Слёт» — электронную афишу событий. 
            Используя наше приложение, вы соглашаетесь с настоящими условиями использования.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">2. Описание сервиса</h2>
          <p>
            «Слёт» предоставляет пользователям возможность просматривать информацию о событиях, 
            мероприятиях и активностях, а также регистрироваться на них.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">3. Регистрация и аккаунт</h2>
          <p>
            Для использования полного функционала приложения необходимо создать учётную запись. 
            Вы несёте ответственность за сохранность своих учётных данных и за все действия, 
            совершённые под вашей учётной записью.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">4. Правила поведения</h2>
          <p>Пользователи обязуются:</p>
          <ul>
            <li>Предоставлять достоверную информацию при регистрации</li>
            <li>Не нарушать права других пользователей</li>
            <li>Не использовать сервис в противоправных целях</li>
            <li>Соблюдать законодательство Российской Федерации</li>
          </ul>

          <h2 className="text-lg font-semibold text-neutral-900">5. Интеллектуальная собственность</h2>
          <p>
            Все материалы, представленные в приложении, являются объектами интеллектуальной 
            собственности и защищены законодательством об авторском праве.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">6. Ограничение ответственности</h2>
          <p>
            Администрация сервиса не несёт ответственности за действия организаторов 
            мероприятий и качество проводимых событий.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">7. Изменение условий</h2>
          <p>
            Мы оставляем за собой право изменять настоящие условия использования. 
            Актуальная версия всегда доступна в приложении.
          </p>

          <h2 className="text-lg font-semibold text-neutral-900">8. Контакты</h2>
          <p>
            По всем вопросам обращайтесь на электронную почту: RomanPavlovichWork@yandex.ru
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-100">
          <Link 
            to="/privacy" 
            className="text-[#EE2C34] hover:underline text-sm font-medium"
          >
            Политика конфиденциальности →
          </Link>
        </div>
      </div>
    </div>
  );
};

