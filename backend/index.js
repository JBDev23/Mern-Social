// Importar dependencias
const {connection} = require("./database/conection")
const express = require("express")
const cors = require("cors")
const UserRoutes = require("./routes/userRoutes")
const PublicationRoutes = require("./routes/publicationRoutes")
const FollowRoutes = require("./routes/followRoutes")

// Bienvenida
console.log("API Node para red social arrancada")

// Conexion base de datos
connection()

// Crear servidor de node
const app = express()
const puerto = process.env.PORT || 3900

// Configurar cors
app.use(cors())

// Converitr datos del body a js
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// Cargar conf de rutas
app.use("/api/user", UserRoutes)
app.use("/api/publication", PublicationRoutes)
app.use("/api/follow", FollowRoutes)

// Ruta de prueba
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json({
        "id":"Hello"
    })
})

// Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log("Servidor de node corriendo en el puerto: ", puerto)
})