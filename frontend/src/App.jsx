import { Routes, Route, Navigate } from "react-router";
import RequireAuth from "./components/RequireAuth.jsx";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import BoardsPage from "./pages/BoardsPage.jsx";
import BoardPage from "./pages/BoardPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
        
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/boards/:id" element={<BoardPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/boards" replace />} />
      <Route path="*" element={<p className="page">Pagina inesistente (404)</p>} />
    </Routes>
  );
}
