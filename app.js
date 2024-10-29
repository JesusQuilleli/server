import express from "express";

//IMPORTS RUTAS
import {router} from './routes/index.js'

import {routerAuth} from './routes/Auth.js'

//PUERTO DESDE EL .ENV
const PORT = process.env.MYSQLDB_PORT_NODE;

//DECLARACION DE EXPRESS PARA MANEJO DE PETICIONES HTTPS
const app = express();

// Middleware para parsear el cuerpo de las peticiones
app.use(express.json());

//EJEMPLO
app.use("/", router);

//RUTAS AUTENTICACION
app.use("/", routerAuth);

//RUTAS PRODUCTOS

//ESCUCHANDO EL SERVIDOR
app.listen(PORT, () => {
  console.log("Server running on port 8800");
}); 
