import { pool } from "./../helpers/index.js"

//SUMAR O RESTAR PRODUCTO SEGUN LA VENTA
export async function editStockProducto(cantidad, ID_PRODUCTO) {
  try {
    const [results] = await pool.query(
      "UPDATE PRODUCTOS SET CANTIDAD = CANTIDAD + ? WHERE ID_PRODUCTO = ?",
      [cantidad, ID_PRODUCTO]
    );

    if (results.affectedRows > 0) {
      return results;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error al Editar producto", err);
    throw err; // Lanza el error para que sea manejado en el endpoint
  }
}

//PROCESAR LA VENTA
export async function realizarVenta(
  CLIENTE_ID,
  MONTO_TOTAL,
  MONTO_PENDIENTE,
  FECHA_VENTA,
  ESTADO_PAGO,
  TIPO_PAGO,
  ADMINISTRADOR_ID
) {
  const [result] = await pool.query(
    "INSERT INTO VENTAS (CLIENTE_ID, MONTO_TOTAL, MONTO_PENDIENTE, FECHA_VENTA, ESTADO_PAGO, TIPO_PAGO, ADMINISTRADOR_ID) VALUES (?,?,?,?,?,?,?)",
    [
      CLIENTE_ID,
      MONTO_TOTAL,
      MONTO_PENDIENTE,
      FECHA_VENTA,
      ESTADO_PAGO,
      TIPO_PAGO,
      ADMINISTRADOR_ID,
    ]
  );

  if (result) {
    return result;
  } else {
    return null;
  }
}

//PROCESAR PRODUCTOS VENDIDOS EN LA VENTA
export async function productosVendidos(VENTA_ID, PRODUCTO_ID, CANTIDAD) {
  const [result] = await pool.query(
    "INSERT INTO VENTAS_PRODUCTOS (VENTA_ID, PRODUCTO_ID, CANTIDAD) VALUES (?,?,?)",
    [VENTA_ID, PRODUCTO_ID, CANTIDAD]
  );

  if (result) {
    return result;
  } else {
    return null;
  }
}

//INFORMACION RESUMIDA VENTA
export async function infoResumidaVenta(ID_ADMINISTRADOR) {
  const [result] = await pool.query(
    "SELECT v.ID_VENTA, c.NOMBRE AS CLIENTE, v.FECHA_VENTA AS FECHA, v.ESTADO_PAGO FROM VENTAS v JOIN CLIENTES c ON v.CLIENTE_ID = c.ID_CLIENTE WHERE v.ADMINISTRADOR_ID = ?",
    [ID_ADMINISTRADOR]
  );

  if (result) {
    return result;
  } else {
    return null;
  }
};

// INFORMACION RESUMIDA VENTA CON RANGO DE FECHAS
export async function infoResumidaVentaPorFechas(ID_ADMINISTRADOR, fechaInicio, fechaFin) {
  const [result] = await pool.query(
    `SELECT v.ID_VENTA, c.NOMBRE AS CLIENTE, v.FECHA_VENTA AS FECHA, v.ESTADO_PAGO
     FROM VENTAS v
     JOIN CLIENTES c ON v.CLIENTE_ID = c.ID_CLIENTE
     WHERE v.ADMINISTRADOR_ID = ?
     AND v.FECHA_VENTA BETWEEN ? AND ?`,
    [ID_ADMINISTRADOR, fechaInicio, fechaFin]
  );

  if (result.length > 0) {
    return result;
  } else {
    return null;
  }
};

//INFORMACION DETALLADA VENTA
export async function infoDetallada(ID_ADMIN, ID_VENTA) {
  try {
    const [result] = await pool.query(`
            SELECT 
          c.NOMBRE AS CLIENTE,
          v.FECHA_VENTA AS FECHA,
          v.ESTADO_PAGO,
          v.MONTO_TOTAL,
          v.MONTO_PENDIENTE,
          v.ADMINISTRADOR_ID
            FROM 
                VENTAS v
            JOIN 
                CLIENTES c ON v.CLIENTE_ID = c.ID_CLIENTE
            LEFT JOIN 
                VENTAS_PRODUCTOS vp ON v.ID_VENTA = vp.VENTA_ID
            LEFT JOIN 
                PRODUCTOS p ON vp.PRODUCTO_ID = p.ID_PRODUCTO
            WHERE 
                v.ADMINISTRADOR_ID = ?
                AND v.ID_VENTA = ?
            GROUP BY 
                v.ID_VENTA;
      `,
      [ID_ADMIN, ID_VENTA]
    );

    if (result) {
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al ver Informacion Detallada", error)
  }
};

//VER VENTAS POR ESTADO DE PAGO
export async function ventasEstado_Pago(ID_ADMINISTRADOR, ESTADO_PAGO) {
  const [result] = await pool.query(
    "SELECT v.ID_VENTA, c.NOMBRE AS CLIENTE, v.FECHA_VENTA AS FECHA, v.ESTADO_PAGO FROM VENTAS v JOIN CLIENTES c ON v.CLIENTE_ID = c.ID_CLIENTE WHERE v.ADMINISTRADOR_ID = ? AND v.ESTADO_PAGO = ?",
    [ID_ADMINISTRADOR, ESTADO_PAGO]
  );

  if (result) {
    return result;
  } else {
    return null;
  }
};
