import { useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";

/**
 * Компонент для инициализации авторизации
 * Проверяет валидность токена при загрузке приложения
 */
export const AuthInitializer = ({ children }) => {
    const { token, refresh, logout } = useAuth();
    const initialized = useRef(false);
    // Если есть токен, начинаем с состояния проверки
    const [isChecking, setIsChecking] = useState(!!token);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;

            if (token) {
                refresh()
                    .catch(() => {
                        console.warn("Session expired or invalid, logging out...");
                        // logout уже вызывается внутри refresh при ошибке
                    })
                    .finally(() => {
                        // Завершаем проверку в любом случае
                        setIsChecking(false);
                    });
            } else {
                setIsChecking(false);
            }
        }
    }, [token, refresh, logout]);

    // Пока проверяем токен, ничего не рендерим (или можно показать лоадер)
    if (isChecking) {
        return null; 
    }

    return children;
};


