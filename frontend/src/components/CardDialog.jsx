import { useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { toDateInput } from "../utils.js";
import SubtaskList from "./SubtaskList.jsx";

export default function CardDialog({ card, board, isOwner, onChanged, onClose }) {
  const { user } = useAuth();
  const ref = useRef(null);      // riferimento al <dialog> del DOM: showModal()

  const [form, setForm] = useState({
    title: card.title,
    description: card.description,
    dueDate: toDateInput(card.dueDate),
    assigneeId: card.assignee?._id ?? "",
    version: card.__v,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);

  // Chi può comparire come assegnatario: l'owner vede tutti; il member vede l'assegnatario attuale e se stesso.
  const people = [board.owner, ...board.members];
  const current = card.assignee;
  const options = isOwner
    ? people
    : (current && current._id !== user._id ? [current, user] : [user]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const body = { title: form.title, description: form.description };
      if (isOwner) body.dueDate = form.dueDate || null;

      // 1. contenuto, con la versione letta all'apertura
      await api.patch(`/cards/${card._id}`, body, { "If-Match": `"${form.version}"` });

      // 2. assegnatario, solo se è cambiato
      if (form.assigneeId !== (card.assignee?._id ?? "")) {
        await api.patch(`/cards/${card._id}/assignee`, { userId: form.assigneeId || null });
      }
      await onChanged();
      onClose();
    } catch (error) {
      if (error.status === 412) {
        alert("La card è stata modificata da un altro utente: ricarico la versione aggiornata.");
        await onChanged();
        onClose();
        return;
      }
      setError(error.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Eliminare la card?")) return;
    try {
      await api.del(`/cards/${card._id}`);
      await onChanged();
      onClose();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <dialog ref={ref} className="card-dialog" onClose={onClose}>
      <form onSubmit={handleSave}>
        <div className="dialog-head">
          <small className="muted">creata da {card.createdBy?.name}</small>
          <button type="button" className="ghost" onClick={onClose}>Chiudi</button>
        </div>

        <label>Titolo <input name="title" value={form.title} onChange={handleChange} required /></label>
        <label>Descrizione <textarea name="description" rows={6} value={form.description} onChange={handleChange} /></label>
        <label>Scadenza <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} disabled={!isOwner} /></label>

        <SubtaskList card={card} onChanged={onChanged} />

        <label>Assegnatario
          <select name="assigneeId" value={form.assigneeId} onChange={handleChange}>
            <option value="" disabled={!isOwner}>Nessuno</option>
            {options.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </label>

        {error && <p className="error">{error}</p>}

        <div className="dialog-actions">
          {isOwner && <button type="button" className="danger" onClick={handleDelete}>Elimina</button>}
          <span className="spacer" />
          <button className="primary">Salva</button>
        </div>
      </form>
    </dialog>
  );
}
