import bcrypt from "bcrypt";
import {pool} from "./../helpers/index.js"

//FUNCION REGISTRAR ADMINISTRADOR
export async function registerAdmin(name, password, email, rol_id) {
   // Encriptar la contraseña
   const saltRounds = 10;
   const hashedPassword = await bcrypt.hash(password, saltRounds);
 
   // Insertar en la base de datos
   const [results] = await pool.query(
     "INSERT INTO ADMINISTRADORES (NOMBRE, PASSWORD, EMAIL, ROL_ID) VALUES (?, ?, ?, ?)",
     [name, hashedPassword, email, rol_id]
   );
 
   return results;
 }
 
 //VALIDAR USUARIO EN LA BASE DE DATOS, DE LA TABLA ADMINISTRADORES
 export async function checkUser(email, password) {
   const [rows] = await pool.query(
     `SELECT ID_ADMINISTRADOR, EMAIL, NOMBRE, PASSWORD FROM ADMINISTRADORES WHERE EMAIL = ?`,
     [email]
   );
 
   if (rows.length < 1) {
     return null;
   } else {
     const datosAdmin = rows[0];
     const passwordCompare = await bcrypt.compare(password, datosAdmin.PASSWORD);
 
     if (passwordCompare) {
       return {
         idAdmin: datosAdmin.ID_ADMINISTRADOR,
         email: datosAdmin.EMAIL,
         nombre: datosAdmin.NOMBRE,
       };
     } else {
       return null;
     }
   }
 }