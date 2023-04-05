//Importar modulos
const jwt = require('jwt-simple');
const moment = require('moment');

//Importar clave secreta
const { secret } = require('../helpers/jwt.helper')

//Crear middleware
exports.auth = (req, res, next) => {

    //Comprobar si hay cabecera de autenticación
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            meessage: "La petición no tiene la cabecera de autenticación"
        });
    }

    //Limpiar token
    let token = req.headers.authorization.replace(/['"]+/g, "");

    //Decodificar token
    try {
        let payload = jwt.decode(token, secret);

        //Comprobar expiración
        if(payload.exp <= moment().unix()){
            return res.status(401).send({
                status: "error",
                meessage: "Token expirado"
            });
        }
        //Agregar datos de usuario a request para poder acceder a ellos
        req.user = payload;

    } catch (error) {
        return res.status(404).send({
            status: "error",
            meessage: "Token invalido"
        });
    }

    //Pasar a la ejecución de la acción
    next();
};

