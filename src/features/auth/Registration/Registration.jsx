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
        navigate("/");
      } catch (loginError) {
        toast.info("Регистрация завершена. Войдите в систему.");
        navigate("/login");
      }
    } catch (e) {
      toast.error("Неверный код подтверждения");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCredentialsError(null);
    if (step === 2) setStep(0);
    else if (step === 1) setStep(2);
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
          emailError={credentialsError}
          initialData={{
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
          }}
        />
      )}

      {step === 2 && (
        <DetailsStep
          onNext={handleDetailsSubmit}
          loading={loading}
          initialData={{
            name: formData.name,
            surname: formData.surname,
            patronymic: formData.patronymic,
          }}
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
