
const Song = require("../models/song.model");
const fs = require('fs');
const path = require('path');


const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Controlador de song"
    })
};

const save = (req, res) => {
    //Obtener datos del body
    let params = req.body;

    //Crear objeto Song
    let song = new Song(params);

    //Guardar
    song.save((error, songStoraged) => {
        if (error || !songStoraged) {
            //Devoler respuesta
            return res.status(500).send({
                status: "error",
                message: "No se pudo guardar la cancion",
                error
            });
        }
        //Devoler respuesta
        return res.status(200).send({
            status: "success",
            songStoraged: songStoraged
        });
    });
}

const one = (req, res) => {

    //Obtener el id de la url
    let songId = req.params.id;

    //FindById
    Song.findById(songId).populate("album").exec((error, song) => {
        if (error || !song) {
            //Devoler respuesta
            return res.status(404).send({
                status: "error",
                message: "No se ha encontrado la canción"
            });
        }
        //Devoler respuesta
        return res.status(200).send({
            status: "success",
            song: song
        });
    });
}

const list = (req, res) => {

    //Obtener id de album por url
    let albumId = req.params.albumId;

    //Consultar en base de datos
    Song.find({ "album": albumId })
        .populate({
            path: "album",
            populate: {
                path: "artist",
                model: "Artist"
            }
        })
        .sort("track")
        .exec((error, songs) => {
            if (error || !songs) {
                //Devoler respuesta
                return res.status(404).send({
                    status: "error",
                    message: "No se han encontrado canciones"
                });
            }
            //Devoler respuesta
            return res.status(200).send({
                status: "success",
                songs: songs
            });
        });
}

const update = (req, res) => {

    //Parametro idSong url
    let songId = req.params.songId;

    //Datos a guardar
    let data = req.body;

    //Find And Update
    Song.findByIdAndUpdate(songId, data, { new: true }, (error, songUpdated) => {
        if (error || !songUpdated) {
            //Devoler respuesta
            return res.status(200).send({
                status: "error",
                message: "No se pudo actualizar la canción"
            });
        }
        //Devoler respuesta
        return res.status(200).send({
            status: "success",
            songUpdated: songUpdated
        });
    })
}

const deleteSong = (req, res) => {

    const songId = req.params.songId;

    Song.findByIdAndDelete(songId, (error, songDeleted) => {
        if (error || !songDeleted) {
            //Devoler respuesta
            return res.status(500).send({
                status: "error",
                message: "Error al eliminar una canción"
            });
        }
        //Devoler respuesta
        return res.status(200).send({
            status: "success",
            songDeleted: songDeleted
        });
    });
}

const upload = (req, res) => {

    //Configuración de subida (multer)

    //Id de url
    let songId = req.params.id;

    //Recoger fichero de imagen y comprobar si existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "La petición no incluye la imagen"
        });
    }

    //Obtener nombre del archivo
    let image = req.file.originalname;

    //Obtener info de imagen
    const imageSplit = image.split("\.")
    const extension = imageSplit[1];

    //Comprobar si la extensión es valida
    if (extension != "mp3" && extension != "ogg") {
        //Borrar archivo
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        return res.status(404).send({
            status: "error",
            message: "La extensión no es valida"
        });
    }

    //Guardar imagen en DB
    Song.findOneAndUpdate({ "_id": songId }, { "file": req.file.filename }, { new: true }, (error, songUpdated) => {
        if (error || !songUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error al subir imagen"
            });
        }

        //Devoler respuesta
        return res.status(200).send({
            status: "success",
            song: songUpdated
        });
    });
}

const audio = (req, res) => {

    //Obtener el parametro de la url
    const file = req.params.file;

    //Path de la imagen
    const filePath = "./uploads/songs/" + file;

    //Comprobar si existe
    fs.stat(filePath, (error, exists) => {
        if (error || !exists) {
            return res.status(404).send({
                status: "error",
                message: "La cancion no existe"
            });
        }

        //Devolver el fichero
        return res.sendFile(path.resolve(filePath));
    });
}
module.exports = {
    prueba,
    save,
    one,
    list,
    update,
    deleteSong,
    upload,
    audio
}