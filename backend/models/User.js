const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "L'email è obbligatoria"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Email non valida"],
  },
  password: {
    type: String,
    required: [true, "La password è obbligatoria"],
    minlength: [8, "La password deve avere almeno 8 caratteri"],
  },
  name: {
    type: String,
    required: [true, "Il nome è obbligatorio"],
    trim: true,
    maxlength: [50, "Il nome può avere al massimo 50 caratteri"],
  },
}, { timestamps: true });

// Hash della password prima del salvataggio solo se è cambiata, altrimenti ogni save rifarebbe l'hash dell'hash.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);   // 2^10
});

userSchema.methods.checkPassword = function (candidata) {
  return bcrypt.compare(candidata, this.password);
};

// La password non esce mai nelle response
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);