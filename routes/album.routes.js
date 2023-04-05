const express = require("express");
const check = require("../middlewares/auth.middleware");

//Cargar Router
const router = express.Router();

//Importar controlador user
const albumController = require("../controllers/album.controller");

//Configuración de subida
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/albums/");
    },
    filename: (req, file, cb) => {
        cb(null, "album-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage })

router.get("/prueba", albumController.prueba);
router.post("/save", check.auth ,albumController.save);
router.get("/one-album/:id", check.auth ,albumController.oneAlbum);
router.get("/list/:artistId", check.auth ,albumController.list);
router.put("/update/:albumId", check.auth ,albumController.update);
router.post("/upload/:id", [check.auth, uploads.single("file0")], albumController.upload);
router.get("/image/:file", albumController.image);
router.delete("/deleteAlbum/:id", check.auth, albumController.deleteAlbum);

module.exports = router;