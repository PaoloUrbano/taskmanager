const express = require("express");
const router = express.Router();
const board = require("../controllers/boardsController");
const cards = require("../controllers/cardsController");
const requireAuth = require("../middleware/requireAuth");
const { loadBoard, requireMember, requireOwner } = require("../middleware/boardAccess");

router.use(requireAuth);

const member = [loadBoard, requireMember];
const owner = [loadBoard, requireMember, requireOwner];

router.get("/", board.index);                                           // login
router.post("/", board.create);                                         // login: chi crea diventa owner
router.get("/:id", member, board.show);                                 // membro
router.patch("/:id", owner, board.update);                              // owner
router.delete("/:id", owner, board.remove);                             // owner
router.post("/:id/members", owner, board.addMember);                    // owner
router.delete("/:id/members/:userId", owner, board.removeMember);       // owner
router.get("/:id/cards", member, cards.index);                          // membro
router.post("/:id/cards", owner, cards.create);                         // owner
router.get("/:id/events", member, board.events);                        // membro: stream SSE

module.exports = router;
