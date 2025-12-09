import AppRoutes from "./routes";
import Header from './components/layouts/Header/Header.jsx';
import { AuthInitializer } from "./features/auth/AuthInitializer";

export default function App() {
    return (
        <AuthInitializer>
            <Header />
            <AppRoutes />
        </AuthInitializer>
    );
}