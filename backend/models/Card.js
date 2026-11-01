const mongoose = require("mongoose");
const { Schema } = mongoose;

const STATUSES = ["backlog", "todo", "doing", "done"];

const subtaskSchema = new Schema({
  title: {
    type: String,
    required: [true, "Il titolo del sottotask è obbligatorio"],
    trim: true,
    maxlength: [100, "Il titolo può avere al massimo 100 caratteri"],
  },
  done: { type: Boolean, default: false },
});

const cardSchema = new Schema({
  board: { type: Schema.Types.ObjectId, ref: "Board", required: true },
  title: {
    type: String,
    required: [true, "Il titolo è obbligatorio"],
    trim: true,
    maxlength: [100, "Il titolo può avere al massimo 100 caratteri"],
  },
  description: {
    type: String,
    default: "",
    maxlength: [5000, "La descrizione può avere al massimo 5000 caratteri"],
  },
  status: { type: String, enum: STATUSES, default: "backlog" },
  position: { type: Number, default: () => Date.now() },
  dueDate: { type: Date, default: null },
  assignee: { type: Schema.Types.ObjectId, ref: "User", default: null },
  subtasks: [subtaskSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// Indice per la query più frequente: le card di una board ordinate per stato e posizione.
cardSchema.index({ board: 1, status: 1, position: 1 });

module.exports = mongoose.model("Card", cardSchema);
module.exports.STATUSES = STATUSES;
