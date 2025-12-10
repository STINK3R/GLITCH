import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";
import { EmailStep } from "./steps/EmailStep";
import { EmailSentStep } from "./steps/EmailSentStep";
import { useToast } from "../../../components/ui/Toast";

/**
 * Страница восстановления пароля
 * Шаг 1: Ввод email
 * Шаг 2: Уведомление об отправке письма (с кнопкой повторной отправки)
 */
export const PasswordRecovery = () => {
  const { sendRecoveryCode } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState("forward");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleEmailSubmit = async (emailData) => {
    setEmail(emailData);
    setLoading(true);
    setEmailError(null);
    try {
      await sendRecoveryCode(emailData);
      setTimer(38);
      setDirection("forward");
      setStep(1);
    } catch (e) {
      const errorMessage = e.message || "Ошибка отправки письма";
      
      if (errorMessage.toLowerCase().includes("not found") || 
          errorMessage.toLowerCase().includes("email") ||
          errorMessage.toLowerCase().includes("user")) {
        setEmailError("Пользователь не найден");
      } else {
        setEmailError("Ошибка отправки");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    try {
      await sendRecoveryCode(email);
      setTimer(38);
      toast.info("Письмо отправлено повторно");
    } catch (e) {
      toast.error("Ошибка повторной отправки");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setDirection("back");
    if (step > 0) setStep(0);
    else navigate(-1);
  };

  const getAnimationClass = () => {
    return direction === "forward" ? "animate-step-in" : "animate-step-back";
  };

  const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (name.length <= 4) {
      return `${name[0]}***@${domain}`;
    }
    return `${name.slice(0, 2)}${"*".repeat(Math.min(10, name.length - 4))}${name.slice(-2)}@${domain}`;
  };

  return (
    <AuthLayout
      showBack={true}
      onBack={handleBack}
      hideLogo={true}
    >
      {step === 0 && (
        <div className={getAnimationClass()}>
          <h2 className="text-2xl font-bold mb-2 text-center">Восстановить пароль</h2>
          <p className="text-neutral-400 text-sm text-center mb-8">
            Мы отправим на вашу почту письмо<br />для восстановления доступа
          </p>
          <EmailStep
            onNext={handleEmailSubmit}
            loading={loading}
            emailError={emailError}
          />
        </div>
      )}

      {step === 1 && (
        <div className={getAnimationClass()}>
          <EmailSentStep
            email={email}
            maskedEmail={maskEmail(email)}
            timer={timer}
            loading={loading}
            onResend={handleResend}
          />
        </div>
      )}
    </AuthLayout>
  );
};
