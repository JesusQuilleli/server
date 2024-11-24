import express from "express";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv"; //PEDIR AYUDA AL PROFE YOHAN PARA HACER QUE TOME EL VALOR DEL ENV

import {
  registerAdmin,
  checkUser,
  findAdminByEmail,
  checkActiveSession,
  sessionTokens,
  deleteToken
} from "../controllers/FunctionsAuth.js";

const routerAuth = express.Router();

dotenv.config();

const jwtSecret = 'devjesus';


//PETICION POST REGISTRAR ADMINISTRADOR -- END POINT --VERIFICADO
// routerAuth.post("/registerAdmin", async (req, res) => {
//   const { name, password, email } = req.body;

//   try {
//     // Verificar si el correo ya está registrado
//     const existingAdmin = await findAdminByEmail(email);
//     if (existingAdmin) {
//       return res.status(409).send({ message: "El correo ya está registrado" });
//     }
//     // Registrar nuevo administrador si el correo no existe
//     const result = await registerAdmin(name, password, email);
//     if (result) {
//       res.status(200).send({
//         message: "Administrador registrado con éxito",
//         id: result.insertId,
//       });
//     } else {
//       res.status(401).send({ message: "Datos Incorrectos", result: null });
//     }
//   } catch (error) {
//     console.error("Error al registrar administrador:", error);
//     res.status(500).send("Error al registrar administrador");
//   }
// });

// routerAuth.post("/autenticacionInicio", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Verificar si el correo ya está registrado
//     const user = await findAdminByEmail(email);

//     if (!user) {
//       // Si el correo no está registrado, devolver mensaje indicando que debe registrarse
//       return res
//         .status(404)
//         .send({ message: "Correo no registrado. Debes registrarte." });
//     }

//     // Verificar si ya hay una sesión activa
//     const activeSession = await checkActiveSession(user.ID_ADMINISTRADOR);

//     if (activeSession) {
//       return res.status(400).send({ message: "Ya hay una sesión activa para este administrador." });
//     }

//     // Si el correo está registrado, proceder a la autenticación con la contraseña
//     const resultado = await checkUser(email, password); 

//     if (resultado) {
//       // Generar el token JWT
//       const token = jwt.sign(
//         { AdminId: resultado.idAdmin },
//         jwtSecret,
//         { expiresIn: "1d" }
//       );

//       // Insertar el token en la tabla SESSION
//       const sessionResponse = await sessionTokens(resultado.idAdmin, token);

//       if (sessionResponse) {
//         // Si la sesión se guardó correctamente, responder con éxito
//         res.status(200).send({
//           message: "Autenticado con éxito",
//           token, // Devolver el token al cliente
//           resultado,
//         });
//       } else {
//         // Si ocurre algún error al guardar el token
//         res.status(500).send({
//           message: "Error al guardar la sesión",
//         });
//       }
//     } else {
//       // Si no fue exitoso, devolver un mensaje de error
//       res.status(401).send({
//         message: "Contraseña incorrecta",
//         resultado: null,
//       });
//     }
//   } catch (error) {
//     console.log("Ha ocurrido un error al autenticar", error);
//     res.status(500).send("Error al autenticar usuario");
//   }
// });

routerAuth.post("/autenticacionInicio", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const user = await findAdminByEmail(email);

    if (!user) {
      // Si el correo no está registrado, devolver mensaje indicando que debe registrarse
      return res
        .status(404)
        .send({ message: "Correo no registrado. Debes registrarte." });
    }

    // Si el correo está registrado, proceder a la autenticación con la contraseña
    const resultado = await checkUser(email, password); 

    if (resultado) {
      // Generar el token JWT
      const token = jwt.sign(
        { AdminId: resultado.idAdmin },
        jwtSecret,
        { expiresIn: "1d" }
      );

      // Manejar sesión: verificar y crear token
      const sessionResponse = await sessionTokens(resultado.idAdmin, token);

      if (sessionResponse.success) {
        // Si la sesión se guardó correctamente, responder con éxito
        res.status(200).send({
          message: "Autenticado con éxito",
          token, // Devolver el token al cliente
          resultado,
        });
      } else {
        // Si ya existe una sesión activa, o ocurrió un error al guardar el token
        res.status(400).send({
          message: sessionResponse.message,
        });
      }
    } else {
      // Si no fue exitoso, devolver un mensaje de error
      res.status(401).send({
        message: "Contraseña incorrecta",
        resultado: null,
      });
    }
  } catch (error) {
    console.log("Ha ocurrido un error al autenticar", error);
    res.status(500).send("Error al autenticar usuario");
  }
});

routerAuth.post("/cerrarSesion", async (req, res) => {
  try {
    const { adminId, token } = req.body;

    if (!adminId || !token) {
      return res.status(400).send({ message: "Datos incompletos. adminId y token son requeridos." });
    }

    // Verificar el token con JWT
    const decoded = jwt.verify(token, jwtSecret);

    // Verificar que el adminId coincida con el AdminId del token
    if (decoded.AdminId !== adminId) {
      return res.status(403).send({ message: "Token no válido para este administrador." });
    }

    // Eliminar el token de la base de datos
    const result = await deleteToken(adminId, token);

    if (result.affectedRows > 0) {
      res.status(200).send({ message: "Sesión cerrada exitosamente." });
    } else {
      res.status(400).send({ message: "No se pudo cerrar la sesión." });
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);

    // Manejo de errores si el token es inválido o ha expirado
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).send({ message: "Token inválido o expirado." });
    }

    res.status(500).send({ message: "Error del servidor al cerrar sesión." });
  }
});

//FUNCIONAL
// routerAuth.post("/autenticacionInicio", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // Buscar el usuario por correo
//     const user = await findAdminByEmail(email);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "Correo no registrado.",
//         resultado: null,
//       });
//     }

//     const resultado = await checkUser(email, password);

//     if(resultado){
//       res.status(200).send({message:"Usuario validado correctamente", resultado})
//     } else {
//       res.status(401).send({ message: "Contraseña Incorrecta", result: null });
//     }
   
//   } catch (error) {
//     console.error("Error al buscar al usuario:", error);
//     res.status(500).json({
//       success: false,
//       message: "Ha ocurrido un error al procesar la solicitud.",
//       resultado: null,
//     });
//   }
// });

export { routerAuth };
