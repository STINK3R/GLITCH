import React, { useState } from "react";
import { AuthInput } from "../../../../components/ui/AuthInput";
import { AuthButton } from "../../../../components/ui/AuthButton";

export const EmailStep = ({ onNext, loading }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) setError("Пустое поле");
    else if (!/\S+@\S+\.\S+/.test(email)) setError("Некорректный email");
    else onNext(email);
  };

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          placeholder="Ваш email для восстановления"
          value={email}
          onChange={(e) => {
              setEmail(e.target.value);
              setError("");
          }}
          error={error}
        />
        
        <AuthButton type="submit" disabled={loading} className="mt-6">
          Отправить код
        </AuthButton>
      </form>
    </div>
  );
};

