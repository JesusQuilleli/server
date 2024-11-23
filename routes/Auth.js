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
    // Buscar el usuario por correo
    const user = await findAdminByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Correo no registrado.",
        resultado: null,
      });
    }

    const resultado = await checkUser(email, password);

    if(resultado){
      res.status(200).send({message:"Usuario validado correctamente", resultado})
    } else {
      res.status(401).send({ message: "Contraseña Incorrecta", result: null });
    }
   
  } catch (error) {
    console.error("Error al buscar al usuario:", error);
    res.status(500).json({
      success: false,
      message: "Ha ocurrido un error al procesar la solicitud.",
      resultado: null,
    });
  }
});

export { routerAuth };
