import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/AuthStore";

export const ProtectedRoute = ({ children }) => {
 const token = useAuthStore((state) => state.token);

    if (!token) return <Navigate to="/login" replace />;

    return children;
}
