//IMPORTS DE LAS DEPENDENCIAS PREVIAMENTE INSTALADAS
import mysql from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

//BASE DE DATOS

//INFORMACION NECESARIA PARA CONECTARNOS A LA BASE DE DATOS CONFIGURACION
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

//SE DECLARAN LAS FUNCIONES PARA USAR EN NUESTRO SERVER ES -> APP.JS

//CONSULTA MYSQL EJEMPLO
export async function getRoles(id) {
  const [row] = await pool.query(`SELECT * FROM ROLES WHERE ID_ROL = ?`, [id]);
  return row[0];
}

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

///////////////////CRUD PRODUCTOS////////////////////////////////////////

//CARGAR CATEGORIAS
export async function loadCategory(id_admin) {
  const rows = await pool.query(
    "SELECT ID_CATEGORIA, NOMBRE FROM CATEGORIAS WHERE ADMINISTRADOR_ID = ?",
    [id_admin]
  );
  if (rows.length > 0) {
    return rows;
  } else {
    return [];
  }
}

//INSERTAR PRODUCTOS
export async function insertProducts(
  CATEGORIA_ID,
  NOMBRE,
  DESCRIPCION,
  PRECIO,
  CANTIDAD,
  IMAGEN,
  ADMIN_ID
) {
  const [results] = await pool.query(
    "INSERT INTO PRODUCTOS (CATEGORIA_ID, NOMBRE, DESCRIPCION, PRECIO, CANTIDAD, IMAGEN, ADMINISTRADOR_ID) VALUES (?,?,?,?,?,?,?)",
    [CATEGORIA_ID, NOMBRE, DESCRIPCION, PRECIO, CANTIDAD, IMAGEN, ADMIN_ID]
  );

  if (results) {
    return results;
  } else {
    return null;
  }
}

//VER TODOS LOS PRODUCTOS
export async function viewAllProducts(id_admin) {
  try {
    const [rows] = await pool.query(
      "SELECT ID_PRODUCTO, CATEGORIA_ID, C.NOMBRE AS CATEGORIA, P.NOMBRE AS PRODUCTO, P.DESCRIPCION, P.PRECIO, P.CANTIDAD, P.IMAGEN FROM PRODUCTOS P JOIN CATEGORIAS C ON P.CATEGORIA_ID = C.ID_CATEGORIA WHERE P.ADMINISTRADOR_ID = ?",
      [id_admin]
    );
    return rows;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
}

//VER PRODUCTOS POR CATEGORIAS
export async function viewProductsCategory(id_categoria, id_admin) {
  const [row] = await pool.query(
    "SELECT P.ID_PRODUCTO, P.CATEGORIA_ID, P.NOMBRE AS PRODUCTO, P.DESCRIPCION, P.PRECIO, P.CANTIDAD, P.IMAGEN FROM PRODUCTOS P JOIN CATEGORIAS C ON P.CATEGORIA_ID = C.ID_CATEGORIA WHERE P.CATEGORIA_ID = ? AND P.ADMINISTRADOR_ID = ?",
    [id_categoria, id_admin]
  );

  return row;
}

//BUSCAR PRODUCTOS
export async function busquedaProductos(nombre) {
  const [row] = await pool.query(
    "SELECT P.ID_PRODUCTO, P.CATEGORIA_ID, C.NOMBRE AS CATEGORIA, P.NOMBRE AS PRODUCTO, P.DESCRIPCION, P.PRECIO, P.CANTIDAD, P.IMAGEN FROM PRODUCTOS P JOIN CATEGORIAS C ON P.CATEGORIA_ID = C.ID_CATEGORIA WHERE P.NOMBRE LIKE ?",
    [`%${nombre}%`]
  );
  return row;
}

//MODIFICAR UN PRODUCTO
export async function modificProduct(
  CATEGORIA_ID,
  NOMBRE,
  DESCRIPCION,
  PRECIO,
  CANTIDAD,
  IMAGEN,
  ID_PRODUCTO
) {
  const [results] = await pool.query(
    "UPDATE PRODUCTOS SET CATEGORIA_ID = ?, NOMBRE = ?, DESCRIPCION = ?, PRECIO = ?, CANTIDAD = ?, IMAGEN = ? WHERE ID_PRODUCTO = ?",
    [CATEGORIA_ID, NOMBRE, DESCRIPCION, PRECIO, CANTIDAD, IMAGEN, ID_PRODUCTO]
  );

  if (results) {
    return results;
  } else {
    return null;
  }
}

//ELIMINAR PRODUCTO
export async function eliminarProducto(id) {
  const [row] = await pool.query(
    "DELETE FROM PRODUCTOS WHERE ID_PRODUCTO = ?",
    [id]
  );
  return row;
}
