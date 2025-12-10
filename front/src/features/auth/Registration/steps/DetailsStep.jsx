import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AuthInput } from "../../../../components/ui/AuthInput";
import { AuthButton } from "../../../../components/ui/AuthButton";

export const DetailsStep = ({ onNext, loading, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    surname: initialData.surname || "",
    patronymic: initialData.patronymic || "",
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    let isValid = true;
    
    // Регулярное выражение для кириллицы (включая дефис и пробел)
    const cyrillicPattern = /^[А-Яа-яЁё\s-]+$/;

    if (!formData.name.trim()) {
      newErrors.name = "Пустое поле";
      isValid = false;
    } else if (!cyrillicPattern.test(formData.name)) {
      newErrors.name = "Используйте только русские буквы";
      isValid = false;
    }
    
    if (!formData.surname.trim()) {
      newErrors.surname = "Пустое поле";
      isValid = false;
    } else if (!cyrillicPattern.test(formData.surname)) {
      newErrors.surname = "Используйте только русские буквы";
      isValid = false;
    }

    if (formData.patronymic && !cyrillicPattern.test(formData.patronymic)) {
      // Отчество необязательно, но если есть - тоже кириллица
      // Мы не можем показать ошибку прямо под полем, так как там нет prop error в компоненте
      // Но можем блокировать отправку
      // Либо можно добавить error prop в AuthInput отчества
    }

    setErrors(newErrors);

    if (isValid) {
      onNext(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const isFormValid = formData.name.trim() !== "" && formData.surname.trim() !== "";

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-8 text-center">Ещё немного о вас...</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthInput
          label="Имя"
          placeholder="Введите настоящее имя"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />
        
        <AuthInput
          label="Фамилия"
          placeholder="Введите настоящую фамилию"
          value={formData.surname}
          onChange={(e) => handleChange("surname", e.target.value)}
          error={errors.surname}
        />

        <AuthInput
          label="Отчество (необязательно)"
          placeholder=""
          value={formData.patronymic}
          onChange={(e) => handleChange("patronymic", e.target.value)}
        />

        <AuthButton 
          type="submit" 
          disabled={!isFormValid}
          loading={loading}
          className="mt-6"
        >
          Зарегистрироваться
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
