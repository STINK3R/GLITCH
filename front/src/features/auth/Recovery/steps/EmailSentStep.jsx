import React from "react";
import { AuthButton } from "../../../../components/ui/AuthButton";

/**
 * Шаг "Письмо отправлено" для восстановления пароля
 * Соответствует скриншоту 1
 */
export const EmailSentStep = ({ email, maskedEmail, timer, loading, onResend }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in text-center">
      <h2 className="text-2xl font-bold mb-3">Проверьте вашу почту</h2>
      <p className="text-neutral-400 text-sm mb-10 leading-relaxed">
        Мы отправили письмо на почту<br />
        <span className="text-neutral-500">{maskedEmail}</span> с ссылкой для<br />
        восстановления
      </p>

      <AuthButton 
        onClick={onResend}
        disabled={timer > 0}
        loading={loading}
      >
        {timer > 0 
          ? `Отправить новое письмо (${formatTime(timer)})` 
          : "Отправить новое письмо"
        }
      </AuthButton>
    </div>
  );
};

