import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";
import { AuthInput } from "../../../components/ui/AuthInput";
import { AuthButton } from "../../../components/ui/AuthButton";
import { useToast } from "../../../components/ui/Toast";

/**
 * Страница установки нового пароля (по ссылке из письма)
 * URL формат: /reset-password?token=eyJhbGciOiJI...
 */
export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const toast = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isInvalidToken, setIsInvalidToken] = useState(!token);

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    if (!password) {
      newErrors.password = "Пустое поле";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Минимум 8 символов";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Пустое поле";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      await resetPassword(token, password, password);
      toast.info("Успешный сброс пароля. Выполните повторный вход, используя новый пароль.");
      navigate("/login");
    } catch (e) {
      console.error("Reset password error:", e);
      const errorMessage = e?.message || "";
      if (errorMessage.toLowerCase().includes("token") || 
          errorMessage.toLowerCase().includes("expired") || 
          errorMessage.toLowerCase().includes("invalid")) {
        setIsInvalidToken(true);
      } else {
        setErrors({ password: "Ошибка сброса пароля" });
      }
    } finally {
      setLoading(false);
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

  const handleChange = (field, value) => {
    if (field === "password") {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const isFormValid = password.trim() !== "" && confirmPassword.trim() !== "";

  if (isInvalidToken) {
    return (
      <AuthLayout showBack onBack={() => navigate("/login")}>
        <div className="animate-fade-in text-center pt-8">
          <h2 className="text-2xl font-bold mb-3">Ссылка недействительна</h2>
          <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
            Похоже, вы перешли по устаревшей или уже<br />
            использованной ссылке.
          </p>

          <AuthButton onClick={() => navigate("/recovery")}>
            Отправить новое письмо
          </AuthButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showBack onBack={() => navigate("/login")}>
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-center">Восстановление пароля</h2>
        <p className="text-neutral-400 text-sm text-center mb-8">
          Придумайте новый пароль и подтвердите его
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <AuthInput
            label="Пароль"
            type={showPassword ? "text" : "password"}
            placeholder="Введите новый пароль"
            value={password}
            onChange={(e) => handleChange("password", e.target.value)}
            error={errors.password}
            rightElement={<ToggleIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />}
          />
          
          <AuthInput
            label="Подтвердить пароль"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
            rightElement={<ToggleIcon visible={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)} />}
          />

          <AuthButton 
            type="submit" 
            disabled={!isFormValid}
            loading={loading}
            className="mt-4"
          >
            Подтвердить
          </AuthButton>
        </form>
      </div>
    </AuthLayout>
  );
};
