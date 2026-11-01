import { useState } from "react";
import { api } from "../api/client.js";

export default function MembersPanel({ board, isOwner, onChanged }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await api.post(`/boards/${board._id}/members`, { email });   // 404 utente inesistente · 400 se è l'owner
      setEmail("");
      setError(null);
      await onChanged();
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleRemove(member) {
    if (!confirm(`Rimuovere ${member.name} dalla board?`)) return;
    try {
      await api.del(`/boards/${board._id}/members/${member._id}`);   // le sue card tornano senza assegnatario
      setError(null);
      await onChanged();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <aside className="panel members">
      <h3>Persone</h3>
      <ul>
        <li>{board.owner.name} <span className="badge">owner</span></li>
        {board.members.map((m) => (
          <li key={m._id}>
            {m.name} {isOwner && <button className="ghost small" onClick={() => handleRemove(m)}>rimuovi</button>}
          </li>
        ))}
      </ul>
      {isOwner && (
        <form className="inline-form" onSubmit={handleAdd}>
          <input placeholder="email dell'utente" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button>Aggiungi</button>
        </form>
      )}
      {error && <p className="error">{error}</p>}
    </aside>
  );
}
