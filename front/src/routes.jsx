import { Route, Routes, Navigate } from "react-router-dom";
import { Login } from "./features/auth/Login/Login.jsx";
import { Register } from "./features/auth/Registration/Registration.jsx";
import { PasswordRecovery } from "./features/auth/Recovery/PasswordRecovery.jsx";
import { ResetPasswordPage } from "./features/auth/Recovery/ResetPasswordPage.jsx";
import { VerifyEmail } from "./features/auth/Verification/VerifyEmail.jsx";
import { EventsPage } from "./pages/Events/EventsPage.jsx";
import { EventDetailPage } from "./pages/Events/EventDetailPage.jsx";
import { TermsPage } from "./pages/Legal/TermsPage.jsx";
import { PrivacyPage } from "./pages/Legal/PrivacyPage.jsx";
import { ProtectedRoute } from "./components/layouts/ProtectedRoutes.jsx";
import { AdminRoute } from "./components/layouts/AdminRoute.jsx";
import { AdminLayout, EventsManagement, UsersManagement } from "./features/admin";
import { useAuth } from "./features/auth/useAuth";
import { USER_ROLES } from "./features/auth/AuthStore";

// Компонент для редиректа с главной страницы
const RootRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === USER_ROLES.ADMIN) {
    return <Navigate to="/admin/users" replace />;
  }

  return <Navigate to="/events" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Главная страница - умный редирект */}
      <Route path="/" element={<RootRedirect />} />

      {/* Авторизация */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recovery" element={<PasswordRecovery />} />
      
      {/* Ссылки из писем */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Правовые документы */}
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Защищённые маршруты - события */}
      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id"
        element={
          <ProtectedRoute>
            <EventDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Админ-панель (только для администраторов) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/users" replace />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="events" element={<EventsManagement />} />
      </Route>

      {/* 404 - редирект на главную */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

