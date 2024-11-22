import express from "express";

import {
  registerAdmin,
  checkUser,
  findAdminByEmail,
  marcarSesionActiva,
  marcarSesionInactiva
} from "../controllers/FunctionsAuth.js";

const routerAuth = express.Router();

//PETICION POST REGISTRAR ADMINISTRADOR -- END POINT --VERIFICADO
routerAuth.post("/registerAdmin", async (req, res) => {
  const { name, password, email } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin) {
      return res.status(409).send({ message: "El correo ya está registrado" });
    }
    // Registrar nuevo administrador si el correo no existe
    const result = await registerAdmin(name, password, email);
    if (result) {
      res.status(200).send({
        message: "Administrador registrado con éxito",
        id: result.insertId,
      });
    } else {
      res.status(401).send({ message: "Datos Incorrectos", result: null });
    }
  } catch (error) {
    console.error("Error al registrar administrador:", error);
    res.status(500).send("Error al registrar administrador");
  }
});

// PETICIÓN PARA VERIFICAR SI LOS DATOS INGRESADOS SON CORRECTOS Y AUTENTICAR INICIO DE SESIÓN --VERIFICADO
routerAuth.post("/autenticacionInicio", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const user = await findAdminByEmail(email);

    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "Correo no registrado." });
    }

    const admin = await checkUser(email, password); // Llamar a checkUser que ya activa la sesión si es necesario

    if (!admin) {
      return res
        .status(404)
        .send({ success: false, message: "Correo o contraseña incorrectos." });
    }

    if (admin.error == 'Sesion Activa') {
      return res
        .status(404)
        .send({ success: false, message: "Sesion Activa." });
    }

    // Si la sesión no está activa y la autenticación es exitosa, retornamos el estado de la sesión
    res.status(200).send({
      success: true,
      message: "Sesión activada exitosamente.",
      user: {
        idAdmin: admin.idAdmin,
        email: admin.email,
        nombre: admin.nombre,
        sesionActiva: admin.sesionActiva,
      },
    });
  } catch (error) {
    console.error("Error durante la autenticación:", error);
    res.status(500).send({
      success: false,
      message: "Ha ocurrido un error al procesar la solicitud.",
    });
  }
});

//CERRAR SESION
routerAuth.post("/cerrarSesion", async (req, res) => {
  const { idAdmin } = req.body;

  try {
    const respuesta = await marcarSesionInactiva(idAdmin);

    if (respuesta.success) {
      res.status(200).send({ message: "Sesión cerrada con éxito." });
    } else {
      res.status(404).send({ message: respuesta.message });
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    res.status(500).send({ message: "Error interno al cerrar sesión." });
  }
});

export { routerAuth };
