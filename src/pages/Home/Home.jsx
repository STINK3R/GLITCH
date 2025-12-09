/**
 * Главная страница - редирект на страницу событий
 */

import { Navigate } from "react-router-dom";

export const Home = () => {
  return <Navigate to="/events" replace />;
};
