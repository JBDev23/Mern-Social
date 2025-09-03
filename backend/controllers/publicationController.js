const fs = require("fs")
const path = require("path")
const Publication = require("../models/Publication")
const User = require("../models/User")
const followService = require("../services/followService")

const pruebaPublication = (req,res) => {
    res.status(200).send({
        message: "Mensaje enviado desde publicationController"
    })
}

// Guardar publicacion
const save = async(req, res) => {
    // Recoger datos del body
    let params = req.body

    if(!params.text){
        res.status(400).send({
            status: "error",
            message: "Faltan datos",
            params
        })
    }

    // Crear y rellenar objeto
    let newPublication = new Publication(params)
    newPublication.user = req.user.id

    // Guardar objeto en la db
    try{
        let publicationStored = await newPublication.save()

        if(!publicationStored){
            res.status(400).send({
                status: "error",
                message: "No se pudo guardar la publicacion"
            })
        }

        res.status(200).send({
            status: "success",
            publicationStored
        })
    } catch (error){
        res.status(400).send({
            status: "error",
            message: "Error en la peticion"
        })
    }
}

// Sacar publicacion
const detail = async (req, res) => {
    // Sacar la publicacion de la url
    const publicationId = req.params.id

    try{
        let publicationStored = await Publication.findById(publicationId)

        if(!publicationStored){
            res.status(400).send({
                status: "error",
                message: "No existe la publicacion"
            })
        }

        res.status(200).send({
            status: "success",
            publication: publicationStored
        })

    } catch (error) {
        res.status(400).send({
            status: "error",
            message: "Error en la peticion"
        })
    }

}

// Eliminar publicacion
const remove = async(req, res) => {
    // Sacar la publicacion a eliminar
    const publicationId = req.params.id

    try{
        let publicationDeleted = await Publication.findOneAndDelete({"user" : req.user.id, "_id": publicationId})

        if(!publicationDeleted){
            res.status(400).send({
                status: "error",
                message: "No se pudo borrar la publicacion"
            })
        }

        res.status(200).send({
            status: "success",
            publication: publicationId
        })

    } catch (error) {
        res.status(400).send({
            status: "error",
            message: "Error en la peticion"
        })
    }
}

// Listar todas las publicaciones
const user = async (req, res) => {
    // Sacar el id de usuario
    const userId = req.params.id

    let page = 1

    if(req.params.page) page = req.params.page

    const itemsPerPage = 5    

    try{

        const options = {
                    page,
                    limit: itemsPerPage,
                    sort: "-created_at",
                    populate: { path: "user", select: "-password -role -__v -email" },
                };
        
        const result = await Publication.paginate({ user: userId }, options);

        if(!result.docs || result.docs.length <= 0){
            res.status(400).send({
                status: "error",
                message: "No hay publicaciones"
            })
        }

        res.status(200).send({
            status: "success",
            publications: result.docs,
            page,
            total: result.totalDocs,
            pages: result.totalPages,
        })

    } catch (error) {
        res.status(400).send({
            status: "error",
            message: "Error en la peticion"
        })
    }
}

// Listar publicaciones de un usuario

// Subir ficheros
const upload = async (req, res) => {
    const publicationId = req.params.id;

    // Comprobar si llega el fichero
    if (!req.file) {
        return res.status(404).json({
            status: "error",
            message: "Petición no incluye imagen",
        });
    }


    try {
        // Guardar URL y public_id en la publicación
        let publicationUpdated = await Publication.findOneAndUpdate(
            { "user": req.user.id, "_id": publicationId },
            { file: req.file.path, public_id: req.file.filename },
            { new: true }
        );

        if (!publicationUpdated) {
            return res.status(404).json({
                status: "error",
                message: "Error en la subida",
            });
        }

        return res.status(200).json({
            status: "success",
            publication: publicationUpdated,
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

// Devolver imagen
const media = (req,res) => {
    // Sacar el parametro de la url
    const file = req.params.file

    // Montar el path
    const filePath = "./uploads/publications/" + file

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if(!exists){
            return res.status(404).json({
                status: "error",
                message: "No existe la imagen",
            });
        }

        // Devolver file
        return res.sendFile(path.resolve(filePath))
    })

}

// Listar todas las publicaciones
const feed = async (req, res) =>{
    // Sacar pagina
    let page = 1

    if(req.params.page) page = req.params.page

    // Numero de elementos por pagina
    const itemsPerPage = 5

    // Sacar usuarios que sigo
    try{
        let miFollows = await followService.followUserIds(req.user.id)

        const options = {
                    page,
                    limit: itemsPerPage,
                    sort: { created_at: -1 },
                    populate: { path: "user", select: "-password -role -__v -email" },
                };
        
        const result = await Publication.paginate({ user: { $in: miFollows.following } }, options);

        if(!result.docs || result.docs.length <= 0){
            res.status(400).send({
                status: "error",
                message: "No hay publicaciones"
            })
        }

        // Find de todas las publicaciones de lo usuarios que sigo, ordernar, popular y paginar
        return res.status(200).json({
            status: "success",
            miFollows: miFollows.following,
            publications: result.docs,
            total: result.totalDocs,
            pages: result.totalPages,
        });

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Error en la consulta",
        });
    }
}

module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}