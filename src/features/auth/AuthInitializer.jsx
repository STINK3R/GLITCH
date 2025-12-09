import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

/**
 * Компонент для инициализации авторизации
 * Проверяет валидность токена при загрузке приложения
 */
export const AuthInitializer = ({ children }) => {
    const { token, refresh, logout } = useAuth();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;

            if (token) {
                refresh().catch(() => {
                    // Если токен невалиден, refresh выбросит ошибку и useAuth вызовет logout
                    // Но на всякий случай можно явно убедиться, что мы чисты
                    console.warn("Session expired or invalid, logging out...");
                });
            }
        }
    }, [token, refresh, logout]);

    return children;
};

