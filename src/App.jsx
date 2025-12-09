import AppRoutes from "./routes";
import Header from './components/layouts/Header/Header.jsx';

export default function App() {
    return (
        <>
            <Header />
            <AppRoutes />
        </>
    );
}