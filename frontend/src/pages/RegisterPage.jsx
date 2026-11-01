import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/client.js";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.post("/auth/register", form);
      await login(form.email, form.password);
      navigate("/boards");
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="auth-page">
      <form className="panel auth-form" onSubmit={handleSubmit}>
        <h1>Registrati</h1>
        <label>Nome <input name="name" value={form.name} onChange={handleChange} required /></label>
        <label>Email aziendale <input name="email" type="email" value={form.email} onChange={handleChange} required /></label>
        <label>Password (min. 8 caratteri) <input name="password" type="password" minLength={8} value={form.password} onChange={handleChange} required /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary">Crea account</button>
        <p className="muted"><Link to="/login">Hai già un account? Accedi</Link></p>
      </form>
    </div>
  );
}
