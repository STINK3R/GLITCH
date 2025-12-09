import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../useAuth";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  /**
   * Обработка отправки формы регистрации
   * @param {Event} e
   */
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await register(email, password);
      navigate("/login");
    } catch (e) {
      setErr(e.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 bg-white rounded-lg shadow p-6">
        <p className="text-[13px] color=[#828282]">Умный контроль вашего рациона</p>
        {/*<div className="">*/}
        {/*  */}
        {/*</div>*/}
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
              className="w-full bg-[#EFEFEF] rounded-[20px] px-5 py-3 focus:text-[#171717]"
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
              className="w-full bg-[#EFEFEF] rounded-[20px] px-5 py-3 focus:text-[#171717]"
              placeholder="Введите ваш пароль (мин. 8 символов)"
          />
        </div>
        <button
            disabled={loading}
            type="submit"
            className="w-full mt-[20px] rounded-[20px] bg-[#EE2C34]  text-white py-3 disabled:opacity-60"
        >
          {loading ? "Вход..." : "Далее"}
        </button>
        <div className="text-sm text-center mt-[35px]">
          <div className="text-[13px] color-[#828282] weight-400 ">Продолжая, вы соглашаетесь с <a underline className="decoration-dashed text-[var(--main-color)] ">
            нашими Условиями использования</a> и <a className="underline text-[var(--main-color)] ">Политикой конфиденциальности</a></div>
        </div>
      </form>
    </div>
  );
};
