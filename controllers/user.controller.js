const validate = require("../helpers/validate.helper");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwtHelper = require('../helpers/jwt.helper');
const fs = require('fs');
const path = require('path');

const prueba = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Controlador de usuario"
    })
};

const register = (req, res) => {

    //Obtener datos de la petición
    let params = req.body;

    //Comprobar si llegan correctamente
    if (!params.name || !params.nick || !params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Validar datos
    try {
        validate.validate(params);
    } catch (error) {
        console.log(error)

        return res.status(400).send({
            status: "error",
            message: "Validación no superada!!"
        });
    }
    //Control de ususarios duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    }).exec(async (error, user) => {
        if (error || !user) {
            return res.status(500).send({
                status: "error",
                message: "Error en la consulta de control de usuarios"
            });
        }
        if (user && user.length >= 1) {
            return res.status(200).send({
                status: "error",
                message: "El usuario ya existe"
            });
        }
        //Cifrar contraseña
        let pwd = await bcrypt.hash(params.password, 10)
        params.password = pwd;

        //Crear nuevo usuario
        let userToSave = new User(params);

        //Guardar usuario en DB
        userToSave.save((error, userStored) => {
            if (error || !userStored) {
                return res.status(200).send({
                    status: "error",
                    message: "Error al registrarse"
                });
            }
            //Limpiar el objeto a devolver
            let userCreated = userStored.toObject();
            delete userCreated.password;
            delete userCreated.role;
            //Devoler respuesta
            return res.status(200).send({
                status: "success",
                message: "Registro completado exitosamente",
                userCreated
            });
        })
    });
}

const login = (req, res) => {

    //Obtener parametros de petición
    let params = req.body;

    //Comprobar si llegan
    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    //Buscar en DB
    User.findOne({ "email": params.email })
        .exec((error, user) => {
            if (error || !user) {
                return res.status(404).send({
                    status: "error",
                    message: "No existe el usuario"
                });
            }

            //Comprobar la contraseñá
            const pwd = bcrypt.compareSync(params.password, user.password);

            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    message: "Login incorrecto"
                });
            }

            //Limpiar objetos
            let identityUser = user.toObject();
            delete identityUser.password;
            delete identityUser.role;

            //Obtener token jwt (crear servicio para crear el token)

            const token = jwtHelper.createToken(user);

            //Devolver datos usuario y token

            //Devoler respuesta
            return res.status(200).send({
                status: "success",
                user: identityUser,
                token
            });
        });
};

const profile = (req, res) => {

    //Obtener id de url
    const id = req.params.id;

    //Consultar para obtener los datos del perfil
    User.findById(id, (error, user) => {
        if (error || !user) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe"
            });
        }

        //Devoler respuesta
        return res.status(200).send({
            status: "success",
            user
        });
    })
};

const update = (req, res) => {

    //Obtener datos usuario identificado
    const userIdentity = req.user;

    //Obtener datos a actualizar body
    let userToUpdated = req.body;

    //Validar datos
    try {
        validate.validate(userToUpdated);
    } catch (error) {
        console.log(error)

        return res.status(400).send({
            status: "error",
            message: "Validación no superada!!"
        });
    }

    //Conmprobar si el usuario existe
    User.find({
        "$or": [
            { email: userToUpdated.email.toLowerCase() },
            { nick: userToUpdated.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {

        if (error) {
            return res.status(500).send({
                status: "error",
                message: "Error en la consulta de usuarios"
            });
        }

        //Comprobar si el usuario existe y no soy yo (identificado)
        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentity.id) { userIsset = true; }
        })

        //Si existe devolver respuesta
        if (userIsset == true) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        //Cifrar password si llega
        if (userToUpdated.password) {
            let pwd = await bcrypt.hash(userToUpdated.password, 10);
            userToUpdated.password = pwd;
        } else {
            delete userToUpdated.password;
        }

        //Buscar y actualizar usuario en DB
        try {
            let userUpdated = await User.findByIdAndUpdate({ "_id": userIdentity.id }, userToUpdated, { new: true });

            if (!userToUpdated) {
                return res.status(400).send({
                    status: "error",
                    message: "Error al actualizar"
                });
            }

            //Devoler respuesta
            return res.status(200).send({
                status: "success",
                user: userToUpdated
            });
        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar"
            });
        }
    });
}

const upload = (req, res) => {

    //Configuración de subida (multer)

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
    User.findOneAndUpdate({ "_id": req.user.id }, { "image": req.file.filename }, { new: true }, (error, userUpdated) => {
        if (error || !userUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error al subir imagen"
            });
        }

        //Devoler respuesta
        return res.status(200).send({
            status: "success",
            user: userUpdated
        });
    });
}

const avatar = (req, res) => {

    //Obtener el parametro de la url
    const file = req.params.file;

    //Path de la imagen
    const filePath = "./uploads/avatars/" + file;

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
    register,
    login,
    profile,
    update,
    upload,
    avatar
}