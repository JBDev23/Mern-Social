// Importar dependecias y modulos
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("../services/JWT")
const mongoosePagination = require("mongoose-paginate-v2")
const fs = require("fs")
const path = require("path")
const followService = require("../services/followService")
const Follow = require("../models/Follow")
const Publication = require("../models/Publication")
const validate = require("../helpers/validate")

const pruebaUser = (req, res) => {
    res.status(200).send({
        message: "Mensaje enviado desde userController",
        usuario: req.user
    })
}

// Registrar usuarios
const register = async (req, res) => {
    // Recoger datos de la peticion
    let params = req.body

    // Comprobar que llegan bien + validacion
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
            params
        })
    }

    try {
        validate(params)
    } catch (error) {
        return res.status(500).json({
            status: "success",
            message: "Validacion no superada",
        })
    }


    // Control usuarios duplicados
    try {
        let users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        }).exec()

        if (users && users.length >= 1) {
            return res.status(200).json({
                status: "success",
                message: "El usuario ya existe",
            })
        }

        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10)
        params.password = pwd

        // Guardar usuario en la db
        let user_to_save = new User(params)
        try {
            let userStored = await user_to_save.save()

            if (userStored) {
                // Devolver resultado
                return res.status(200).json({
                    status: "success",
                    message: "Usuario Registrado Correctamente",
                    userStored
                })
            } else {
                return res.status(500).json({
                    status: "error",
                    message: "Error al guardar el Usuario",
                })
            }
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Error al guardar el Usuario",
            })
        }

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta",
        })
    }
}

const login = async (req, res) => {
    // Recoger parametros
    let params = req.body

    if (!params.email || !params.password) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
            params
        })
    }

    // Buscar en la bd si existe
    try {
        let user = await User.findOne({ email: params.email })

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "El usuario no existe"
            })
        }

        // Comprobar contraseña
        let pwd = bcrypt.compareSync(params.password, user.password)

        if (!pwd) {
            return res.status(400).json({
                status: "error",
                message: "No te has identificado correctamente"
            })
        }

        // Devolver token
        const token = jwt.createToken(user)

        // Devolver datos usuario

        return res.status(200).json({
            status: "success",
            message: "Te has identificado correctamente",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick,
                email: user.email
            },
            token
        })

    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "Error en la consulta",
        })
    }
}

const profile = async (req, res) => {
    // Recibir el id por para
    const id = req.params.id

    // Consulta para sacar los datos del usuario
    try {
        let userProfile = await User.findById(id).select({ password: 0, role: 0 }).exec();

        if (!userProfile) {
            return res.status(404).json({
                status: "error",
                message: "El usuario no existe",
            })
        }

        // Info de seguimiento
        const followInfo = await followService.followThisUser(req.user.id, id)

        // Devolver usuario

        return res.status(200).json({
            status: "success",
            user: userProfile,
            following: followInfo.following,
            follower: followInfo.follower
        })

    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "Error en la consulta",
        })
    }

}

const list = async (req, res) => {
    try {
        let page = parseInt(req.params.page) || 1;
        let itemsPerPage = 3;

        const options = {
            page,
            limit: itemsPerPage,
            sort: { _id: 1 },
            select: "-password -email -role -__v"
        };

        const result = await User.paginate({}, options);

        if (!result.docs || result.docs.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No hay usuarios",
            });
        }

        // Array de usuarios que siguen a x y que les sigues
        let followUserIds = await followService.followUserIds(req.user.id)

        return res.status(200).json({
            status: "success",
            users: result.docs,
            total: result.totalDocs,
            page: result.page,
            pages: result.totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers,
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta",
        });
    }

}

const update = async (req, res) => {
    // Recoger info
    const userIdentity = req.user
    const userToUpdate = req.body

    // Eliminar campos sobrantes
    delete userToUpdate.iat
    delete userToUpdate.exp
    delete userToUpdate.role
    delete userToUpdate.image

    // Comprobar si el usuario ya existe
    try {
        let users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() }
            ]
        }).exec()

        let userIsset = false
        users.forEach(user => {
            if (user && user._id != userIdentity.id) {
                userIsset = true
            }
        });

        if (userIsset) {
            return res.status(200).json({
                status: "success",
                message: "El usuario ya existe",
            })
        }

        // Si llega la password cifrar
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10)
            userToUpdate.password = pwd
        } else {
            delete userToUpdate.password
        }

        let userUpdated = await User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true })

        if (!userUpdated) {
            return res.status(500).json({
                status: "error",
                message: "Error al actualizar",
            })
        }

        // Buscar y actualizar
        return res.status(200).json({
            status: "success",
            user: userUpdated
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta",
        })
    }
}

const upload = async (req, res) => {
    // Comprobar si llega el fichero
    if (!req.file) {
        return res.status(404).json({
            status: "error",
            message: "Petición no incluye imagen",
        });
    }

    try {
        // Guardar URL y public_id en el usuario
        let userUpdated = await User.findOneAndUpdate(
            { _id: req.user.id },
            { image: req.file.path, public_id: req.file.filename },
            { new: true }
        );

        if (!userUpdated) {
            return res.status(404).json({
                status: "error",
                message: "Error en la subida",
            });
        }

        return res.status(200).json({
            status: "success",
            user: userUpdated,
            file: req.file  // incluye URL y public_id
        });

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Error en la consulta",
            error
        });
    }
};

const avatar = (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file

    // Montar el path
    const filePath = "./uploads/avatars/" + file

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) {
            return res.status(404).json({
                status: "error",
                message: "No existe la imagen",
            });
        }

        // Devolver file
        return res.sendFile(path.resolve(filePath))
    })

}

const counters = async (req, res) => {
    let userId = req.user.id

    if (req.params.id) userId = req.params.id

    try {
        const following = await Follow.countDocuments({ "user": userId })

        const followed = await Follow.countDocuments({ "followed": userId })

        const publications = await Publication.countDocuments({ "user": userId })

        return res.status(200).json({
            status: "success",
            following,
            followed,
            publications
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta",
        });
    }
}

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}