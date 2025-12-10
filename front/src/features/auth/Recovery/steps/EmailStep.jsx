import React, { useState, useEffect } from "react";
import { AuthInput } from "../../../../components/ui/AuthInput";
import { AuthButton } from "../../../../components/ui/AuthButton";

export const EmailStep = ({ onNext, loading, emailError }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (emailError) {
      setError(emailError);
    }
  }, [emailError]);

  // Валидация email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Пустое поле");
      return;
    }
    
    if (!isValidEmail(email)) {
      setError("Некорректный email");
      return;
    }
    
    onNext(email);
  };

  const isFormValid = email.trim() !== "";

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthInput
          label="Email"
          placeholder="Ваш email для восстановления"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          type="email"
          error={error}
        />
        
        <AuthButton 
          type="submit" 
          disabled={!isFormValid}
          loading={loading}
          className="mt-6"
        >
          Отправить код
        </AuthButton>
      </form>
    </div>
  );
};
