const mongoose = require("mongoose");
const { Schema } = mongoose;

const boardSchema = new Schema({
  title: {
    type: String,
    required: [true, "Il titolo della board è obbligatorio"],
    trim: true,
    maxlength: [80, "Il titolo può avere al massimo 80 caratteri"],
  },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

// true se userId è owner o member
boardSchema.methods.isMember = function (userId) {
  return this.owner.equals(userId) || this.members.find((user) => user.equals(userId));
};

module.exports = mongoose.model("Board", boardSchema);
