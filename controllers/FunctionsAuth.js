import bcrypt from "bcrypt";
import { pool } from "./../helpers/index.js";

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
  if (results.length > 0) {
    const admin = results[0];
    return admin; // Retorna el objeto completo con el ID_ADMINISTRADOR explícitamente
  }
  return null; // Si no se encuentra el usuario, retorna null
};

//VALIDAR USUARIO EN LA BASE DE DATOS, DE LA TABLA ADMINISTRADORES --VERIFICADO
export async function checkUser(email, password) {
  const [rows] = await pool.query(
    `SELECT ID_ADMINISTRADOR, EMAIL, NOMBRE, PASSWORD FROM ADMINISTRADORES WHERE EMAIL = ?`,
    [email]
  );

  if (rows.length < 1) {
    return null; // Usuario no encontrado
  } else {
    const datosAdmin = rows[0];

    // Comparar la contraseña ingresada con la almacenada
    const passwordCompare = await bcrypt.compare(password, datosAdmin.PASSWORD);

    if (passwordCompare) {
      return {
        idAdmin: datosAdmin.ID_ADMINISTRADOR,
        email: datosAdmin.EMAIL,
        nombre: datosAdmin.NOMBRE
      };
    } else {
      return null; // Contraseña incorrecta
    }
  }
};

//TOKENS AUTH
export async function sessionTokens(admin_ID, Token) {
  const response = await pool.query('REPLACE INTO SESSION (ADMINISTRADOR_ID, TOKEN) VALUES (?, ?)', [admin_ID,Token])

  if(response){
    return response
  } else {
    return null
  }
};

export async function deleteToken(admin_ID, Auth) {
  const [result] = await pool.query(
    "DELETE FROM SESSION WHERE ADMINISTRADOR_ID = ? AND TOKEN = ?",
    [admin_ID, Auth]
  );

  if(result){
    return result
  } else {
    return null
  }

};

export async function checkActiveSession(adminId) {
  try {
    // Consultar en la base de datos si hay un token activo para este adminId
    const [result] = await pool.query(
      "SELECT * FROM SESSION WHERE ADMINISTRADOR_ID = ? AND TOKEN IS NOT NULL", 
      [adminId]
    );

    if (result && result.length > 0) {
      // Si se encuentra una sesión con un token activo
      return true;
    }

    // Si no se encuentra un token activo
    return false;
  } catch (error) {
    console.error("Error al verificar sesión activa:", error);
    throw new Error("Error al verificar sesión activa.");
  }
};
