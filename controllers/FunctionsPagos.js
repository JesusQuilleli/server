import { pool } from "./../helpers/index.js";

// INSERTAR PAGOS --VERIFICADO
export async function insertPagos(
  VENTA_ID,
  MONTO_ABONADO,
  FECHA_PAGO,
  MANERA_PAGO,
  NUMERO_REFERENCIA
) {
  const [result] = await pool.query(
    "INSERT INTO PAGOS (VENTA_ID, MONTO_ABONADO, FECHA_PAGO, MANERA_PAGO, NUMERO_REFERENCIA) VALUES (?,?,?,?,?)",
    [VENTA_ID, MONTO_ABONADO, FECHA_PAGO, MANERA_PAGO, NUMERO_REFERENCIA]
  );

  if (result) {
    return result;
  } else {
    console.error("Error al Registrar Pago");
  }
};

//VER PAGOS GENERALES --VERIFICADO
export async function verPagosGenerales(ADMIN_ID) {
  try {
    const [result] = await pool.query(
      `SELECT 
          p.ID_PAGO, 
          p.VENTA_ID, 
          p.MONTO_ABONADO, 
          p.FECHA_PAGO, 
          p.MANERA_PAGO, 
          p.NUMERO_REFERENCIA, 
          c.NOMBRE AS CLIENTE,
          p.ESTADO_VENTA,
          p.MONTO_PENDIENTE_AL_MOMENTO AS MONTO_PENDIENTE 
        FROM 
          PAGOS p 
        JOIN 
          VENTAS v ON p.VENTA_ID = v.ID_VENTA 
        JOIN 
          CLIENTES c ON v.CLIENTE_ID = c.ID_CLIENTE
         WHERE v.ADMINISTRADOR_ID = ?`,
      [ADMIN_ID]
    );

    return result;
  } catch (error) {
    console.error("Error al cargar pagos:", error);
    throw error; // Propaga el error para manejarlo externamente si es necesario
  }
};

// VER PAGOS FILTRADOS POR CÓDIGO DE VENTA --VERIFICADO
export async function verPagosPorCodigoVenta(ADMIN_ID, VENTA_ID) {
  try {
    const [result] = await pool.query(
      `SELECT 
         p.ID_PAGO, 
         p.VENTA_ID, 
         p.MONTO_ABONADO, 
         p.FECHA_PAGO, 
         p.MANERA_PAGO, 
         p.NUMERO_REFERENCIA, 
         c.NOMBRE AS CLIENTE,
         p.ESTADO_VENTA,
         p.MONTO_PENDIENTE_AL_MOMENTO AS MONTO_PENDIENTE 
       FROM 
         PAGOS p 
       JOIN 
         VENTAS v ON p.VENTA_ID = v.ID_VENTA 
       JOIN 
         CLIENTES c ON v.CLIENTE_ID = c.ID_CLIENTE
       WHERE v.ADMINISTRADOR_ID = ? AND p.VENTA_ID LIKE ?`,
      [ADMIN_ID, `%${VENTA_ID}%`] // Uso de % para búsqueda parcial con LIKE
    );

    if(result.length > 0){
      return result;
    } else {
      return [];
    }

    
  } catch (error) {
    console.error("Error al cargar pagos por código de venta:", error);
    throw error; // Propaga el error para manejarlo externamente si es necesario
  }
};

//VER PAGOS POR VENTA --VERIFICADO
export async function verPagosVenta(ADMIN_ID, VENTA_ID) {
  try {
    const [result] = await pool.query(
      `SELECT 
          p.ID_PAGO, 
          p.VENTA_ID, 
          p.MONTO_ABONADO, 
          p.FECHA_PAGO, 
          p.MANERA_PAGO, 
          p.NUMERO_REFERENCIA, 
          c.NOMBRE AS CLIENTE,
          p.ESTADO_VENTA,
          p.MONTO_PENDIENTE_AL_MOMENTO AS MONTO_PENDIENTE 
        FROM 
          PAGOS p 
        JOIN 
          VENTAS v ON p.VENTA_ID = v.ID_VENTA 
        JOIN 
          CLIENTES c ON v.CLIENTE_ID = c.ID_CLIENTE
         WHERE v.ADMINISTRADOR_ID = ? AND p.VENTA_ID = ?`,
      [ADMIN_ID, VENTA_ID]
    );

    return result;
  } catch (error) {
    console.error("Error al cargar pagos:", error);
    throw error; // Propaga el error para manejarlo externamente si es necesario
  }
};

//ELIMINAR MULTIPLES PAGOS --VERIFICADO
export async function deletePagos(ids) {
  const [result] = await pool.query(
    "DELETE FROM PAGOS WHERE ID_PAGO IN (?)",
    [ids]
  );
  return result;
}
