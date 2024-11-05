import { pool } from "../helpers/index.js";

//CARGAR CLIENTES
export async function loadClients(ID_ADMIN) {
   try {
     const [row] = await pool.query(
       "SELECT ID_CLIENTE, NOMBRE, TELEFONO, EMAIL, DIRECCION, FECHA_REGISTRO FROM CLIENTES WHERE ADMINISTRADOR_ID = ?",
       [ID_ADMIN]
     );
 
     return row;
   } catch (err) {
     console.error("Hubo un error al cargar los Clientes", err);
     throw err;
   }
 }
 
 //INSERTAR CLIENTES
 export async function insertClients(
   NOMBRE,
   TELEFONO,
   EMAIL,
   DIRECCION,
   FECHA_REGISTRO,
   ADMIN_ID
 ) {
   const [result] = await pool.query(
     "INSERT INTO CLIENTES (NOMBRE, TELEFONO, EMAIL, DIRECCION, FECHA_REGISTRO, ADMINISTRADOR_ID) VALUES (?,?,?,?,?,?)",
     [NOMBRE, TELEFONO, EMAIL, DIRECCION, FECHA_REGISTRO, ADMIN_ID]
   );
 
   if (result) {
     return result;
   } else {
     console.error("Error al Registrar Cliente");
   }
 }
 
 //EDITAR CLIENTE
 export async function editClient(NOMBRE, TELEFONO, EMAIL, DIRECCION, ID_CLIENTE) {
   try{
     const [results] = await pool.query(
       "UPDATE CLIENTES SET NOMBRE = ?, TELEFONO = ?, EMAIL = ?, DIRECCION = ? WHERE ID_CLIENTE = ?",
       [NOMBRE, TELEFONO, EMAIL, DIRECCION, ID_CLIENTE]
     );
   
     if (results) {
       return results;
     } else {
       return null;
     }
   } catch (err) {
     console.error('Error al Editar cliente' , err)
   }
   
 }
 
 //ELIMINAR CLIENTE
 export async function deleteClient(ID_CLIENTE) {
   const [row] = pool.query('DELETE FROM CLIENTES WHERE ID_CLIENTE = ?', [ID_CLIENTE])
   if(row) {
     return row
   } else {
     console.error('Error al Eliminar Cliente');
   }
 }