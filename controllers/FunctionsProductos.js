import { pool } from '../helpers/index.js';

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

//FUNCION OBTENER PRODUCTO
async function obtenerProductoPorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM PRODUCTOS WHERE ID_PRODUCTO = ?",
    [id]
  );
  return rows[0];
}

//ELIMINAR PRODUCTO
export async function eliminarProducto(id) {

  const producto = await obtenerProductoPorId(id);
  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  const [row] = await pool.query(
    "DELETE FROM PRODUCTOS WHERE ID_PRODUCTO = ?",
    [id]
  );
  
  return { ...row, imagen: producto.IMAGEN };
}