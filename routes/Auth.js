import express from "express";

import {
  registerAdmin,
  checkUser,
  findAdminByEmail,
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
    const resultado = await checkUser(email, password);

    if (resultado) {
      // Si la autenticación fue exitosa, devolver el ID_ADMINISTRADOR y un mensaje de éxito
      res.status(200).send({ message: "Autenticado con éxito", resultado });
    } else {
      // Si no fue exitoso, devolver null y un mensaje de error
      res
        .status(401)
        .send({ message: "Email o contraseña incorrectos", resultado: null });
    }
  } catch (error) {
    console.log("Ha ocurrido un error al Autenticar", error);
    res.status(500).send("Error al autenticar usuario");
  }
});

export { routerAuth };
