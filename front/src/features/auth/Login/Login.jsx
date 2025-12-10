import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../useAuth";
import { useAuthStore, USER_ROLES } from "../AuthStore";
import { AuthLayout } from "../AuthLayout";
import { AuthInput } from "../../../components/ui/AuthInput";
import { AuthButton } from "../../../components/ui/AuthButton";

// Ключ для сохранения email между страницами
const SHARED_EMAIL_KEY = "auth_shared_email";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Восстанавливаем email из sessionStorage
  const [email, setEmail] = useState(() => {
    return sessionStorage.getItem(SHARED_EMAIL_KEY) || "";
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Сохраняем email при изменении
  useEffect(() => {
    sessionStorage.setItem(SHARED_EMAIL_KEY, email);
  }, [email]);

  // Валидация email
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем формат email перед отправкой
    if (!isValidEmail(email)) {
      setErrors({ email: "Некорректный email" });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      await login(email, password);
      // Очищаем сохранённый email после успешного входа
      sessionStorage.removeItem(SHARED_EMAIL_KEY);
      
      // Проверяем роль пользователя и перенаправляем
      const user = useAuthStore.getState().user;
      if (user?.role === USER_ROLES.ADMIN) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (e) {
      console.error(e);
      // Показываем ошибку над полями
      setErrors({ 
        email: "Неверный email или пароль", 
        password: true 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    // Email уже сохранён в sessionStorage
    navigate("/register");
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

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <AuthLayout>
      <div className="animate-fade-in">
        {/* Toggle Вход / Регистрация */}
        <div className="bg-[#F5F5F5] p-1 rounded-[20px] flex mb-8">
          <button
            type="button"
            className="flex-1 h-12 flex items-center justify-center text-sm font-medium bg-[#E3E3E3] rounded-[20px] text-neutral-900 transition-all"
          >
            Вход
          </button>
          <button
            type="button"
            onClick={handleNavigateToRegister}
            className="flex-1 h-12 flex items-center justify-center text-sm font-medium text-neutral-500 rounded-[20px] transition-all hover:text-neutral-700"
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <AuthInput
            label="Email"
            placeholder="Введите ваш email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({});
            }}
            type="email"
            error={errors.email}
          />
          
          <div>
            <AuthInput
              label="Пароль"
              placeholder="Введите ваш пароль"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({});
              }}
              type={showPassword ? "text" : "password"}
              error={errors.password}
              rightElement={<ToggleIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />}
            />
            <div className="flex justify-end mt-2">
              <Link to="/recovery" className="text-sm text-[#EE2C34] hover:text-[#D42930] transition-colors">
                Забыли пароль?
              </Link>
            </div>
          </div>

          <AuthButton 
            type="submit" 
            disabled={!isFormValid}
            loading={loading}
            className="mt-4"
          >
            Войти
          </AuthButton>

          <p className="text-xs text-center text-neutral-400 mt-6 leading-relaxed px-2">
            Продолжая, вы соглашаетесь с{" "}
            <Link to="/terms" className="text-[#EE2C34] hover:text-[#D42930] transition-colors duration-300">
              нашими Условиями использования
            </Link>{" "}
            и{" "}
            <Link to="/privacy" className="text-[#EE2C34] hover:text-[#D42930] transition-colors duration-300">
              Политикой конфиденциальности
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};
