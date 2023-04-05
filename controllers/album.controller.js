const Album = require('../models/album.model');
const Song = require("../models/song.model");
const fs = require('fs');
const path = require('path');

const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Controlador de album"
    });
};

const save = (req, res) => {

    //Datos del body
    let params = req.body;

    //Crear objeto
    let album = new Album(params);

    //Guardar
    album.save((error, albumStorage) => {
        if (error || !albumStorage) {
            return res.status(500).send({
                status: "error",
                message: "Error al guardar el album"
            });
        }
        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            album: albumStorage
        });
    });
}

const oneAlbum = (req, res) => {

    //id del album url
    const albumId = req.params.id;

    //find y popular info de artista
    Album.findById(albumId).populate("artist").exec((error, album) => {

        if (error || !album) {
            //Devolver respuesta
            return res.status(404).send({
                status: "error",
                message: "Album no encontrado"
            });
        }
        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            album
        });
    });
}

const list = (req, res) => {
    //Obtener id de artista por url
    const artistId = req.params.artistId;

    //Obtener todos los albums de la DB de un artista
    if (!artistId) {
        return res.status(404).send({
            status: "error",
            message: "No se ha encntrado el artista"
        });
    }

    Album.find({ "artist": artistId }).populate("artist").exec((error, albums) => {

        if (error || !albums) {
            //Devolver respuesta
            return res.status(404).send({
                status: "error",
                message: "No se han encontrado los albums"
            });
        }

        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            albums: albums
        });
    });
}

const update = (req, res) => {

    //Obtener parametro de url
    const albumId = req.params.albumId;

    //Recoger body
    let params = req.body;

    //find and update
    Album.findByIdAndUpdate(albumId, params, { new: true }).exec((error, albumUpdated) => {
        if (error || !albumUpdated) {
            //Devolver respuesta
            return res.status(599).send({
                status: "error",
                message: "No se ha podido actualizar el album"
            });
        }

        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            albumUpdated: albumUpdated
        });
    })
}

const upload = (req, res) => {

    //Configuración de subida (multer)

    //Id de url
    let albumId = req.params.id;

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
    if (extension != "png" && extension != "jpg" && extension != "gif" && extension != "jpeg") {
        //Borrar archivo
        const filePath = req.file.path;
        const fileDeleted = fs.unlinkSync(filePath);

        return res.status(404).send({
            status: "error",
            message: "La extensión no es valida"
        });
    }

    //Guardar imagen en DB
    Album.findOneAndUpdate({ "_id": albumId }, { "image": req.file.filename }, { new: true }, (error, albumUpdated) => {
        if (error || !albumUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error al subir imagen"
            });
        }

        //Devoler respuesta
        return res.status(200).send({
            status: "success",
            album: albumUpdated
        });
    });
}

const image = (req, res) => {

    //Obtener el parametro de la url
    const file = req.params.file;

    //Path de la imagen
    const filePath = "./uploads/albums/" + file;

    //Comprobar si existe
    fs.stat(filePath, (error, exists) => {
        if (error || !exists) {
            return res.status(404).send({
                status: "error",
                message: "La imagen no existe"
            });
        }

        //Devolver el fichero
        return res.sendFile(path.resolve(filePath));
    });
}

const deleteAlbum = async (req, res) => {

    //Obtener id de url
    const albumId = req.params.id;

    try {
        //Remove de albums
        const albumRemoved = await Album.findById(albumId).remove();
        const songRemoved = await Song.find({ 'album': albumId }).remove();

        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            albumRemoved
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar el album o alguno de sus elementos",
            error: error
        });
    }
}
module.exports = {
    prueba,
    save,
    oneAlbum,
    list,
    update,
    upload,
    image,
    deleteAlbum
}