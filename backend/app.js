require("dotenv").config(); //legge .env

const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());   // body json -> req.body

app.use("/api/auth", require("./routes/auth"));
app.use("/api/boards", require("./routes/boards"));
app.use("/api/cards", require("./routes/cards"));

app.use((req, res) => res.status(404).json({ error: "Risorsa non trovata" })); // api non trovata

app.use(errorHandler); //gestore centrale degli errori

//aspetto di caricare il database prima di avviare il backend
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT, () => console.log(`API su http://localhost:${process.env.PORT}/api`)))
  .catch(err => console.error("MongoDB non raggiungibile: ", err.message));
