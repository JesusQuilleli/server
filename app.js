import express from "express";
import fileUpload from "express-fileupload";
import cors from "cors";
import os from "os";

import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

//IMPORTS RUTAS
import { routerAuth } from "./routes/Auth.js";
import { routerProducts } from "./routes/Products.js";
import { routesClients } from "./routes/Clients.js";
import { routesVentas } from "./routes/Ventas.js";
import { routesTasa } from "./routes/Tasas.js";
import { routesPagos } from "./routes/Pagos.js";
import { routesNotificaciones } from "./routes/Notificaciones.js";
import { routesRestorePassword } from "./routes/restorePassword.js";
import { routesDevoluciones } from "./routes/Devoluciones.js";

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

//RUTAS AUTENTICACION --VERIFICADO
app.use("/", routerAuth);

//RUTAS PRODUCTOS --VERIFICADO
app.use("/", routerProducts);

//RUTAS CLIENTES --VERIFICADO
app.use("/", routesClients);

//RUTAS VENTAS --VERIFICADO
app.use("/", routesVentas);

//RUTAS TASAS --VERIFICADO
app.use("/", routesTasa);

//RUTA PAGOS --VERIFICADO
app.use("/", routesPagos);

//RUTAS NOTIFICACIONES --VERIFICADO
app.use("/", routesNotificaciones);

//RUTA RESTORE PASSWORD
app.use("/", routesRestorePassword);

//RUTA RESTORE PASSWORD
app.use("/", routesDevoluciones);

//PRUEBA
app.get("/saludo", (req, res) => {
  try {
    res.json("Hola Julian desde Internet :D");
  } catch (err) {
    console.log("Error", err);
  }
});

//ESCUCHANDO EL SERVIDOR
app.listen(PORT, () => {
  console.log("Server running on port 8800");
});

