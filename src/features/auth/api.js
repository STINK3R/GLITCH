import { http } from "../../services/http";

/**
 * API методы для авторизации
 * Обновлено согласно реальной спецификации Swagger
 */
export const authApi = {
    /**
     * Вход в систему
     * POST /api/auth
     */
    login: (email, password) => http("/api/auth", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true
    }),

    /**
     * Запрос на регистрацию (Шаг 1)
     * POST /api/register/request
     */
    registerRequest: (data) => http("/api/register/request", {
        method: "POST",
        body: JSON.stringify({
            name: data.name,
            surname: data.surname,
            father_name: data.patronymic || "Отсутствует", // API требует поле
            email: data.email,
            password: data.password,
            repeat_password: data.confirmPassword
        }),
        skipAuth: true
    }),

    /**
     * Подтверждение регистрации кодом (Шаг 2)
     * POST /api/register/confirm
     * @param {string} email - Email пользователя
     * @param {string} code - Код подтверждения
     */
    registerConfirm: (email, code) => http("/api/register/confirm", {
        method: "POST",
        body: JSON.stringify({ email, code }),
        skipAuth: true
    }),

    /**
     * Подтверждение регистрации по ссылке (только код)
     * POST /api/register/confirm
     * Код содержит в себе email (используется для ссылок из письма)
     * @param {string} code - Код из ссылки
     */
    registerConfirmByCode: (code) => http("/api/register/confirm", {
        method: "POST",
        body: JSON.stringify({ code }),
        skipAuth: true
    }),

    /**
     * Запрос на сброс пароля (отправка письма)
     * POST /api/reset-password
     */
    resetPasswordRequest: (email) => http("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        skipAuth: true
    }),

    /**
     * Применение нового пароля (по токену из письма)
     * POST /api/reset-password/confirm
     * @param {string} token - JWT токен из ссылки
     * @param {string} password - Новый пароль
     * @param {string} repeat_password - Подтверждение пароля
     */
    resetPasswordConfirm: (token, password, repeat_password) => http("/api/reset-password/confirm", {
        method: "POST",
        body: JSON.stringify({
            reset_token: token,
            password,
            repeat_password
        }),
        skipAuth: true
    }),

    /**
     * Обновление токена
     * POST /api/refresh
     */
    refresh: (refreshToken) => http("/api/refresh", {
        method: "POST",
        headers: {
            "refresh-token": refreshToken
        },
        skipAuth: true
    }),
};
