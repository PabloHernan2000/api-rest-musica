const mongoose = require("mongoose");

const connect = async () => {

    try {
        mongoose.set('strictQuery', true);
        mongoose.connect("mongodb://127.0.0.1:27017/api_rest_musica");
        console.log("Connection to database 'api_rest_musica' successful");
    } catch (error) {
        throw new Error("Failed to try connect to database!!")
    }
}

module.exports = {connect}