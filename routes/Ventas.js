import express from "express";

import {
  editStockProducto,
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

//EDITAR PRODUCTOS SELECCIONADOS EN EL CARRITO + O - --VERIFICADO
routesVentas.put("/updateProductoStock/:id_producto", async (req, res) => {
  try {
    const { cantidad } = req.body; // La cantidad a actualizar
    const productoID = req.params.id_producto;

    // Validar que la cantidad sea un número y no nulo
    if (typeof cantidad !== "number" || cantidad == null) {
      return res
        .status(400)
        .send({ message: "Cantidad debe ser un número válido." });
    }

    const resultado = await editStockProducto(cantidad, productoID);

    if (resultado) {
      res
        .status(200)
        .send({ message: "Producto Modificado Correctamente", resultado });
    } else {
      res
        .status(404)
        .send({ message: "Producto no encontrado o no modificado." });
    }
  } catch (err) {
    console.error("Error al Modificar Producto", err);
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
    const { ventaId, productoId, cantidad } = req.body;

    const response = await productosVendidos(ventaId, productoId, cantidad);
    res
      .status(200)
      .send({ message: "Productos Registrados con Exito", response });
  } catch (err) {
    console.log("Error al Registrar Productos", err);
  }
});

//VER INFORMACION RESUMIDA DE LA VENTA --VERIFICADO
routesVentas.get("/infoResum/:adminId", async (req, res) => {
  try {
    const adminId = req.params.adminId;
    const response = await infoResumidaVenta(adminId);

    res.status(200).send({ message: "Ver Venta Resumida Lista", response });
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


export { routesVentas };
