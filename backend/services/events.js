const clients = new Map();      // { "id board": Set di response aperte }

function subscribe(boardId, req, res) {
  const key = String(boardId);
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",   // no-transform: i proxy non devono comprimere né trattenere lo stream
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",                   // disattiva il buffering dei proxy (es. Nginx) davanti al server
  });
  res.flushHeaders();                         // manda subito gli header senza chiudere la risposta
  res.write(": connesso\n\n");                // commento ignorato dal browser

  if (!clients.has(key)) clients.set(key, new Set());
  clients.get(key).add(res);

  const ping = setInterval(() => res.write(": ping\n\n"), 25000);

  // Il browser chiude
  req.on("close", () => {
    clearInterval(ping);
    clients.get(key)?.delete(res);
    if (clients.get(key)?.size === 0) clients.delete(key);
  });
}

function publish(boardId, payload) {
  const set = clients.get(String(boardId));
  if (!set) return;                           // nessuno sta guardando questa board
  const message = `data: ${JSON.stringify(payload)}\n\n`;   // riga data + riga vuota; senza "event:" arriva a onmessage
  for (const res of set) res.write(message);
}

module.exports = { subscribe, publish };
