import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import cron from "node-cron";
import bcrypt from "bcrypt";
import { pool } from "../helpers/index.js";

import { findAdminByEmail } from "../controllers/FunctionsAuth.js";

var routesRestorePassword = express.Router();

// Configura el transporte para enviar correos
const transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
     user: "shopmg698@gmail.com",
     pass: "mqimmnfemcpgdpcx",
   },
 });

//END - POINT RECUPERAR CONTRASEÑA --INSTALAR NODEMAILER EN EL BACKEND DEL SERVIDOR -NUBE --COMPARAR FECHAS
cron.schedule('*/2 * * * *', async () => {
   try {
     // Eliminar los códigos expirados
     await pool.query("DELETE FROM CODIGOS WHERE EXPIRACION < NOW()");
     console.log("Códigos expirados eliminados");
   } catch (error) {
     console.error("Error al eliminar códigos expirados:", error);
   }
 });
 
 routesRestorePassword.post("/enviar-codigo", async (req, res) => {
   const { email } = req.body;
 
   if (!email) {
     return res.status(400).json({ error: "Correo electrónico requerido" });
   }

   const user = await findAdminByEmail(email);

  if(!user){
    return res
    .status(404)
    .send({ message: "Correo no registrado. Debes registrarte." });
  }
 
   try {
     // Verifica si el correo está registrado
     const [rows] = await pool.query(
       "SELECT ID_ADMINISTRADOR FROM ADMINISTRADORES WHERE EMAIL = ?",
       [email]
     );
     if (rows.length === 0) {
       return res.status(404).json({ error: "Correo no registrado" });
     }
 
     // Verificar si ya existe un código válido para este correo
     const [existingCode] = await pool.query(
       "SELECT * FROM CODIGOS WHERE EMAIL = ? AND EXPIRACION > NOW()",
       [email]
     );
 
     if (existingCode.length > 0) {
       return res.status(429).json({
         error:
           "Ya se ha enviado un código a este correo. Inténtalo nuevamente más tarde.",
       });
     }
 
     // Generar un código seguro de 6 dígitos usando `crypto`
     const codigo = crypto.randomInt(100000, 1000000).toString(); // Genera un número entre 100000 y 999999
 
     const expiracion = new Date(Date.now() + 5 * 60 * 1000);  // 5 minutos
 
     await pool.query(
       "INSERT INTO CODIGOS (EMAIL, CODIGO, EXPIRACION) VALUES (?, ?, ?)",
       [email, codigo, expiracion]
     );
 
     // Enviar el código al correo del usuario
     await transporter.sendMail({
       from: '"Soporte" <shop-mg@gmail.com>',
       to: email,
       subject: "Código de recuperación",
       text: `Tu código de recuperación es: ${codigo}, caducará en 5 minutos!`,
       html: `<p>Tu código de recuperación es: <b>${codigo}</b></p>`,
     });
 
     res.status(200).json({ message: "Código enviado al correo electrónico" });
   } catch (error) {
     console.error("Error al enviar el código:", error);
     res.status(500).json({ error: "Error al enviar el código" });
   }
 });
 
 routesRestorePassword.post("/validar-codigo", async (req, res) => {
   const { email, codigo } = req.body;
 
   if (!email || !codigo) {
     return res.status(400).json({ error: "Correo y código son requeridos" });
   }
 
   try {
     // Verificar si el código existe y es válido
     const [result] = await pool.query(
       "SELECT * FROM CODIGOS WHERE EMAIL = ? AND CODIGO = ? AND EXPIRACION > NOW()",
       [email, codigo]
     );
 
     if (result.length === 0) {
       return res
         .status(400)
         .json({
           error:
             "Código inválido o expirado espere 5 minutos e intente nuevamente",
         });
     }
 
     // Eliminar el código después de validarlo
     await pool.query("DELETE FROM CODIGOS WHERE EMAIL = ? AND CODIGO = ?", [
       email,
       codigo,
     ]);
 
     res.status(200).json({ message: "Código validado correctamente" });
   } catch (error) {
     console.error("Error al validar el código:", error);
     res.status(500).json({ error: "Error al validar el código" });
   }
 });
 
 routesRestorePassword.post("/restablecer-password", async (req, res) => {
   const { email, nuevaPassword } = req.body;
 
   if (!email || !nuevaPassword) {
     return res
       .status(400)
       .json({ error: "Correo y nueva contraseña son requeridos." });
   }
 
   try {
     // Verificar si el correo existe en la base de datos
     const [rows] = await pool.query(
       "SELECT * FROM ADMINISTRADORES WHERE EMAIL = ?",
       [email]
     );
 
     if (rows.length === 0) {
       return res.status(404).json({ error: "Correo no registrado." });
     }
 
     // Encriptar la nueva contraseña
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(nuevaPassword, salt);
 
     // Actualizar la contraseña en la base de datos
     await pool.query(
       "UPDATE ADMINISTRADORES SET PASSWORD = ? WHERE EMAIL = ?",
       [hashedPassword, email]
     );
 
     res.status(200).json({ message: "Contraseña restablecida correctamente." });
   } catch (error) {
     console.error("Error al restablecer la contraseña:", error);
     res.status(500).json({ error: "Error al restablecer la contraseña." });
   }
 });

 export { routesRestorePassword }