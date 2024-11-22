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
      // Respuesta específica para un correo no registrado
      return res
        .status(404)
        .send({ success: false, message: "Correo no registrado." });
    }

    // Verificar si ya tiene una sesión activa
    if (user.SESION_ACTIVA) {
      return res
        .status(403) // Forbidden
        .send({
          success: false,
          message: "Esta cuenta ya tiene una sesión activa.",
        });
    }

    // Verificar si la contraseña es correcta
    const isPasswordCorrect = await checkUser(email, password);

    if (!isPasswordCorrect) {
      // Respuesta específica para contraseña incorrecta
      return res
        .status(401) // Unauthorized
        .send({ success: false, message: "Contraseña incorrecta." });
    }

    // Si la autenticación es exitosa, marcar la sesión como activa
    await marcarSesionActiva(user.ID_ADMINISTRADOR);

    // Respuesta exitosa con los detalles del usuario
    res.status(200).send({
      success: true,
      message: "Autenticado con éxito.",
      resultado: {  // Cambié 'user' por 'resultado'
        idAdmin: user.ID_ADMINISTRADOR,
        nombre: user.EMAIL,  // Suponiendo que 'nombre' es el correo del usuario
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
