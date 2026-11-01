import { useState } from "react";
import { api } from "../api/client.js";

export default function SubtaskList({ card, onChanged }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const done = card.subtasks.filter(s => s.done).length;

  async function handleAdd() {
    try {
      await api.post(`/cards/${card._id}/subtasks`, { title });
      setTitle("");
      setError(null);
      await onChanged();
    } catch (error) {
      setError(error.message);
    }
  }

  async function toggle(s) {
    try {
      await api.patch(`/cards/${card._id}/subtasks/${s._id}`, { done: !s.done });
      await onChanged();
    } catch (error) {
      setError(error.message);
    }
  }

  async function remove(s) {
    try {
      await api.del(`/cards/${card._id}/subtasks/${s._id}`);
      await onChanged();
    } catch (error) {
      setError(error.message);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();          // blocca il submit del form della modale
      handleAdd();
    }
  }

  return (
    <div className="subtasks">
      <h4>Sottotask {done}/{card.subtasks.length}</h4>
      <ul>
        {card.subtasks.map((s) => (
          <li key={s._id}>
            <label className="check">
              <input type="checkbox" checked={s.done} onChange={() => toggle(s)} />
              <span className={s.done ? "done" : undefined}>{s.title}</span>
            </label>
            <button type="button" className="ghost small" onClick={() => remove(s)}>×</button>
          </li>
        ))}
      </ul>
      <div className="inline-form">
        <input placeholder="Nuovo sottotask" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={handleKeyDown} />
        <button type="button" onClick={handleAdd}>Aggiungi</button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
