import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });   // un solo handler per tutti i campi
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      navigate("/boards");
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="panel auth-form" onSubmit={handleSubmit}>
        <h1>Accedi</h1>
        <label>Email <input name="email" type="email" autoComplete="username" value={form.email} onChange={handleChange} required /></label>
        <label>Password <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={handleChange} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary">Entra</button>
        <p className="muted"><Link to="/register">Non hai un account? Registrati</Link></p>
      </form>
    </div>
  );
}
