import { useLocation } from "react-router-dom";
import AppRoutes from "./routes";
import Header from './components/layouts/Header/Header.jsx';
import { AuthInitializer } from "./features/auth/AuthInitializer";

// Страницы, где не нужен Header
const AUTH_ROUTES = ['/login', '/register', '/recovery', '/reset-password', '/verify-email', '/terms', '/privacy', '/admin'];

export default function App() {
    const location = useLocation();
    
    // Проверяем, находимся ли мы на странице авторизации
    const isAuthPage = AUTH_ROUTES.some(route => location.pathname.startsWith(route));

    return (
        <AuthInitializer>
            {!isAuthPage && <Header />}
            <main className={isAuthPage ? "" : "page-transition"}>
                <AppRoutes />
            </main>
        </AuthInitializer>
    );
}
