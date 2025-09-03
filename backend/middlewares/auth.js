// Importar
const jwt = require("jwt-simple")
const moment = require("moment")

const libjwt = require("../services/JWT")
require("dotenv").config()

// MIDDLEWARE de autentificacion

exports.auth = (req,res,next) => {
    // Comprobar si llega la cabecera auth
    if(!req.headers.authorization){
        return res.status(403).json({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticacion"
        })
    }

    // Limpiar token
    let token = req.headers.authorization.replace(/['"]+/g, '')

    // Decodificar token
    try{
        let payload = jwt.decode(token, process.env.JWT_SECRET)

        // Comprobar expiracion
        if(payload.exp <= moment().unix()){
            return res.status(401).json({
                status: "error",
                message: "Token expirado",
            })
        }

        // Agregar datos de usuario al req
        req.user = payload

    } catch (error){
        return res.status(404).json({
            status: "error",
            message: "Token invalido",
            error
        })
    }

    

    // Pasar a ejecutar rutas
    next()
}

