const validator = require("validator");

const validate = (params) => {
    let name = !validator.isEmpty(params.name) && validator.isLength(params.name, { min: 3, max: undefined }) && validator.isAlpha(params.name, "es-ES", {ignore: ' '});
    let nick = !validator.isEmpty(params.nick) && validator.isLength(params.nick, { min: 2, max: undefined });
    let email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
    let password = !validator.isEmpty(params.password);

    if (params.surname) {
        let surname = !validator.isEmpty(params.surname) && validator.isLength(params.surname, { min: 3, max: undefined }) && validator.isAlpha(params.surname, "es-ES", {ignore: ' '});

        if (!surname) {
            throw new Error("No se ha superado la validación en el apellido!!");
        } else {
            console.log("Validación superada!!")
        }
    }



    if (!name || !nick || !email || !password) {
        throw new Error("No se ha superado la validación!!");
    } else {
        console.log("Validación superada!!")
    }
}

module.exports = {
    validate
}