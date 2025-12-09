import React, { useState, useEffect } from "react";
import { CodeInput } from "../../../../components/ui/CodeInput";
import { AuthLayout } from "../../AuthLayout";

export const VerificationStep = ({ email, onNext, onBack, loading }) => {
  const [timer, setTimer] = useState(38);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleComplete = (code) => {
    onNext(code);
  };

  return (
    <div className="animate-fade-in text-center">
      <h2 className="text-2xl font-bold mb-2">Проверьте вашу почту</h2>
      <p className="text-neutral-500 text-sm mb-8 px-4">
        Перейдите по ссылке или введите код <br/> в формате xxx-xxx
      </p>

      <div className="mb-8">
        <CodeInput length={4} onComplete={handleComplete} />
      </div>

      <div className="text-sm text-[#EE2C34]">
        {timer > 0 ? (
          <span>Отправить новое письмо через 00:{timer.toString().padStart(2, '0')}</span>
        ) : (
          <button onClick={() => setTimer(30)} className="hover:underline font-medium">
            Отправить код повторно
          </button>
        )}
      </div>
    </div>
  );
};

