import { http } from "../../services/http";

/**
 * API методы для авторизации
 */
export const authApi = {
    /**
     * Вход в систему
     * @param {string} email
     * @param {string} password
     */
    login: (email, password) => http("/api/auth", {
        method: "POST",
        body: JSON.stringify({ email, password })
    }),

    /**
     * Регистрация нового пользователя
     * @param {string} email
     * @param {string} password
     */
    register: (email, password) => http("/api/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
    }),

    /**
     * Обновление токена
     */
    refresh: () => http("/api/refresh", {
        method: "POST"
    }),
};