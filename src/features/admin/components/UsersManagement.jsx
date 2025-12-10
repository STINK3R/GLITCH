/**
 * Страница управления пользователями в админ-панели
 * Заглушка - будет реализована позже
 */

export function UsersManagement() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-semibold text-neutral-900 mb-6">
        Управление пользователями
      </h1>
      
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">
          Раздел в разработке
        </h2>
        <p className="mt-2 text-neutral-500 text-center">
          Управление пользователями будет доступно в ближайшее время
        </p>
      </div>
    </div>
  );
}
