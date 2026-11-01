import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export function useBoard(id) {
  const { token } = useAuth();
  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const [board, cards] = await Promise.all([
        api.get(`/boards/${id}`),
        api.get(`/boards/${id}/cards`),
      ]);
      setBoard(board);
      setCards(cards);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  }, [id]);

  useEffect(() => {
    reload();

    const es = new EventSource(`/api/boards/${id}/events?token=${token}`);
    es.onmessage = () => reload();

    // cleanup
    return () => es.close();
  }, [reload, token]);

  return { board, cards, error, reload };
}
