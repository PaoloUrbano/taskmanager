const Card = require("../models/Card");
const HttpError = require("../utils/httpError");
const { publish } = require("../services/events");

const CARD_POPULATE = [
  { path: "assignee", select: "name email" },
  { path: "createdBy", select: "name" },
];

// GET /api/boards/:id/cards -> le card della board, ordinate per stato e posizione
exports.index = async (req, res) => {
  const cards = await Card.find({ board: req.board._id })
    .sort({ status: 1, position: 1 })
    .populate(CARD_POPULATE);
  res.json(cards);
};

// POST /api/boards/:id/cards { title, description?, status?, dueDate? }   (owner) -> 201
exports.create = async (req, res) => {
  const { title, description, status, dueDate } = req.body;          // whitelist dei campi
  const card = await Card.create({ title, description, status, dueDate, board: req.board._id, createdBy: req.user.sub });
  await card.populate(CARD_POPULATE);
  publish(req.board._id, { type: "card.created", cardId: card._id });
  res.status(201).json(card);
};

// GET /api/cards/:cardId -> la card + header ETag con la sua versione
exports.show = async (req, res) => {
  await req.card.populate(CARD_POPULATE);
  res.set("ETag", `"${req.card.__v}"`);
  res.json(req.card);
};

// PATCH /api/cards/:cardId { title?, description?, dueDate? } + header If-Match   (membri; dueDate solo owner)
exports.updateContent = async (req, res) => {
  const update = {};
  for (const field of ["title", "description", "dueDate"]) {
    if (field in req.body) update[field] = req.body[field];
  }
  if ("dueDate" in update && !req.isOwner) {
    throw new HttpError(403, "Solo il proprietario può cambiare la scadenza");
  }

  //Il client dice su quale versione ha basato la modifica.
  const ifMatch = req.get("If-Match");
  if (!ifMatch) throw new HttpError(428, "Header If-Match obbligatorio");
  const version = Number(ifMatch.replaceAll('"', "")); // "3" -> 3

  // aggiorna solo se __v è ancora la stessa
  const card = await Card.findOneAndUpdate(
    { _id: req.card._id, __v: version },
    { $set: update, $inc: { __v: 1 } },
    { new: true, runValidators: true },
  ).populate(CARD_POPULATE);
  if (!card) throw new HttpError(412, "La card è stata modificata da un altro utente");

  res.set("ETag", `"${card.__v}"`);
  publish(req.board._id, { type: "card.updated", cardId: card._id });
  res.json(card);
};

// PATCH /api/cards/:cardId/status { status }   (membri) -> la card va in fondo alla nuova colonna
exports.updateStatus = async (req, res) => {
  if (req.card.status === req.body.status) return res.json(req.card);
  const card = await Card.findByIdAndUpdate(
    req.card._id,
    { $set: { status: req.body.status, position: Date.now() } },
    { new: true, runValidators: true },        // runValidators: l'enum rifiuta uno stato inesistente -> 400
  ).populate(CARD_POPULATE);
  publish(req.board._id, { type: "card.updated", cardId: card._id });
  res.json(card);
};

// PATCH /api/cards/:cardId/assignee { userId | null }
//   owner  -> chiunque sia membro della board, oppure null
//   member -> solo se stesso (anche togliendo la card a un altro); non può mettere null
exports.updateAssignee = async (req, res) => {
  const { userId } = req.body;
  if (userId != null && !req.board.isMember(userId)) {
    throw new HttpError(400, "Non è membro della board");
  }
  if (!req.isOwner && userId !== req.user.sub) {
    throw new HttpError(403, "Puoi assegnare la card solo a te stesso");
  }
  const card = await Card.findByIdAndUpdate(
    req.card._id,
    { $set: { assignee: userId } },
    { new: true },
  ).populate(CARD_POPULATE);
  publish(req.board._id, { type: "card.updated", cardId: card._id });
  res.json(card);
};

// DELETE /api/cards/:cardId   (owner) -> 204
exports.remove = async (req, res) => {
  await req.card.deleteOne();
  publish(req.board._id, { type: "card.deleted", cardId: req.card._id });
  res.status(204).end();
};

// ---------- Sottotask (membri) ----------

// POST /api/cards/:cardId/subtasks { title } -> 201
exports.addSubtask = async (req, res) => {
  const card = await Card.findByIdAndUpdate(
    req.card._id,
    { $push: { subtasks: { title: req.body.title } } },     // aggiunge in fondo all'array
    { new: true, runValidators: true },
  ).populate(CARD_POPULATE);
  publish(req.board._id, { type: "card.updated", cardId: card._id });
  res.status(201).json(card);
};

// PATCH /api/cards/:cardId/subtasks/:subId { done }
exports.updateSubtask = async (req, res) => {
  if (typeof req.body.done !== "boolean") throw new HttpError(400, "Il campo done (true/false) è obbligatorio");

  // Operatore posizionale "$": il filtro trova la card che contiene quel sottotask,
  // e "subtasks.$" indica l'elemento dell'array che ha soddisfatto il filtro.
  const card = await Card.findOneAndUpdate(
    { _id: req.card._id, "subtasks._id": req.params.subId },
    { $set: { "subtasks.$.done": req.body.done } },
    { new: true, runValidators: true },
  ).populate(CARD_POPULATE);
  if (!card) throw new HttpError(404, "Sottotask non trovato");
  publish(req.board._id, { type: "card.updated", cardId: card._id });
  res.json(card);
};

// DELETE /api/cards/:cardId/subtasks/:subId
exports.removeSubtask = async (req, res) => {
  const card = await Card.findByIdAndUpdate(
    req.card._id,
    { $pull: { subtasks: { _id: req.params.subId } } },     // UPDATE con $pull, non delete: sparisce l'elemento, non la card
    { new: true },
  ).populate(CARD_POPULATE);
  publish(req.board._id, { type: "card.updated", cardId: card._id });
  res.json(card);
};
