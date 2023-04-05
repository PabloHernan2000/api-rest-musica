const Artist = require('../models/artist.model');
const Album = require('../models/album.model');
const Song = require('../models/song.model');
const mongoosePagination = require('mongoose-pagination');
const fs = require('fs');
const path = require('path');

const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Controlador de artist"
    })
};

const save = (req, res) => {

    //Obtener datos del body
    let params = req.body;

    //Crear pbjeto
    let artist = new Artist(params);

    //Guardar
    artist.save((error, artistStored) => {
        if (error || !artistStored) {
            return res.status(400).send({
                status: "error",
                message: "No se ha guardado el artista"
            });
        }
        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            artistStored
        });
    });
}

const oneArtist = (req, res) => {

    //Obtener parametro por url
    let artistId = req.params.id;

    //Find
    Artist.findById(artistId, (error, artist) => {

        if (error || !artist) {
            return res.status(404).send({
                status: "error",
                message: "No se ha encontrado el artista"
            });
        }

        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            artist
        });
    });
}

const artistsList = (req, res) => {

    //Obtener pagina
    let page = 1;
    if (req.params.page) { page = parseInt(req.params.page) }


    //Elementos por pagina
    const itemsPerPage = 5;

    //Find, ordednar y paginar
    Artist.find()
        .sort("name")
        .paginate(page, itemsPerPage, (error, artists, total) => {
            if (error || !artists) {
                return res.status(404).send({
                    status: "error",
                    message: "No se ha encontrado artistas"
                });
            }
            //Devolver respuesta
            return res.status(200).send({
                status: "success",
                total,
                itemsPerPage,
                page,
                totalPages: Math.ceil(total / itemsPerPage),
                artists
            });
        });
}

const update = (req, res) => {

    //Id artista de url
    const artistId = req.params.id;

    //Datos body
    const data = req.body;

    //Buscar y actualizar artista
    Artist.findByIdAndUpdate(artistId, data, { new: true }, (error, artistUpdated) => {
        if (error || !artistUpdated) {
            //Devolver respuesta
            return res.status(500).send({
                status: "error",
                message: "No se pudo actualizar el artista"
            });
        }
        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            artist: artistUpdated
        });
    })
}

const deleteArtist = async (req, res) => {

    //Obtener id de url
    const artistId = req.params.id;

    try {
        //Hacer consulta para buscar y eliminar el artista con await
        const artistRemoved = await Artist.findByIdAndDelete(artistId);
        //Remove de albums
        const albumRemoved = await Album.find({"artist": artistId});
        albumRemoved.forEach( async (album) => {
             const songRemoved = await Song.find({'album': album._id}).remove();

             album.remove();
        });

        //Devolver respuesta
        return res.status(200).send({
            status: "success",
            artistRemoved
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar el artista o alguno de sus elementos",
            error: error
        });
    }
}

const upload = (req, res) => {

    //Configuración de subida (multer)

    //Id de url
    let artistId = req.params.id;

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
    Artist.findOneAndUpdate({ "_id": artistId }, { "image": req.file.filename }, { new: true }, (error, artistUpdated) => {
        if (error || !artistUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error al subir imagen"
            });
        }

        //Devoler respuesta
        return res.status(200).send({
            status: "success",
            artist: artistUpdated
        });
    });
}

const image = (req, res) => {

    //Obtener el parametro de la url
    const file = req.params.file;

    //Path de la imagen
    const filePath = "./uploads/artists/" + file;

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
module.exports = {
    prueba,
    save,
    oneArtist,
    artistsList,
    update,
    deleteArtist,
    upload,
    image
}