import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";
import { CredentialsStep } from "./steps/CredentialsStep";
import { VerificationStep } from "./steps/VerificationStep";
import { DetailsStep } from "./steps/DetailsStep";

export const Register = () => {
  const { sendRegisterCode, verifyCode } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: Credentials, 1: Details, 2: Verification
  // ВАЖНО: Мы изменили порядок шагов, но нумерацию оставим логической:
  // Step 0: Ввод Email/Pass -> Сразу переход к Details (визуально)
  // Step 1: Ввод Details -> Отправка API -> Переход к Verification
  // Step 2: Verification -> Конец

  // Однако, текущий UI: 0=Credentials, 1=Verification, 2=Details
  // Нам нужно: 0=Credentials -> (Save) -> 1=Details -> (API Request) -> 2=Verification -> (API Confirm) -> Login

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    surname: "",
    patronymic: "",
  });

  // Шаг 1: Email + Pass (CredentialsStep)
  const handleCredentialsSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Просто переходим к заполнению профиля, не отправляя запрос
    setStep(2); // Переходим к DetailsStep (который у нас был под индексом 2)
  };

  // Шаг 2: Details (DetailsStep)
  // В рендере DetailsStep сейчас вызывается onNext
  const handleDetailsSubmit = async (details) => {
    // Собираем все данные
    const fullData = {
      ...formData,
      ...details,
      // API требует father_name
      patronymic: details.patronymic || "Нет"
    };
    setFormData(fullData);

    setLoading(true);
    setError("");
    try {
      // Отправляем запрос /register/request
      await sendRegisterCode(fullData);
      // Если успешно, переходим к верификации
      setStep(1); // Переходим к VerificationStep (индекс 1)
    } catch (e) {
      let msg = "Ошибка регистрации";
      if (e.message && e.message.includes("422")) {
        msg = "Ошибка валидации данных (проверьте формат)";
      }
      setError(msg);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Шаг 3: Verification (VerificationStep)
  const handleVerificationSubmit = async (code) => {
    setLoading(true);
    setError("");
    try {
      // Отправляем запрос /register/confirm
      await verifyCode(formData.email, code);
      navigate("/login");
    } catch (e) {
      alert(e.message || "Неверный код");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Логика назад зависит от текущего шага
    if (step === 2) setStep(0); // Из Details в Credentials
    else if (step === 1) setStep(2); // Из Verification в Details
    else navigate(-1);
  };

  return (
    <AuthLayout
      showBack={step > 0}
      onBack={handleBack}
    >
      {step === 0 && (
        <CredentialsStep
          onNext={handleCredentialsSubmit}
          loading={loading}
          error={error}
        />
      )}

      {step === 2 && (
        <DetailsStep
          onNext={handleDetailsSubmit}
          loading={loading}
        />
      )}

      {step === 1 && (
        <VerificationStep
          email={formData.email}
          onNext={handleVerificationSubmit}
          loading={loading}
        />
      )}
    </AuthLayout>
  );
};
