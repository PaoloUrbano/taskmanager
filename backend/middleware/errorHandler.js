module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.name === "ValidationError" || err.name === "CastError") status = 400;
  if (err.code === 11000) {                      // indice unique violato
    status = 409;
    message = "Valore già esistente (email già registrata)";
  }
  if (status === 500) {
    console.error(err);
    message = "Errore interno";
  }
  res.status(status).json({ error: message });
};
