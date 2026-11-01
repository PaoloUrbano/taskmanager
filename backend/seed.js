require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Board = require("./models/Board");
const Card = require("./models/Card");

const DAY = 24 * 60 * 60 * 1000;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.dropDatabase();
  await Promise.all([User.init(), Board.init(), Card.init()]);

  const pw = "password123";
  const users = {};
  for (const [key, name] of [["anna", "Anna"], ["paolo", "Paolo"], ["mario", "Mario"], ["luca", "Luca"]]) {
    users[key] = await User.create({ email: `${key}@azienda.it`, password: pw, name });
  }

  const esame = await Board.create({
    title: "Esame Fondamenti Web",
    owner: users.paolo._id,
    members: [users.anna._id, users.mario._id],
  });
  const sito = await Board.create({
    title: "Sito aziendale",
    owner: users.anna._id,
    members: [users.paolo._id, users.mario._id],
  });

  let t = Date.now();
  const card = (board, createdBy, fields) => ({ board, createdBy, position: t++, ...fields });

  await Card.create([
    card(esame._id, users.paolo._id, { title: "Ripasso specificità CSS", status: "done", subtasks: [
      { title: "Contare a colonne", done: true }, { title: "LoVe HAte", done: true }] }),
    card(esame._id, users.paolo._id, { title: "Backend P1", status: "doing", assignee: users.paolo._id,
      description: "Auth, board, membri, card, permessi.\nCollaudo delle API",
      dueDate: new Date(Date.now() + 1 * DAY), subtasks: [
        { title: "Model", done: true }, { title: "Middleware permessi", done: false }, { title: "Controller", done: false }] }),
    card(esame._id, users.paolo._id, { title: "Frontend P1", status: "todo", assignee: users.mario._id,
      dueDate: new Date(Date.now() + 2 * DAY), subtasks: [{ title: "Login e lista board", done: false }] }),
    card(esame._id, users.paolo._id, { title: "SSE e optimistic locking", status: "backlog" }),
    card(esame._id, users.paolo._id, { title: "Slide della presentazione", status: "backlog",
      dueDate: new Date(Date.now() + 4 * DAY) }),
    card(sito._id, users.anna._id, { title: "Nuova home page", status: "todo", assignee: users.anna._id }),
    card(sito._id, users.anna._id, { title: "Pagina contatti", status: "backlog" }),
  ]);

  console.log("Seed completato. Utenti: anna, paolo, mario, luca @azienda.it. Password: " + pw);
  await mongoose.disconnect();
}

seed().catch(async err => {
  console.error("Seed fallito:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
