const Follow = require("../models/Follow")
const User = require("../models/User")
const mongoosePagination = require("mongoose-paginate-v2")
const followService = require("../services/followService")


const pruebaFollow = (req,res) => {
    res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde followController"
    })
}

// Seguir
const save = async(req,res)=>{
    // Conseguir datos del Body
    let followed = req.body.followed

    // Sacar id del usuario identificado
    let identity = req.user

    // Crear objeto follow
    let userToFollow = new Follow({
        user: identity.id,
        followed
    })

    // Guardar en la db
    try{
        let followStored = await userToFollow.save()

        return res.status(200).json({
            status: "success",
            identity: req.user,
            follow: followStored
        })
    } catch (error){
        return res.status(500).json({
            status: "error",
            message: "No se ha podido seguir al usuario"
        })
    }
    
}

// Dejar de seguir
const unfollow = async(req,res) => {
    // Recoger id identificado
    const user_id = req.user.id

    // Recoger id del usuario a unfollow
    const followedId = req.params.id

    // Borrar de la db
    try{
        let followDeleted = await Follow.findOneAndDelete({
            "user": user_id,
            followed: followedId
        })

        if(!followDeleted){
            res.status(500).send({
                status: "error",
                message: "Error en el unfollow"
            })
        }

        res.status(200).send({
            status: "success",
            message: "Follow eliminado correctamente",
            followDeleted
        })
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Error en la peticion"
        })
    }
}

// Listado de usuarios que un usuario sigue
const following = async (req, res) => {
    // Sacar el id del usuario identificado
    let userId = req.user.id

    // Comprobar si me llega la pagina
    if(req.params.id) userId = req.params.id

    let page = 1

    if(req.params.page) page = req.params.page

    // Usuarios por pagina
    const itemsPerPage = 5

    // Find a follow, popular datos de usuario y paginar
    try{
        const options = {
            page,
            limit: itemsPerPage,
            sort: { _id: 1 },
            populate: { path: "user followed", select: "-password -role -__v -email" },
        };

        const result = await Follow.paginate({ user: userId }, options);

        // Array de usuarios que siguen a x y que les sigues
        let followUserIds = await followService.followUserIds(req.user.id)


        res.status(200).send({
            status: "success",
            message: "Listado de usuarios siguiendo",
            follows: result.docs,
            total: result.totalDocs,
            pages: result.totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers,
        })

    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Error en la peticion"
        })
    }
    
}

// Listado de usuarios que siguen a alguien
const followers = async(req, res) => {
    // Sacar el id del usuario identificado
    let userId = req.user.id

    // Comprobar si me llega la pagina
    if(req.params.id) userId = req.params.id

    let page = 1

    if(req.params.page) page = req.params.page

    // Usuarios por pagina
    const itemsPerPage = 5

    try{
        const options = {
            page,
            limit: itemsPerPage,
            sort: { _id: 1 },
            populate: { path: "user", select: "-password -role -__v -email" },
        };

        const result = await Follow.paginate({ followed: userId }, options);

        // Array de usuarios que siguen a x y que les sigues
        let followUserIds = await followService.followUserIds(req.user.id)


        res.status(200).send({
            status: "success",
            message: "Listado de usuarios que le siguen",
            follows: result.docs,
            total: result.totalDocs,
            pages: result.totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers,
        })

    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Error en la peticion"
        })
    }


    res.status(200).send({
        status: "success",
        message: "Listado de usuarios que te siguen"
    })
}

module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}