const jwt = require("jsonwebtoken");
const User = require("../models/User");
const HttpError = require("../utils/httpError");

// POST /api/auth/register  { email, password, name } -> 201 utente (senza password grazie al toJSON)
exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  const domain = process.env.ALLOWED_EMAIL_DOMAIN;          // registrazione solo con l'email aziendale
  if (domain && !String(email).toLowerCase().endsWith("@" + domain)) {
    throw new HttpError(403, "Registrazione consentita solo con email @" + domain);
  }
  // Email duplicata -> errore 11000 -> 409; campi non validi -> ValidationError -> 400 (li gestisce l'error handler)
  const user = await User.create({ email, password, name });
  res.status(201).json(user);
};

// POST /api/auth/login  { email, password } -> 200 { token, user }
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  // stesso messaggio se l'email non esiste o la password è sbagliata: non rivelo quali email sono registrate.
  if (!user || !(await user.checkPassword(password))) {
    throw new HttpError(401, "Credenziali non valide");
  }
  // JWT firmato ma non cifrato. Il payload è leggibile da chiunque, quindi non mando la password
  const token = jwt.sign({ sub: user._id, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.json({ token, user });
};

// GET /api/auth/me -> 200 utente corrente
exports.me = async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) throw new HttpError(401, "Token non valido");  // utente cancellato dopo l'emissione del token
  res.json(user);
};
