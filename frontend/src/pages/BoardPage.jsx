import { useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useBoard } from "../hooks/useBoard.js";
import { STATUSES } from "../utils.js";
import Column from "../components/Column.jsx";
import CardDialog from "../components/CardDialog.jsx";
import MembersPanel from "../components/MembersPanel.jsx";

export default function BoardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { board, cards, error, reload } = useBoard(id);
  const [newTitle, setNewTitle] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [actionError, setActionError] = useState(null);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post(`/boards/${id}/cards`, { title: newTitle });
      setNewTitle("");
      setActionError(null);
      await reload();
    } catch (error) {
      setActionError(error.message);
    }
  }

  // Chiamata da Column quando si rilascia una card (drag and drop)
  async function handleMove(cardId, status) {
    const card = cards.find((c) => c._id === cardId);
    if (!card || card.status === status) return;
    try {
      await api.patch(`/cards/${cardId}/status`, { status });
      setActionError(null);
      await reload();
    } catch (error) {
      setActionError(error.message);
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!board) return <p className="muted">Caricamento…</p>;   // primo render: i dati non sono ancora arrivati

  const isOwner = board.owner._id === user._id;
  const selected = cards.find(c => c._id === selectedId);

  return (
    <>
      <div className="board-header">
        <Link to="/boards" className="muted">{"<- Le tue board"}</Link>
        <h1>{board.title}</h1>
      </div>

      {isOwner && (
        <form className="inline-form" onSubmit={handleCreate}>
          <input placeholder="Titolo della nuova card" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <button className="primary">Nuova card</button>
        </form>
      )}
      {actionError && <p className="error">{actionError}</p>}

      <div className="columns">
        {STATUSES.map((s) => (
          <Column
            key={s.key}
            status={s.key}
            title={s.label}
            cards={cards.filter(c => c.status === s.key)}
            onMove={handleMove}
            onOpen={setSelectedId}
          />
        ))}
      </div>

      <MembersPanel board={board} isOwner={isOwner} onChanged={reload} />

      {/* Montata solo se c'è una card selezionata */}
      {selected && (
        <CardDialog
          card={selected}
          board={board}
          isOwner={isOwner}
          onChanged={reload}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
