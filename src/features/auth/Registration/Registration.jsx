import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";
import { CredentialsStep } from "./steps/CredentialsStep";
import { VerificationStep } from "./steps/VerificationStep";
import { DetailsStep } from "./steps/DetailsStep";

export const Register = () => {
  const { register, sendRegisterCode, verifyCode } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
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

  const handleCredentialsSubmit = async (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setLoading(true);
    setError("");
    try {
      // Выполняем реальную регистрацию на первом шаге,
      // чтобы бэкенд отправил письмо с подтверждением.
      const fullData = {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword
      };

      await register(fullData);

      // Если регистрация успешна, переходим к шагу подтверждения (или просто уведомляем)
      setStep(1);
    } catch (e) {
      let msg = "Ошибка регистрации";
      if (e.message && e.message.includes("detail")) {
        msg = "Пользователь с таким email уже существует или данные некорректны";
      }
      setError(msg);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (code) => {
    setLoading(true);
    setError("");
    try {
      // Так как API не предоставляет отдельного метода для проверки кода
      // (верификация идет по ссылке из письма), мы здесь просто симулируем проверку
      // для UI флоу, либо можно убрать этот шаг, если он не нужен.
      // Но по дизайну он есть.
      await new Promise(r => setTimeout(r, 1000));
      setStep(2);
    } catch (e) {
      alert(e.message || "Неверный код");
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsSubmit = async (details) => {
    setLoading(true);
    setError("");
    try {
      // Данные о пользователе (Имя, Фамилия) пока просто сохраняем или пропускаем,
      // так как основной запрос регистрации уже прошел.
      // Если появится API профиля, вызовем его здесь.
      // await updateProfile(details);

      navigate("/login");
    } catch (e) {
      setError(e.message || "Ошибка сохранения данных");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
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

      {step === 1 && (
        <VerificationStep
          email={formData.email}
          onNext={handleVerificationSubmit}
          loading={loading}
        />
      )}

      {step === 2 && (
        <DetailsStep
          onNext={handleDetailsSubmit}
          loading={loading}
        />
      )}
    </AuthLayout>
  );
};
