import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import { AuthLayout } from "../AuthLayout";
import { EmailStep } from "./steps/EmailStep";
import { VerificationStep } from "../Registration/steps/VerificationStep";
import { NewPasswordStep } from "./steps/NewPasswordStep";

export const PasswordRecovery = () => {
    const { sendRecoveryCode, verifyCode, resetPassword } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");

    const handleEmailSubmit = async (emailData) => {
        setEmail(emailData);
        setLoading(true);
        try {
            await sendRecoveryCode(emailData);
            setStep(1);
        } catch (e) {
            alert(e.message || "Ошибка отправки кода");
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationSubmit = async (code) => {
        setLoading(true);
        try {
            await verifyCode(email, code);
            setRecoveryCode(code);
            setStep(2);
        } catch (e) {
            alert(e.message || "Неверный код");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (password) => {
        setLoading(true);
        try {
            await resetPassword(email, recoveryCode, password);
            navigate("/login");
        } catch (e) {
            alert(e.message || "Ошибка сброса пароля");
        } finally {
            setLoading(false);
        }
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

