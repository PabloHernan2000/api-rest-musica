const express = require("express")
const cors = require("cors");
const connection = require("./database/connection");

console.log("API REST con node para app de música iniciada!!")

connection.connect();

let app = express();
const port = 3910;

//Configurar cors
app.use(cors());

//Conertir datos a JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Importar rutas
const userRoutes = require("./routes/user.routes");
const albumRoutes = require("./routes/album.routes");
const songRoutes = require("./routes/song.routes");
const artistRoutes = require("./routes/artist.routes");

app.use("/api/user", userRoutes);
app.use("/api/album", albumRoutes);
app.use("/api/song", songRoutes);
app.use("/api/artist", artistRoutes);


app.listen(port, () => {
    console.log("Servidor iniciado en el puerto " + port);
});