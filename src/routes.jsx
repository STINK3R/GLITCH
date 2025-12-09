import { Route, Routes } from "react-router-dom";
import { Home } from './pages/Home/Home.jsx';
import {Login} from './features/auth/Login/Login.jsx';
import {Register} from './features/auth/Registration/Registration.jsx';


export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

        </Routes>
    );
}