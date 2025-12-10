import React, { useState, useEffect } from "react";
import { CodeInput } from "../../../../components/ui/CodeInput";

export const VerificationStep = ({ email, onNext, onResend, loading }) => {
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

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60);
      onResend?.();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in text-center">
      <h2 className="text-2xl font-bold mb-3">Проверьте вашу почту</h2>
      <p className="text-neutral-400 text-sm mb-10 px-4 leading-relaxed">
        Перейдите по ссылке или введите код<br />в формате xxx-xxx
      </p>

      <div className="mb-12">
        <CodeInput length={6} onComplete={handleComplete} />
      </div>

      <div className="text-sm">
        {timer > 0 ? (
          <span className="text-[#EE2C34]">
            Отправить новое письмо через {formatTime(timer)}
          </span>
        ) : (
          <button 
            onClick={handleResend} 
            className="text-[#EE2C34] hover:underline font-medium transition-colors"
          >
            Отправить код повторно
          </button>
        )}
      </div>
    </div>
  );
};
