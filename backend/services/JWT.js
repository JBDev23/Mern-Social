// Importar dependencias
const jwt = require("jwt-simple")
const moment = require("moment")
require("dotenv").config()

// Crear funcion para generar tokens
const createToken = (user)=>{
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        bio: user.bio,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    }

    // Devolver token
    return jwt.encode(payload,process.env.JWT_SECRET)
}

module.exports = {
    createToken
}