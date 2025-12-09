import { useAuthStore } from "./AuthStore";
import { authApi } from "./api";


export function useAuth() {
    const loginStore = useAuthStore((state) => state.login);
    const logoutStore = useAuthStore((state) => state.logout);


    async function login(email, password) {
        const data = await authApi.login(email, password);
        loginStore(data);
        return data;
    }


    async function register(email, password) {
        const data = await authApi.register(email, password);
        return data;
    }


    return { login, register, logout: logoutStore };
}