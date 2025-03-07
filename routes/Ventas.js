import express from "express";

import { pool } from "../helpers/index.js";

import {
  editStockProductos,
  realizarVenta,
  productosVendidos,
  infoResumidaVenta,
  infoResumidaVentaPorFechas,
  infoResumidaVentaPorCedula,
  infoDetallada,
  ventasEstado_Pago,
  deleteVentas
} from "./../controllers/FunctionsVentas.js";

const routesVentas = express.Router();

//EDITAR PRODUCTOS SELECCIONADOS EN EL CARRITO --VERIFICADO
routesVentas.put("/updateProductosStock", async (req, res) => {
  try {
    const productosCarrito = req.body; // Array de productos con ID_PRODUCTO y CANTIDAD

    if (!Array.isArray(productosCarrito) || productosCarrito.length === 0) {
      return res.status(400).send({ message: "Se requiere un array de productos válido." });
    }

    const resultado = await editStockProductos(productosCarrito);

    if (resultado) {
      res.status(200).send({
        message: "Productos actualizados correctamente.",
        resultado,
      });
    } else {
      res.status(404).send({
        message: "No se pudieron actualizar los productos. Verifica los IDs.",
      });
    }
  } catch (err) {
    console.error("Error al actualizar productos", err);
    res.status(500).send({ message: "Error interno del servidor." });
  }
});

//PROCESAR VENTA --VERIFICADO
routesVentas.post("/procesarVenta", async (req, res) => {
  try {
    const {
      clienteId,
      pagoTotal,
      montoPendiente,
      fechaVenta,
      estadoPago,
      tipoPago,
      administradorId,
    } = req.body;

    const response = await realizarVenta(
      clienteId,
      pagoTotal,
      montoPendiente,
      fechaVenta,
      estadoPago,
      tipoPago,
      administradorId
    );
    
    if (response) {
      // Envía solo una respuesta
      return res.status(200).send({
        message: "Venta Realizada",
        ID_VENTA: response.insertId, // Enviar el ID_VENTA aquí
      });
    } else {
      return res.status(400).send({ message: "No se pudo realizar la venta" });
    }
  } catch (error) {
    console.log("Error al realizar Venta", error);
  }
});

//INSERTAR PRODUCTOS RELACIONADOS CON LA VENTA --VERIFICADO
routesVentas.post("/ventaProductos", async (req, res) => {
  try {
    const { ventaId, productos } = req.body; // `productos` es un array [{ ID_PRODUCTO, CANTIDAD }]

    if (!ventaId || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).send({
        message: "Se requiere un ID de venta válido y un array de productos.",
      });
    }

    const response = await productosVendidos(ventaId, productos);

    res
      .status(200)
      .send({ message: "Productos registrados con éxito", response });
  } catch (err) {
    console.error("Error al registrar productos", err);
    res.status(500).send({ message: "Error interno del servidor." });
  }
});

//VER INFORMACION RESUMIDA DE LA VENTA --VERIFICADO
routesVentas.get("/infoResum/:adminId", async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const response = await infoResumidaVenta(adminId);

    if(response){
    res.status(200).send({ message: "Ver Venta Resumida Lista", response });
    }

  } catch (err) {
    console.log("Error en ver Venta Resumida", err);
  }
});

//VER INFORMACION DE LAS VENTAS POR CEDULA DEL CLIENTE  --VERIFICADO
routesVentas.get("/infoResumCedula/:adminId/:cedulaCliente", async (req, res) => {
  try {
    const adminId = req.params.adminId;  // Obtener ID del administrador
    const cedulaCliente = req.params.cedulaCliente;  // Obtener cédula del cliente desde la URL

    // Llamar a la función que consulta las ventas filtradas por cédula
    const response = await infoResumidaVentaPorCedula(adminId, cedulaCliente);

    if (response) {
      res.status(200).send({ message: "Ventas filtradas por cédula obtenidas con éxito", response });
    } else {
      res.status(200).send({ message: "No se encontraron ventas para la cédula proporcionada", response });
    }
  } catch (err) {
    console.log("Error en ver Venta Resumida por cédula", err);
    res.status(500).send({ message: "Error al obtener las ventas por cédula" });
  }
});

// VER INFORMACION RESUMIDA DE LA VENTA CON RANGO DE FECHAS --VERIFICADOS
routesVentas.get("/infoResumFechas/:adminId", async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const { fechaInicio, fechaFin } = req.query;

    // Verificamos que se envíen las fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).send({ message: "Las fechas de inicio y fin son necesarias" });
    }

    const response = await infoResumidaVentaPorFechas(adminId, fechaInicio, fechaFin);

    res.status(200).send({ message: "Ver Venta Resumida Lista", response });
  } catch (err) {
    console.error("Error en ver Venta Resumida", err);
    res.status(500).send({ message: "Error en ver Venta Resumida" });
  }
});
 
//VER INFORMACION DETALLADA DE LA VENTA --VERIFICADOS
routesVentas.get("/infoDetalle/:adminId/:ID_VENTA", async (req, res) => {
  try {
    const ID_ADMIN = req.params.adminId;
    const ID_VENTA = req.params.ID_VENTA;

    const response = await infoDetallada(ID_ADMIN, ID_VENTA);
    res.status(200).send({message: "Informacion Detallada Correcta", response});

  } catch (err) {
    console.error("Error en cargar la Informacion Detallada", err)
  }
});

//VER VENTAS POR ESTADO DE PAGO --VERIFICADOS
routesVentas.get("/ventasEstadoPago/:adminId", async (req, res) => {
  const { estadoPago } = req.query;
  const adminId = req.params.adminId;
  try {
    const response = await ventasEstado_Pago(adminId, estadoPago);
    res
      .status(200)
      .send({ message: "Ventas filtradas por estado de pago", response });
  } catch (error) {
    console.log("Error al filtrar las ventas", error);
    res.status(500).send({ message: "Error al filtrar las ventas", error });
  }
});

//ELIMINAR MULTIPLES VENTAS --VERIFICADO
routesVentas.delete("/eliminarVentas", async (req, res) => {
  try {
    const { ids } = req.body;

    const response = await deleteVentas(ids);

    if (response.affectedRows > 0) {
      res.status(200).send({ message: "Ventas eliminadas con éxito", ids });
        
    } else {
      res.status(404).send({ message: "Ventas no encontradas" });
    }
  } catch (error) {
    console.log("Error al eliminar ventas", error);
    res
      .status(500)
      .send({ message: "Error al eliminar ventas", error: error.message });
  }
});

routesVentas.post("/addProductosVenta", async (req, res) => {
  const { VENTA_ID, nuevaDeudaTotal, nuevaDeudaPendienteTotal, productos } = req.body;
  let connection;
  try {
    // Validar los datos recibidos
    if (!VENTA_ID || nuevaDeudaTotal == null || nuevaDeudaPendienteTotal == null || !productos) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Obtener una conexión del pool
    connection = await pool.getConnection();

    // Iniciar una transacción
    await connection.beginTransaction();

    // Actualizar MONTO_TOTAL y MONTO_PENDIENTE en la tabla VENTAS
    await connection.query(
      `
      UPDATE VENTAS 
      SET MONTO_TOTAL = ?, 
          MONTO_PENDIENTE = ? 
      WHERE ID_VENTA = ?
      `,
      [nuevaDeudaTotal, nuevaDeudaPendienteTotal, VENTA_ID]
    );

    // Insertar o actualizar los productos en VENTAS_PRODUCTOS
    const queryVentasProductos = `
      INSERT INTO VENTAS_PRODUCTOS (VENTA_ID, PRODUCTO_ID, CANTIDAD) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        CANTIDAD = CANTIDAD + VALUES(CANTIDAD)
    `;

    // Descontar la cantidad de productos del inventario
    const queryInventario = `
      UPDATE PRODUCTOS 
      SET CANTIDAD = CANTIDAD - ? 
      WHERE ID_PRODUCTO = ?
    `;

    // Recorrer los productos y realizar las dos operaciones: insertar en VENTAS_PRODUCTOS y actualizar en PRODUCTOS
    for (const { ID_PRODUCTO, CANTIDAD } of productos) {
      // Insertar o actualizar en VENTAS_PRODUCTOS
      await connection.query(queryVentasProductos, [VENTA_ID, ID_PRODUCTO, CANTIDAD]);

      // Descontar del inventario
      await connection.query(queryInventario, [CANTIDAD, ID_PRODUCTO]);
    }

    // Confirmar los cambios
    await connection.commit();

    // Enviar respuesta al cliente
    res.status(200).json({ message: "Venta y productos actualizados correctamente, inventario descontado." });
  } catch (error) {
    console.error("Error al actualizar la venta:", error.message);
    if (connection) {
      // Revertir cambios en caso de error
      await connection.rollback();
    }
    res.status(500).json({ error: "Error en el servidor" });
  } finally {
    if (connection) {
      // Liberar la conexión de vuelta al pool
      connection.release();
    }
  }
});


export { routesVentas };
