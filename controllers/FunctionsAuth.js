import bcrypt from "bcrypt";
import { pool } from "./../helpers/index.js"

//FUNCION REGISTRAR ADMINISTRADOR --VERIFICADO
export async function registerAdmin(name, password, email) {
   // Encriptar la contraseña
   const saltRounds = 10;
   const hashedPassword = await bcrypt.hash(password, saltRounds);
 
   // Insertar en la base de datos
   const [results] = await pool.query(
     "INSERT INTO ADMINISTRADORES (NOMBRE, PASSWORD, EMAIL) VALUES (?, ?, ?)",
     [name, hashedPassword, email]
   );
 
   return results;
 };

 //VALIDAR SI YA EXISTE EL CORREO --VERIFICADO
export async function findAdminByEmail(email) {
  const [results] = await pool.query(
    "SELECT EMAIL FROM ADMINISTRADORES WHERE EMAIL = ?",
    [email]
  );
  return results.length > 0 ? results[0] : null; // Retorna el usuario si existe o null si no existe
};
 
 //VALIDAR USUARIO EN LA BASE DE DATOS, DE LA TABLA ADMINISTRADORES --VERIFICADO
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