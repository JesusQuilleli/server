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

//MARCAR SESION ACTIVA
async function marcarSesionActiva(adminId) {
  try {
    const [result] = await pool.query(
      "UPDATE ADMINISTRADORES SET SESION_ACTIVA = 1 WHERE ID_ADMINISTRADOR = ?",
      [adminId]
    );

    if (result.affectedRows === 0) {
      throw new Error(`No se encontró el administrador con ID: ${adminId}`);
    }

    return { success: true, message: "Sesión activada exitosamente." };
  } catch (error) {
    console.error("Error al activar la sesión:", error.message);
    return {
      success: false,
      message: "Ocurrió un error al intentar activar la sesión.",
      error: error.message,
    };
  }
}

//MARCAR SESION INACTIVA
export async function marcarSesionInactiva(adminId) {
  try {
    const [result] = await pool.query(
      'UPDATE ADMINISTRADORES SET SESION_ACTIVA = FALSE WHERE ID_ADMINISTRADOR = ?',
      [adminId]
    );

    if (result.affectedRows === 0) {
      // Si no se actualizó ninguna fila, significa que el ID no existe
      throw new Error(`No se encontró el administrador con ID: ${adminId}`);
    }

    return {
      success: true,
      message: `Sesión desactivada para el administrador con ID: ${adminId}`,
    };
  } catch (error) {
    console.error("Error al desactivar la sesión:", error.message);

    return {
      success: false,
      message: "Ocurrió un error al intentar desactivar la sesión.",
      error: error.message,
    };
  }
}
 
 //VALIDAR USUARIO EN LA BASE DE DATOS, DE LA TABLA ADMINISTRADORES --VERIFICADO
 export async function checkUser(email, password) {
  const [rows] = await pool.query(
    `SELECT ID_ADMINISTRADOR, EMAIL, NOMBRE, PASSWORD, SESION_ACTIVA FROM ADMINISTRADORES WHERE EMAIL = ?`,
    [email]
  );

  if (rows.length < 1) {
    return null; // Usuario no encontrado
  } else {
    const datosAdmin = rows[0];

    // Comparar la contraseña ingresada con la almacenada
    const passwordCompare = await bcrypt.compare(password, datosAdmin.PASSWORD);

    if (passwordCompare) {
      // Si la contraseña es correcta, verificar si la sesión está activa
      if (datosAdmin.SESION_ACTIVA === 1) {
        return {error : "Sesion Activa"}; // Sesión ya activa
      } else {
        // Si la sesión no está activa, la activamos
        await marcarSesionActiva(datosAdmin.ID_ADMINISTRADOR); // Llamada a la función para activar la sesión
        return {
          idAdmin: datosAdmin.ID_ADMINISTRADOR,
          email: datosAdmin.EMAIL,
          nombre: datosAdmin.NOMBRE,
          sesionActiva: 1, // Ahora la sesión está activa
        };
      }
    } else {
      return null; // Contraseña incorrecta
    }
  }
}