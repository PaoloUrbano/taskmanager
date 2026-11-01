import { Link, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <>
      <header className="topbar">
        <Link to="/boards" className="brand">Task Manager</Link>
        <span className="spacer" />
        <span>{user?.name}</span>
        <button className="ghost" onClick={logout}>Esci</button>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  );
}
