import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../AuthLayout";
import { EmailStep } from "./steps/EmailStep";
import { VerificationStep } from "../Registration/steps/VerificationStep";
import { NewPasswordStep } from "./steps/NewPasswordStep";

export const PasswordRecovery = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    const handleEmailSubmit = (emailData) => {
        setEmail(emailData);
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setStep(1);
        }, 1000);
    };

    const handleVerificationSubmit = (code) => {
        setLoading(true);
        // Simulate verification
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1000);
    };

    const handlePasswordSubmit = (password) => {
        setLoading(true);
        // Simulate password reset
        setTimeout(() => {
            setLoading(false);
            navigate("/login");
        }, 1000);
    };

    const handleBack = () => {
        if (step > 0) setStep((s) => s - 1);
        else navigate(-1);
    };

    const getTitle = () => {
        if (step === 0) return "Восстановить пароль";
        if (step === 1) return ""; // Title inside component
        if (step === 2) return "Восстановление пароля";
        return "";
    };

    const getSubtitle = () => {
        if (step === 0) return "Мы отправим на вашу почту письмо для восстановления доступа";
        return "";
    };

    return (
        <AuthLayout
            showBack={true}
            onBack={handleBack}
            title={getTitle()}
            subtitle={getSubtitle()}
        >
            {step === 0 && (
                <EmailStep
                    onNext={handleEmailSubmit}
                    loading={loading}
                />
            )}

            {step === 1 && (
                <VerificationStep
                    email={email}
                    onNext={handleVerificationSubmit}
                    loading={loading}
                />
            )}

            {step === 2 && (
                <NewPasswordStep
                    onNext={handlePasswordSubmit}
                    loading={loading}
                />
            )}
        </AuthLayout>
    );
};

