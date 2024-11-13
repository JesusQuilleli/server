import { pool } from "./../helpers/index.js";

// INSERTAR PAGOS
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

//VER PAGOS GENERALES
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

//VER PAGOS POR VENTA
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
