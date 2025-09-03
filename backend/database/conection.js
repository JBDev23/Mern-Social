const mongoose = require("mongoose")
require("dotenv").config()

//dotenv.config();

const connection = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI)

        console.log("Conectado correctamente a la bd: mi_redsocial")
        
    } catch (error) {
        console.log(error)
        throw new Error("No se ha podido conectar a la base de datos")
    }
}

module.exports = {
    connection
}