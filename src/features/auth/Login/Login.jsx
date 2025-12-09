import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../useAuth";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  /**
   * Обработка отправки формы входа
   * @param {Event} e
   */
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      setErr(e.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-semibold">Вход в систему</h1>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div className="space-y-1.5">
          <label className="block text-sm">Email</label>
          <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full bg-[#EFEFEF] rounded-[20px] px-5 py-3 focus:[#171717]"
              placeholder="you@example.com"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm">Пароль</label>
          <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="w-full bg-[#EFEFEF] rounded-[20px] px-5 py-3 focus:[#171717]"
              placeholder="Введите ваш пароль (мин. 8 символов)"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm">Подтвердить пароль</label>
          <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full bg-[#EFEFEF] rounded-[20px] px-5 py-3 focus:[#171717]"
              placeholder="Введите ваш пароль (мин. 8 символов)"
          />
        </div>
        <button
            disabled={loading}
            type="submit"
            className="w-full rounded-md bg-[#3A7AFE] text-white text-white py-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Вход..." : "Далее"}
        </button>
        <div className="text-sm text-center">
        <Link to="/register" className="text-blue-600 hover:underline"></Link>
        </div>

        <div>Продолжая, вы соглашаетесь с нашими Условиями использования и Политикой конфиденциальности</div>
      </form>
    </div>
  );
};
