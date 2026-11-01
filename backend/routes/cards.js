const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/cardsController");
const requireAuth = require("../middleware/requireAuth");
const { loadCard, loadBoard, requireMember, requireOwner } = require("../middleware/boardAccess");

router.use(requireAuth);

const member = [loadCard, loadBoard, requireMember];
const owner = [...member, requireOwner];

router.get("/:cardId", member, ctrl.show);
router.patch("/:cardId", member, ctrl.updateContent);
router.patch("/:cardId/status", member, ctrl.updateStatus);
router.patch("/:cardId/assignee", member, ctrl.updateAssignee);
router.delete("/:cardId", owner, ctrl.remove);
router.post("/:cardId/subtasks", member, ctrl.addSubtask);
router.patch("/:cardId/subtasks/:subId", member, ctrl.updateSubtask);
router.delete("/:cardId/subtasks/:subId", member, ctrl.removeSubtask);

module.exports = router;