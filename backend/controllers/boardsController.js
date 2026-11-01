const Board = require("../models/Board");
const Card = require("../models/Card");
const User = require("../models/User");
const HttpError = require("../utils/httpError");
const { subscribe, publish } = require("../services/events");

const POPULATE = [
  { path: "owner", select: "name email" },
  { path: "members", select: "name email" },
];

// GET /api/boards -> le board di cui sono owner oppure member
exports.index = async (req, res) => {
  const me = req.user.sub;
  const boards = await Board.find({ $or: [{ owner: me }, { members: me }] })   // { members: me } = "l'array contiene me"
    .sort({ updatedAt: -1 })
    .populate(POPULATE);
  res.json(boards);
};

// POST /api/boards { title } -> 201. Chi crea la board ne diventa owner.
exports.create = async (req, res) => {
  const board = await Board.create({ title: req.body.title, owner: req.user.sub });
  await board.populate(POPULATE);
  res.status(201).json(board);
};

// GET /api/boards/:id
exports.show = async (req, res) => {
  await req.board.populate(POPULATE);
  res.json(req.board);
};

// PATCH /api/boards/:id { title }   (owner)
exports.update = async (req, res) => {
  const board = await Board.findByIdAndUpdate(
    req.board._id,
    { title: req.body.title },
    { new: true, runValidators: true },
  ).populate(POPULATE);
  publish(req.board._id, { type: "board.updated" });
  res.json(board);
};

// DELETE /api/boards/:id   (owner) -> 204
// prima elimino le card, poi la board
exports.remove = async (req, res) => {
  await Card.deleteMany({ board: req.board._id });
  await req.board.deleteOne();
  publish(req.board._id, { type: "board.deleted" });
  res.status(204).end();
};

// POST /api/boards/:id/members { email }   (owner)
exports.addMember = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new HttpError(404, "Utente non trovato");
  if (req.board.owner.equals(user._id)) throw new HttpError(400, "Il proprietario è già nella board");

  // $addToSet niente doppioni
  const board = await Board.findByIdAndUpdate(
    req.board._id,
    { $addToSet: { members: user._id } },
    { new: true },
  ).populate(POPULATE);
  publish(req.board._id, { type: "board.updated" });
  res.json(board);
};

// DELETE /api/boards/:id/members/:userId   (owner)
exports.removeMember = async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) throw new HttpError(404, "Utente non trovato");

  const board = await Board.findByIdAndUpdate(
    req.board._id,
    { $pull: { members: user._id } },
    { new: true },
  ).populate(POPULATE);
  // le sue card in questa board tornano senza assegnatario.
  await Card.updateMany({ board: req.board._id, assignee: user._id }, { $set: { assignee: null } });
  publish(req.board._id, { type: "board.updated" });
  res.json(board);
};

// GET /api/boards/:id/events   (membri)  stream SSE
exports.events = (req, res) => subscribe(req.board._id, req, res);
