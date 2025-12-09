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
      // Имитация отправки кода (API не поддерживает реальную отправку)
      await sendRegisterCode(data.email);
      setStep(1);
    } catch (e) {
      setError(e.message || "Ошибка отправки кода. Проверьте email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (code) => {
    setLoading(true);
    setError("");
    try {
      // Имитация проверки кода
      await verifyCode(formData.email, code);
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
      // Вызываем реальный endpoint регистрации
      // Игнорируем details (Имя, Фамилия) так как API их не принимает
      // Передаем email (как username), пароль и подтверждение пароля
      const fullData = { 
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
      
      await register(fullData);
      
      // Можно сохранить имя/фамилию в локальное хранилище или сделать апдейт профиля, если будет API
      // localStorage.setItem('temp_user_details', JSON.stringify(details));
      
      navigate("/login");
    } catch (e) {
      // Обработка ошибок валидации от API (422)
      // Если придет массив ошибок detail
      let msg = "Ошибка регистрации";
      if (e.message && e.message.includes("detail")) {
          msg = "Ошибка валидации данных";
      }
      setError(msg);
      console.error(e);
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
