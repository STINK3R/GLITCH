import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AuthLayout } from "../AuthLayout";
import { AuthButton } from "../../../components/ui/AuthButton";
import { authApi } from "../api";

/**
 * Страница подтверждения email по ссылке из письма
 * URL формат: /verify-email?code=707368
 */
export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    if (!code) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        // Получаем email из localStorage (сохранен при регистрации)
        const email = localStorage.getItem("pending_verification_email");
        
        if (email) {
          // Подтверждаем с email и кодом
          await authApi.registerConfirm(email, code);
          localStorage.removeItem("pending_verification_email");
        } else {
          // Пробуем только с кодом
          await authApi.registerConfirmByCode(code);
        }
        
        setStatus("success");
        // Перенаправляем на вход через 2 секунды
        setTimeout(() => navigate("/login"), 2000);
      } catch (e) {
        console.error("Verification error:", e);
        setStatus("error");
      }
    };

    verify();
  }, [code, navigate]);

  // Функция для повторной отправки письма
  const handleResend = () => {
    navigate("/register");
  };

  return (
    <AuthLayout showBack onBack={() => navigate("/login")}>
      <div className="text-center animate-fade-in pt-8">
        {status === "loading" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Проверка почты...</h2>
            <div className="w-10 h-10 border-4 border-[#EE2C34] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Почта подтверждена!</h2>
            <p className="text-neutral-400 text-sm">
              Сейчас вы будете перенаправлены на вход...
            </p>
          </div>
        )}

        {status === "error" && (
          <div>
            <h2 className="text-2xl font-bold mb-3">Ссылка недействительна</h2>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
              Похоже, вы перешли по устаревшей или уже<br />
              использованной ссылке.
            </p>

            <AuthButton onClick={handleResend}>
              Отправить новое письмо
            </AuthButton>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
