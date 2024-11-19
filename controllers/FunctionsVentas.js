import { pool } from "./../helpers/index.js"

//RESTAR PRODUCTO SEGUN LA VENTA --VERIFICADO
export async function editStockProductos(productos) {
  try {
    if (!productos || productos.length === 0) {
      throw new Error("No se proporcionaron productos para actualizar.");
    }

    // Construir la consulta SQL dinámicamente
    const ids = productos.map((p) => p.ID_PRODUCTO).join(", ");
    const casos = productos
      .map(
        (p) =>
          `WHEN ID_PRODUCTO = ${pool.escape(p.ID_PRODUCTO)} THEN CANTIDAD - ${pool.escape(
            p.CANTIDAD
          )}`
      )
      .join(" ");

    const query = `
      UPDATE PRODUCTOS
      SET CANTIDAD = CASE
        ${casos}
        ELSE CANTIDAD
      END
      WHERE ID_PRODUCTO IN (${ids});
    `;

    const [results] = await pool.query(query);

    if (results.affectedRows > 0) {
      return results;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error al editar productos", err);
    throw err;
  }
}

//PROCESAR LA VENTA --VERIFICADO
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

//PROCESAR PRODUCTOS VENDIDOS EN LA VENTA --VERIFICADO
export async function productosVendidos(VENTA_ID, productos) {
  try {
    if (!productos || productos.length === 0) {
      throw new Error("No se proporcionaron productos para registrar.");
    }

    const values = productos
      .map(
        (p) =>
          `(${pool.escape(VENTA_ID)}, ${pool.escape(p.ID_PRODUCTO)}, ${pool.escape(p.CANTIDAD)})`
      )
      .join(", ");

    const query = `
      INSERT INTO VENTAS_PRODUCTOS (VENTA_ID, PRODUCTO_ID, CANTIDAD)
      VALUES ${values};
    `;

    const [result] = await pool.query(query);

    if (result.affectedRows > 0) {
      return result;
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error al registrar productos vendidos", err);
    throw err;
  }
}

//INFORMACION RESUMIDA VENTA --VERIFICADO
export async function infoResumidaVenta(ID_ADMINISTRADOR) {
  const [result] = await pool.query(
    "SELECT v.ID_VENTA, c.NOMBRE AS CLIENTE, c.TELEFONO, v.FECHA_VENTA AS FECHA, v.ESTADO_PAGO FROM VENTAS v JOIN CLIENTES c ON v.CLIENTE_ID = c.ID_CLIENTE WHERE v.ADMINISTRADOR_ID = ?",
    [ID_ADMINISTRADOR]
  );

  if (result) {
    return result;
  } else {
    return null;
  }
};

//INFORMACION RESUMIDA POR CEDULA DEL CLIENTE --VERIFICADO
export async function infoResumidaVentaPorCedula(ID_ADMINISTRADOR, cedulaCliente) {
  const [result] = await pool.query(
    "SELECT v.ID_VENTA, c.NOMBRE AS CLIENTE, v.FECHA_VENTA AS FECHA, v.ESTADO_PAGO " +
    "FROM VENTAS v " +
    "JOIN CLIENTES c ON v.CLIENTE_ID = c.ID_CLIENTE " +
    "WHERE v.ADMINISTRADOR_ID = ? AND c.CEDULA LIKE ?",
    [ID_ADMINISTRADOR, `%${cedulaCliente}%`] 
  );

  if (result && result.length > 0) {
    return result;
  } else {
    return [];  // Si no se encuentra ninguna venta con la cédula proporcionada
  }
}

// INFORMACION RESUMIDA VENTA CON RANGO DE FECHAS --VERIFICADO
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
    const [result] = await pool.query(
      `
            SELECT 
          v.ID_VENTA,
          c.NOMBRE AS CLIENTE,
          c.TELEFONO,
          v.FECHA_VENTA AS FECHA,
          v.TIPO_PAGO,
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
  } catch (error) {}
}

//VER VENTAS POR ESTADO DE PAGO --VERIFICADO
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

//ELIMINAR MULTIPLES VENTAS --VERIFICADO
export async function deleteVentas(ids) {
  const [result] = await pool.query(
    "DELETE FROM VENTAS WHERE ID_VENTA IN (?)",
    [ids]
  );
  return result;
}
