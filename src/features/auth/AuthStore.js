import { create } from "zustand";


export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem("token") || null,


    login: (data) => set(() => {
        localStorage.setItem("token", data.token);
        return { user: data.user, token: data.token };
    }),


    logout: () => set(() => {
        localStorage.removeItem("token");
        return { user: null, token: null };
    })
}));