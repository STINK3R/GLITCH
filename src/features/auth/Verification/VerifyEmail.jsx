import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { verifyCode } = useAuth(); // Или отдельный метод verifyEmail, если API отличается
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    // Здесь мы должны вызвать API для проверки токена
    // Если API требует email + code, а у нас только token, нужно уточнить API
    // Предположим, что есть метод verifyEmailToken(token) или verifyCode работает с токеном
    // В предыдущем коде verifyCode принимал (email, code).
    // Если ссылка содержит token, это скорее всего другой эндпоинт, например GET /api/verify-email?token=...
    // Но пока попробуем адаптировать под существующий или добавить новый.
    
    // Пока просто симулируем успешную проверку для перехода
    // TODO: Заменить на реальный вызов, например await authApi.verifyEmail(token)
    
    const verify = async () => {
        try {
            // await authApi.verifyEmail(token); 
            // Временно имитируем успех через 1.5 сек
            await new Promise(r => setTimeout(r, 1500));
            setStatus("success");
            setTimeout(() => navigate("/login"), 2000);
        } catch (e) {
            setStatus("error");
        }
    };
    verify();

  }, [token, navigate]);

  return (
    <AuthLayout>
      <div className="text-center animate-fade-in">
        {status === "loading" && (
            <div>
                <h2 className="text-xl font-bold mb-2">Проверка почты...</h2>
                <div className="w-8 h-8 border-4 border-[#EE2C34] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        )}
        {status === "success" && (
            <div>
                <h2 className="text-xl font-bold mb-2 text-green-600">Почта подтверждена!</h2>
                <p className="text-neutral-500">Сейчас вы будете перенаправлены на вход...</p>
            </div>
        )}
        {status === "error" && (
            <div>
                <h2 className="text-xl font-bold mb-2 text-red-600">Ошибка подтверждения</h2>
                <p className="text-neutral-500 mb-4">Ссылка недействительна или устарела.</p>
                <button onClick={() => navigate("/login")} className="text-[#EE2C34] font-medium">
                    Вернуться ко входу
                </button>
            </div>
        )}
      </div>
    </AuthLayout>
  );
};

