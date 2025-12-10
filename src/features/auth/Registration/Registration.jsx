import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";
import { CredentialsStep } from "./steps/CredentialsStep";
import { VerificationStep } from "./steps/VerificationStep";
import { DetailsStep } from "./steps/DetailsStep";
import { useToast } from "../../../components/ui/Toast";

// Ключи для сохранения данных
const SHARED_EMAIL_KEY = "auth_shared_email";
const REG_DATA_KEY = "auth_reg_data";

export const Register = () => {
  const { sendRegisterCode, verifyCode, login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0); // 0: Credentials, 2: Details, 1: Verification
  const [direction, setDirection] = useState("forward"); // forward или back для анимации

  const [loading, setLoading] = useState(false);
  const [credentialsError, setCredentialsError] = useState(null); // Ошибка для поля email

  // Восстанавливаем данные из sessionStorage
  const [formData, setFormData] = useState(() => {
    const savedData = sessionStorage.getItem(REG_DATA_KEY);
    const savedEmail = sessionStorage.getItem(SHARED_EMAIL_KEY);
    
    if (savedData) {
      return JSON.parse(savedData);
    }
    
    return {
      email: savedEmail || "",
      password: "",
      confirmPassword: "",
      name: "",
      surname: "",
      patronymic: "",
    };
  });

  // Сохраняем данные при изменении
  useEffect(() => {
    sessionStorage.setItem(REG_DATA_KEY, JSON.stringify(formData));
    sessionStorage.setItem(SHARED_EMAIL_KEY, formData.email);
  }, [formData]);

  // Шаг 1: Email + Pass (CredentialsStep)
  const handleCredentialsSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCredentialsError(null);
    setDirection("forward");
    setStep(2);
  };

  // Шаг 2: Details (DetailsStep)
  const handleDetailsSubmit = async (details) => {
    const fullData = {
      ...formData,
      ...details,
      patronymic: details.patronymic || "Нет"
    };
    setFormData(fullData);

    setLoading(true);
    try {
      await sendRegisterCode(fullData);
      setDirection("forward");
      setStep(1);
    } catch (e) {
      console.error(e);
      const errorMessage = e.message || "Ошибка регистрации";
      
      if (errorMessage.toLowerCase().includes("email already exists") || 
          errorMessage.toLowerCase().includes("email")) {
        // Возвращаемся на первый шаг и показываем ошибку
        setCredentialsError("Этот email уже зарегистрирован");
        setStep(0);
      } else {
        // Показываем общую ошибку через toast
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Шаг 3: Verification (VerificationStep)
  const handleVerificationSubmit = async (code) => {
    setLoading(true);
    try {
      await verifyCode(formData.email, code);
      
      // Очищаем сохранённые данные
      sessionStorage.removeItem(REG_DATA_KEY);
      sessionStorage.removeItem(SHARED_EMAIL_KEY);
      
      try {
        await login(formData.email, formData.password);
        toast.success("Регистрация успешна!");
        navigate("/events");
      } catch (loginError) {
        // Даже если автологин не удался, перенаправляем на события
        // Пользователь сможет войти позже
        toast.success("Регистрация завершена!");
        navigate("/events");
      }
    } catch (e) {
      toast.error("Неверный код подтверждения");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCredentialsError(null);
    setDirection("back");
    if (step === 2) setStep(0);
    else if (step === 1) setStep(2);
    else navigate(-1);
  };

  // Получаем класс анимации в зависимости от направления
  const getAnimationClass = () => {
    return direction === "forward" ? "animate-step-in" : "animate-step-back";
  };

  return (
    <AuthLayout
      showBack={step > 0}
      onBack={handleBack}
      hideLogo={step === 1}
    >
      {step === 0 && (
        <div key="step-0" className={getAnimationClass()}>
          <CredentialsStep
            onNext={handleCredentialsSubmit}
            loading={loading}
            emailError={credentialsError}
            initialData={{
              email: formData.email,
              password: formData.password,
              confirmPassword: formData.confirmPassword,
            }}
          />
        </div>
      )}

      {step === 2 && (
        <div key="step-2" className={getAnimationClass()}>
          <DetailsStep
            onNext={handleDetailsSubmit}
            loading={loading}
            initialData={{
              name: formData.name,
              surname: formData.surname,
              patronymic: formData.patronymic,
            }}
          />
        </div>
      )}

      {step === 1 && (
        <div key="step-1" className={getAnimationClass()}>
          <VerificationStep
            email={formData.email}
            onNext={handleVerificationSubmit}
            loading={loading}
          />
        </div>
      )}
    </AuthLayout>
  );
};
