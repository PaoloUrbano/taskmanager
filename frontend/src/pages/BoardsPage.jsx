import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function BoardsPage() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setBoards(await api.get("/boards"));
      } catch (error) {
        setError(error.message);
      }
    }
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const board = await api.post("/boards", { title });
      setBoards([board, ...boards]);
      setTitle("");
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <>
      <h1>Le tue board</h1>

      <form className="inline-form" onSubmit={handleCreate}>
        <input placeholder="Titolo della nuova board" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="primary">Crea board</button>
      </form>
      {error && <p className="error">{error}</p>}

      <div className="board-grid">
        {boards.map((board) => (
          <Link key={board._id} className="board-tile" to={`/boards/${board._id}`}>
            <h3>{board.title}</h3>
            <span className="badge">{board.owner._id === user._id ? "owner" : "member"}</span>{" "}
            <small className="muted">{board.members.length + 1} persone</small>
          </Link>
        ))}
      </div>
      {boards.length === 0 && <p className="muted">Nessuna board: creane una!</p>}
    </>
  );
}
