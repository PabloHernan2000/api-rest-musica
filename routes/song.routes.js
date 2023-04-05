const express = require("express");
const check = require("../middlewares/auth.middleware");

//Cargar Router
const router = express.Router();

//Importar controlador user
const songController = require("../controllers/song.controller");

//Configuración de subida
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/songs/");
    },
    filename: (req, file, cb) => {
        cb(null, "song-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage })

router.get("/prueba", songController.prueba);
router.post("/save", songController.save);
router.get("/one/:id", songController.one);
router.get("/list/:albumId", songController.list);
router.put("/update/:songId", songController.update);
router.delete("/delete/:songId", songController.deleteSong);
router.post("/upload/:id", [check.auth, uploads.single("file0")], songController.upload);
router.get("/audio/:file", songController.audio);

module.exports = router;