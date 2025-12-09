import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthInput } from "../../../../components/ui/AuthInput";
import { AuthButton } from "../../../../components/ui/AuthButton";

// Ключ для сохранения email между страницами
const SHARED_EMAIL_KEY = "auth_shared_email";

export const CredentialsStep = ({ onNext, loading, emailError, initialData = {} }) => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: initialData.email || "",
    password: initialData.password || "",
    confirmPassword: initialData.confirmPassword || "",
  });
  
  const [errors, setErrors] = useState({});

  // Устанавливаем ошибку email из пропсов
  useEffect(() => {
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
    }
  }, [emailError]);

  // Сохраняем email при изменении
  useEffect(() => {
    sessionStorage.setItem(SHARED_EMAIL_KEY, formData.email);
  }, [formData.email]);

  // Валидация email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Пустое поле";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Некорректный email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Пустое поле";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Минимум 8 символов";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Пустое поле";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Сбрасываем ошибку при изменении поля
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleNavigateToLogin = () => {
    // Email уже сохранён в sessionStorage
    navigate("/login");
  };

  const isFormValid = 
    formData.email.trim() !== "" && 
    formData.password.trim() !== "" && 
    formData.confirmPassword.trim() !== "";

  return (
    <div className="animate-fade-in">
      {/* Toggle Вход / Регистрация */}
      <div className="bg-[#F5F5F5] p-1 rounded-xl flex mb-8">
        <button
          type="button"
          onClick={handleNavigateToLogin}
          className="flex-1 py-2.5 text-sm font-medium text-neutral-400 rounded-lg transition-all hover:text-neutral-600"
        >
          Вход
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 text-sm font-medium bg-white shadow-sm rounded-lg text-neutral-900 transition-all"
        >
          Регистрация
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthInput
          label="Email"
          placeholder="Введите ваш email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          type="email"
          error={errors.email}
        />
        
        <AuthInput
          label="Пароль"
          type="password"
          placeholder="Введите ваш пароль (мин. 8 символов)"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />

        <AuthInput
          label="Подтвердить пароль"
          type="password"
          placeholder="Должен совпадать с основным паролем"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />

        <AuthButton 
          type="submit" 
          disabled={!isFormValid}
          loading={loading}
          className="mt-4"
        >
          Далее
        </AuthButton>

        <p className="text-xs text-center text-neutral-400 mt-6 leading-relaxed px-2">
          Продолжая, вы соглашаетесь с{" "}
          <Link to="/terms" className="text-[#EE2C34] hover:underline">
            нашими Условиями использования
          </Link>{" "}
          и{" "}
          <Link to="/privacy" className="text-[#EE2C34] hover:underline">
            Политикой конфиденциальности
          </Link>
        </p>
      </form>
    </div>
  );
};
