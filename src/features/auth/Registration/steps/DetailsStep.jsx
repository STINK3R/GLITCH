import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthInput } from "../../../../components/ui/AuthInput";
import { AuthButton } from "../../../../components/ui/AuthButton";

export const DetailsStep = ({ onNext, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    patronymic: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple validation
    if (formData.name && formData.surname) {
      onNext(formData);
    }
  };

  return (
    <div className="animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-center">Ещё немного о вас...</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Имя"
          placeholder="Введите настоящее имя"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        
        <AuthInput
          label="Фамилия"
          placeholder="Введите настоящую фамилию"
          value={formData.surname}
          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
          required
        />

        <AuthInput
          label="Отчество (необязательно)"
          placeholder="Введите отчество"
          value={formData.patronymic}
          onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })}
        />

        <AuthButton type="submit" disabled={loading} className="mt-6">
          Зарегистрироваться
        </AuthButton>

        <p className="text-xs text-center text-neutral-400 mt-4 leading-relaxed px-4">
            Продолжая, вы соглашаетесь с <Link to="/terms" className="text-[#EE2C34] hover:underline">нашими Условиями использования</Link> и <Link to="/privacy" className="text-[#EE2C34] hover:underline">Политикой конфиденциальности</Link>
        </p>
      </form>
    </div>
  );
};


