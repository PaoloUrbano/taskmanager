const jwt = require("jsonwebtoken");
const HttpError = require("../utils/httpError");

module.exports = (req, res, next) => {
  //di norma il token arriva nell'header "Authorization: Bearer <token>".
  //lo stream SSE invece lo manda come ?token=, perché EventSource non può impostare header.
  const authHeader = req.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : req.query.token;
  if (!token) throw new HttpError(401, "Token mancante");

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Token non valido");
  }
  next();
};
