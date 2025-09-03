const express = require("express")
const router = express.Router()
const FollowController = require("../controllers/followController")
const check = require("../middlewares/auth")

// Definir rutas
router.get("/prueba-follow", FollowController.pruebaFollow)
router.post("/save", check.auth, FollowController.save)
router.delete("/unfollow/:id", check.auth, FollowController.unfollow)
router.get("/following", check.auth, FollowController.following)
router.get("/following/:id", check.auth, FollowController.following)
router.get("/following/:id/:page", check.auth, FollowController.following)
router.get("/followers", check.auth, FollowController.followers)
router.get("/followers/:id", check.auth, FollowController.followers)
router.get("/followers/:id/:page", check.auth, FollowController.followers)

// Exportar router
module.exports = router