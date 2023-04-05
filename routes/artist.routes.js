const express = require("express");
const check = require("../middlewares/auth.middleware");

//Cargar Router
const router = express.Router();

//Importar controlador artist
const artistController = require("../controllers/artist.controller");

//Configuración de subida
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/artists/");
    },
    filename: (req, file, cb) => {
        cb(null, "artist-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage })

router.get("/prueba", artistController.prueba);
router.post("/save", check.auth ,artistController.save);
router.get("/one-artist/:id", check.auth ,artistController.oneArtist);
router.get("/list/:page?", check.auth ,artistController.artistsList);
router.put("/update/:id", check.auth, artistController.update);
router.delete("/deleteArtist/:id", check.auth, artistController.deleteArtist);
router.post("/upload/:id", [check.auth, uploads.single("file0")], artistController.upload);
router.get("/image/:file", artistController.image);

module.exports = router;