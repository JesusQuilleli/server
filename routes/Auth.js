import express from "express";

import { registerAdmin, checkUser } from "../controllers/FunctionsAuth.js";

const routerAuth = express.Router();

//PETICION POST REGISTRAR ADMINISTRADOR -- END POINT
routerAuth.post("/registerAdmin", async (req, res) => {
  const { name, password, email} = req.body;

  try {
    const result = await registerAdmin(name, password, email);
    res
      .status(200)
      .send({ message: "Administrador registrado con éxito", id: result });
  } catch (error) {
    console.error("Error al registrar administrador:", error);
    res.status(500).send("Error al registrar administrador");
  }
});

// PETICIÓN PARA VERIFICAR SI LOS DATOS INGRESADOS SON CORRECTOS Y AUTENTICAR INICIO DE SESIÓN
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
