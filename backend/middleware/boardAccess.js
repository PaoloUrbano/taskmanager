const Board = require("../models/Board");
const Card = require("../models/Card");
const HttpError = require("../utils/httpError");

exports.loadCard = async (req, res, next) => {
  const card = await Card.findById(req.params.cardId);
  if (!card) throw new HttpError(404, "Card non trovata");
  req.card = card;
  next();
};

exports.loadBoard = async (req, res, next) => {
  const boardId = req.params.id ?? req.card?.board;      // endpoint /boards/:id oppure /cards/:cardId (dopo loadCard)
  const board = await Board.findById(boardId);
  if (!board) throw new HttpError(404, "Board non trovata");
  req.board = board;
  next();
};

exports.requireMember = (req, res, next) => {
  if (!req.board.isMember(req.user.sub)) throw new HttpError(404, "Board non trovata");
  req.isOwner = req.board.owner.equals(req.user.sub);
  next();
};

exports.requireOwner = (req, res, next) => {
  if (!req.isOwner) throw new HttpError(403, "Solo il proprietario della board può farlo");
  next();
};