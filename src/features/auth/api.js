import { http } from "../../services/http";

/**
 * API методы для авторизации
 * Соответствуют документации Swagger
 */
export const authApi = {
    /**
     * Вход в систему
     * POST /api/auth
     */
    login: (username, password) => http("/api/auth", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        skipAuth: true
    }),

    /**
     * Регистрация нового пользователя
     * POST /api/register
     */
    register: (username, password, repeat_password) => http("/api/register/request", {
        method: "POST",
        body: JSON.stringify({
            username,
            password,
            repeat_password
        }),
        skipAuth: true
    }),

    /**
     * Обновление токена
     * POST /api/refresh
     * refresh-token передается в заголовке
     */
    refresh: (refreshToken) => http("/api/refresh", {
        method: "POST",
        headers: {
            "refresh-token": refreshToken
        }
    }),
};