const express = require("express")
const router = express.Router()
const PublicationController = require("../controllers/publicationController")
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

const storagePublication = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mern-social/publications",
    allowed_formats: ["jpg","png","jpeg","gif"]
  }
});

const uploadPublication = multer({ storage: storagePublication });


// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication)
router.post("/save", check.auth, PublicationController.save)
router.get("/detail/:id", check.auth, PublicationController.detail)
router.delete("/remove/:id", check.auth, PublicationController.remove)
router.get("/user/:id", check.auth, PublicationController.user)
router.get("/user/:id/:page", check.auth, PublicationController.user)
router.post("/upload/:id", [check.auth, uploadPublication.single("file0")], PublicationController.upload)
router.get("/media/:file", PublicationController.media)
router.get("/feed", check.auth, PublicationController.feed)
router.get("/feed/:page", check.auth, PublicationController.feed)

// Exportar router
module.exports = router