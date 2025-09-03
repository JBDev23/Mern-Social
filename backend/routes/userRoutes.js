const express = require("express")
const router = express.Router()
const UserController = require("../controllers/userController")
const check = require("../middlewares/auth")
const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configurar multer
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storageAvatar = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "mern-social/avatars",
        allowed_formats: ["jpg", "png", "jpeg", "gif"]
    }
});

const uploadAvatar = multer({ storage: storageAvatar });

// Definir rutas
router.get("/prueba-usuario", check.auth, UserController.pruebaUser)
router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.get("/profile/:id", check.auth, UserController.profile)
router.get("/list", check.auth, UserController.list)
router.get("/list/:page", check.auth, UserController.list)
router.put("/update", check.auth, UserController.update)
router.post("/upload", [check.auth, uploadAvatar.single("file0")], UserController.upload)
router.get("/avatar/:file", UserController.avatar)
router.get("/counters", check.auth, UserController.counters)
router.get("/counters/:id", check.auth, UserController.counters)

// Exportar router
module.exports = router