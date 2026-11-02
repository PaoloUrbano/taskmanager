require("dotenv").config(); //legge .env

const path = require("path");
const fs = require("fs");
const express = require("express");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());   // body json -> req.body

app.use("/api/auth", require("./routes/auth"));
app.use("/api/boards", require("./routes/boards"));
app.use("/api/cards", require("./routes/cards"));

// Documentazione delle API: Swagger UI su /api/docs, specifica OpenAPI su /api/docs/openapi.json
app.get("/api/docs", (req, res) => res.sendFile(path.join(__dirname, "docs", "swagger.html")));
app.get("/api/docs/openapi.json", (req, res) => res.sendFile(path.join(__dirname, "docs", "openapi.json")));

// In produzione Express serve anche la SPA
const dist = path.join(__dirname, "..", "frontend", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.use((req, res) => res.status(404).json({ error: "Risorsa non trovata" })); // api non trovata

app.use(errorHandler); //gestore centrale degli errori

//aspetto di caricare il database prima di avviare il backend
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT, () => console.log(`API su http://localhost:${process.env.PORT}/api`)))
  .catch(err => console.error("MongoDB non raggiungibile: ", err.message));
