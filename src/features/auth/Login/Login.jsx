import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";
import { AuthInput } from "../../../components/ui/AuthInput";
import { AuthButton } from "../../../components/ui/AuthButton";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      console.error(e);
      setErr("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  const ToggleIcon = ({ visible, onClick }) => (
    <button type="button" onClick={onClick} className="focus:outline-none">
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

  return (
    <AuthLayout>
      <div className="animate-fade-in">
        {/* Toggle */}
        <div className="bg-[#F5F5F5] p-1 rounded-2xl flex mb-6">
          <button
            className="flex-1 py-2.5 text-sm font-medium bg-white shadow-sm rounded-xl text-neutral-900 transition-all"
          >
            Вход
          </button>
          <button
            onClick={() => navigate("/register")}
            className="flex-1 py-2.5 text-sm font-medium text-neutral-500 rounded-xl transition-all"
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            placeholder="Введите ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          
          <AuthInput
            label="Пароль"
            placeholder="Введите ваш пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            required
            rightElement={<ToggleIcon visible={showPassword} onClick={() => setShowPassword(!showPassword)} />}
          />

          <div className="flex justify-end">
            <Link to="/recovery" className="text-sm text-neutral-500 hover:text-neutral-900">
              Забыли пароль?
            </Link>
          </div>

          {err && <div className="text-red-500 text-sm text-center">{err}</div>}

          <AuthButton type="submit" disabled={loading} className="mt-2">
            {loading ? "Вход..." : "Войти"}
          </AuthButton>

          <p className="text-xs text-center text-neutral-400 mt-4 leading-relaxed px-4">
            Продолжая, вы соглашаетесь с <Link to="/terms" className="text-[#EE2C34] hover:underline">нашими Условиями использования</Link> и <Link to="/privacy" className="text-[#EE2C34] hover:underline">Политикой конфиденциальности</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};
