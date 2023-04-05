//Importar dependencias
const jwt = require('jwt-simple');
const moment = require('moment');

//Definir clave secreta para generar el token
const secret = 'CLAVE_S3CRETA_d3_ezte_pr0y3cto';

//Crear función para generar tokens
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.id,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        password: user.password,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix(),
    };

    //Devolver token
    return jwt.encode(payload, secret);
};

//Exportar modulo
module.exports = {
    secret,
    createToken
};