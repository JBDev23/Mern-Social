// Importar dependencias
const { connection } = require("../database/conection");
const express = require("express");
const cors = require("cors");
const UserRoutes = require("../routes/userRoutes");
const PublicationRoutes = require("../routes/publicationRoutes");
const FollowRoutes = require("../routes/followRoutes");
const serverless = require("serverless-http");

// Conectar a la base de datos
connection();

// Crear servidor de node
const app = express();

// Configurar cors
app.use(cors({
  origin: "https://mern-social-u5xo.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Convertir body a JS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar rutas
app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

// Ruta de prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json({ "id": "Hello" });
});

// Exportar app como función serverless
module.exports = serverless(app);
