import { useLocation } from "react-router-dom";
import AppRoutes from "./routes";
import Header from './components/layouts/Header/Header.jsx';
import MobileBottomNav from './components/layouts/MobileBottomNav';
import { AuthInitializer } from "./features/auth/AuthInitializer";

// Страницы, где не нужен Header и нижняя навигация
const AUTH_ROUTES = ['/login', '/register', '/recovery', '/reset-password', '/verify-email', '/terms', '/privacy'];

export default function App() {
    const location = useLocation();
    
    // Проверяем, находимся ли мы на странице авторизации
    const isAuthPage = AUTH_ROUTES.some(route => location.pathname.startsWith(route));

    return (
        <AuthInitializer>
            {!isAuthPage && <Header />}
            <main className={isAuthPage ? "" : "page-transition pb-[56px] lg:pb-0"}>
                <AppRoutes />
            </main>
            {!isAuthPage && <MobileBottomNav />}
        </AuthInitializer>
    );
}
