import { http } from "../../services/http";


export const authApi = {
    login: (email, password) => http("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    }),


    register: (email, password) => http("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
    }),
};