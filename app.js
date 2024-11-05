import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";

import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";


//IMPORTS RUTAS
import { routerAuth } from "./routes/Auth.js";
import { routerProducts } from "./routes/Products.js";
import { routesClients } from "./routes/Clients.js";

//PUERTO DESDE EL .ENV
const PORT = process.env.MYSQLDB_PORT_NODE;

//IMAGENES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//DECLARACION DE EXPRESS PARA MANEJO DE PETICIONES HTTPS
const app = express();

//EXPONER CARPETA UPLOADS
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware para parsear el cuerpo de las peticiones
app.use(express.json());
app.use(fileUpload());
app.use(cors());

//RUTAS AUTENTICACION
app.use("/", routerAuth);

//RUTAS PRODUCTOS
app.use("/", routerProducts);

//RUTAS CLIENTES
app.use("/", routesClients);

app.get("/ping", (res) =>{
  res.json('Hola Desde Internet');
});

//ESCUCHANDO EL SERVIDOR
app.listen(PORT, () => {
  console.log("Server running on port 8800");
});