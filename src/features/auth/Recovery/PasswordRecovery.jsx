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
        // API восстановления не имеет отдельного метода проверки кода без смены пароля
        // Поэтому здесь просто запоминаем код и идем дальше
        // (Или можно вызвать confirm с фейковым паролем, но это плохо)
        // В ResetPasswordApplyRequest нужен reset_token (это и есть код)
        setRecoveryCode(code);
        setStep(2);
    };

    const handlePasswordSubmit = async (password) => {
        setLoading(true);
        try {
            await resetPassword(recoveryCode, password, password);
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

