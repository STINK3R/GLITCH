import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthInput } from "../../../../components/ui/AuthInput";
import { AuthButton } from "../../../../components/ui/AuthButton";

export const CredentialsStep = ({ onNext, loading, error }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Пустое поле";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Некорректный email";

    if (!formData.password) newErrors.password = "Пустое поле";
    else if (formData.password.length < 8) newErrors.password = "Пароль должен быть не менее 8 символов";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Toggle */}
      <div className="bg-[#F5F5F5] p-1 rounded-2xl flex mb-6">
        <button
          onClick={() => navigate("/login")}
          className="flex-1 py-2.5 text-sm font-medium text-neutral-500 rounded-xl transition-all"
        >
          Вход
        </button>
        <button
          className="flex-1 py-2.5 text-sm font-medium bg-white shadow-sm rounded-xl text-neutral-900 transition-all"
        >
          Регистрация
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          placeholder="Введите ваш email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />
        
        <AuthInput
          label="Пароль"
          type="password"
          placeholder="Введите ваш пароль (мин. 8 символов)"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
        />

        <AuthInput
          label="Подтвердить пароль"
          type="password"
          placeholder="Должен совпадать с основным паролем"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
        />

        {error && <div className="text-red-500 text-sm text-center">{error}</div>}

        <AuthButton type="submit" disabled={loading} className="mt-4">
            Далее
        </AuthButton>

        <p className="text-xs text-center text-neutral-400 mt-4 leading-relaxed px-4">
          Продолжая, вы соглашаетесь с <Link to="/terms" className="text-[#EE2C34] hover:underline">нашими Условиями использования</Link> и <Link to="/privacy" className="text-[#EE2C34] hover:underline">Политикой конфиденциальности</Link>
        </p>
      </form>
    </div>
  );
};

