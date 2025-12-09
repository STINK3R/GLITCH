import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";
import { AuthInput } from "../../../components/ui/AuthInput";
import { AuthButton } from "../../../components/ui/AuthButton";

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
    }
    
    setLoading(true);
    setError("");
    try {
        // Передаем null вместо email, если API полагается только на code
        // Или если code самодостаточен. В useAuth.js resetPassword(email, code, password)
        // Если email обязателен, то ссылка должна содержать и email, или code содержит его в зашифрованном виде
        await resetPassword(null, code, password);
        navigate("/login");
    } catch (e) {
        setError(e.message || "Ошибка сброса пароля");
    } finally {
        setLoading(false);
    }
  };

  if (!code) {
      return (
          <AuthLayout>
              <div className="text-center text-red-500">
                  Неверная ссылка для восстановления пароля.
              </div>
          </AuthLayout>
      );
  }

  return (
    <AuthLayout title="Новый пароль">
      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
        <AuthInput
            label="Новый пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        <AuthInput
            label="Подтверждение пароля"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
        />
        
        {error && <div className="text-sm text-red-600 text-center">{error}</div>}
        
        <AuthButton type="submit" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить новый пароль"}
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

