import React, { useState } from "react";
import { AuthInput } from "../../../../components/ui/AuthInput";
import { AuthButton } from "../../../../components/ui/AuthButton";

export const NewPasswordStep = ({ onNext, loading }) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
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
      onNext(formData.password);
    }
  };

  const ToggleIcon = ({ visible, onClick }) => (
    <button 
      type="button" 
      onClick={onClick} 
      className="focus:outline-none text-neutral-400 hover:text-neutral-600 transition-colors"
    >
      {visible ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )}
    </button>
  );

  const isFormValid = formData.password.trim() !== "" && formData.confirmPassword.trim() !== "";

  return (
    <div className="animate-fade-in">
      <p className="text-center text-neutral-400 text-sm mb-8">
        Придумайте новый пароль и подтвердите его
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Пароль"
          type={showPassword ? "text" : "password"}
          placeholder="Введите новый пароль (мин. 8 символов)"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          rightElement={<ToggleIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />}
        />
        
        <AuthInput
          label="Подтвердить пароль"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Повторите новый пароль"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          rightElement={<ToggleIcon visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
        />

        <AuthButton 
          type="submit" 
          disabled={!isFormValid}
          loading={loading}
          className="mt-6"
        >
          Подтвердить
        </AuthButton>
      </form>
    </div>
  );
};
