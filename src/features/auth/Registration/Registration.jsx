import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";
import { CredentialsStep } from "./steps/CredentialsStep";
import { VerificationStep } from "./steps/VerificationStep";
import { DetailsStep } from "./steps/DetailsStep";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    surname: "",
    patronymic: "",
  });

  const handleCredentialsSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Simulate API call to send code
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(1);
    }, 1000);
  };

  const handleVerificationSubmit = (code) => {
    // Simulate verification
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        setStep(2);
    }, 1000);
  };

  const handleDetailsSubmit = async (details) => {
    setLoading(true);
    setError("");
    try {
      // Final registration
      // We combine all data. 
      // Note: The actual API might only accept email/password as per previous conversation.
      // But for this task we assume we send what we can or just register basic and mock the rest.
      
      const fullData = { ...formData, ...details };
      await register(fullData.email, fullData.password);
      
      // If there was a profile update endpoint, we would call it here:
      // await updateProfile({ name: fullData.name, ... });
      
      navigate("/login");
    } catch (e) {
      setError(e.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else navigate(-1);
  };

  return (
    <AuthLayout 
      showBack={step > 0} 
      onBack={handleBack}
    >
      {step === 0 && (
        <CredentialsStep 
          onNext={handleCredentialsSubmit} 
          loading={loading} 
          error={error} 
        />
      )}
      
      {step === 1 && (
        <VerificationStep 
          email={formData.email} 
          onNext={handleVerificationSubmit} 
          loading={loading} 
        />
      )}
      
      {step === 2 && (
        <DetailsStep 
          onNext={handleDetailsSubmit} 
          loading={loading} 
        />
      )}
    </AuthLayout>
  );
};
