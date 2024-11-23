import { pool } from "../helpers/index.js";

 export async function loadDevoluciones(ID_ADMIN) {
   try {
     const [row] = await pool.query(
       "SELECT D.ID_DEVOLUCION, D.CLIENTE, D.VENTA_ID, P.NOMBRE, D.CANTIDAD, D.FECHA_DEVOLUCION, D.MOTIVO FROM DEVOLUCIONES D JOIN PRODUCTOS P ON D.PRODUCTO_ID = P.ID_PRODUCTO WHERE D.ADMINISTRADOR_ID = ?",
       [ID_ADMIN]
     );
 
     return row;
   } catch (err) {
     console.error("Hubo un error al cargar los Clientes", err);
     throw err;
   }
 };

 export async function deleteVenta(id) {
   const [result] = await pool.query(
     "DELETE FROM VENTAS WHERE ID_VENTA = ?",
     [id]
   );
   return result;
 };

 export async function deleteDevoluciones(id) {
   const [result] = await pool.query(
     "DELETE FROM DEVOLUCIONES WHERE ADMINISTRADOR_ID = ?",
     [id]
   );
   return result;
 };

 export async function updateInventarioPorDevolucion(idVenta) {
   try {
     const [productosDevueltos] = await pool.query(
       `SELECT PRODUCTO_ID, CANTIDAD 
        FROM DEVOLUCIONES 
        WHERE VENTA_ID = ?`,
       [idVenta]
     );
 
     if (productosDevueltos.length === 0) {
       throw new Error("No hay devoluciones asociadas a esta venta.");
     }

     for (const producto of productosDevueltos) {
       const { PRODUCTO_ID, CANTIDAD } = producto;
       const [result] = await pool.query(
         `UPDATE PRODUCTOS 
          SET CANTIDAD = CANTIDAD + ? 
          WHERE ID_PRODUCTO = ?`,
         [CANTIDAD, PRODUCTO_ID]
       );
 
       if (result.affectedRows === 0) {
         throw new Error(
           `No se pudo actualizar el inventario para el producto ${PRODUCTO_ID}.`
         );
       }
     }
 
     return { success: true, message: "Inventario actualizado correctamente." };
   } catch (error) {
     console.error("Error al actualizar el inventario:", error);
     return { success: false, message: error.message };
   }
 };

 export async function insertDevoluciones(datosDevolucion) {
   try {
     const [result] = await pool.query(
       `INSERT INTO DEVOLUCIONES (CLIENTE, VENTA_ID, PRODUCTO_ID, CANTIDAD, FECHA_DEVOLUCION, MOTIVO, ADMINISTRADOR_ID)
        VALUES ?`,
       [datosDevolucion.map((d) => [d.CLIENTE, d.VENTA_ID, d.PRODUCTO_ID, d.CANTIDAD, d.FECHA_DEVOLUCION, d.MOTIVO, d.ADMINISTRADOR_ID])]
     );
     return { success: true, message: "Devoluciones registradas correctamente.", insertId: result.insertId };
   } catch (error) {
     console.error("Error al insertar devoluciones:", error);
     return { success: false, message: error.message };
   }
 };

 export async function procesarDevolucion(idVenta, productosDevolucion) {
   try {
     // Paso 1: Insertar datos en DEVOLUCIONES
     const resultadoDevolucion = await insertDevoluciones(productosDevolucion);
 
     if (!resultadoDevolucion.success) {
       throw new Error(resultadoDevolucion.message);
     }
     console.log("Devoluciones registradas:", resultadoDevolucion.message);
 
     // Paso 2: Actualizar el inventario
     const resultadoInventario = await updateInventarioPorDevolucion(idVenta);
 
     if (!resultadoInventario.success) {
       throw new Error(resultadoInventario.message);
     }
     console.log("Inventario actualizado:", resultadoInventario.message);
 
     const resultadoEliminar = await deleteVenta(idVenta);
 
     if (resultadoEliminar.affectedRows === 0) {
       throw new Error("No se encontró la venta para eliminar.");
     }
     console.log("Venta eliminada correctamente.");
 
     return { success: true, message: "Devolución procesada correctamente." };
   } catch (error) {
     console.error("Error al procesar la devolución:", error);
     return { success: false, message: error.message };
   }
 };

 export async function verDevolucionesCliente(ADMIN_ID, NOMBRE) {
  try {
    const [result] = await pool.query(
      `SELECT 
        ID_DEVOLUCION,
        CLIENTE,
        FECHA_DEVOLUCION
      FROM 
        DEVOLUCIONES 
      WHERE ADMINISTRADOR_ID = ? AND CLIENTE LIKE ?`,
      [ADMIN_ID, `%${NOMBRE}%`] // Uso de % para búsqueda parcial con LIKE
    );

    if(result.length > 0){
      return result;
    } else {
      return [];
    }

  } catch (error) {
    console.error("Error al cargar Devoluciones por Cliente", error);
    throw error; // Propaga el error para manejarlo externamente si es necesario
  }
};
