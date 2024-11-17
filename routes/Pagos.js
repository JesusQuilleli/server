import express from "express";
import {
  insertPagos,
  verPagosGenerales,
  verPagosVenta,
  verPagosPorCodigoVenta,
  deletePagos
} from "./../controllers/FunctionsPagos.js";

var routesPagos = express.Router();

// --VERIFICADO
routesPagos.post("/pagoVenta", async (req, res) => {
  try {
    const { ventaId, montoAbonado, fechaPago, maneraPago, numeroReferencia } =
      req.body;

    const response = await insertPagos(
      ventaId,
      montoAbonado,
      fechaPago,
      maneraPago,
      numeroReferencia
    );
    res.status(200).send({ message: "Pago Registrado con Exito", response });
  } catch (err) {
    console.log("Error al Registrar Productos", err);
  }
});

// --VERIFICADO
routesPagos.get("/verPagos/:adminId", async (req, res) => {
  const adminId = req.params.adminId;
  try {
    const response = await verPagosGenerales(adminId);

    if (response && response.length > 0) {
      res.status(200).send({ message: "Pagos obtenidos con éxito", data: response });
    } else {
      res.status(200).send({ message: "No hay pagos registrados", data: [] }); // Cambiar 404 por 200 y devolver un array vacío
    }
  } catch (err) {
    console.error("Error al obtener los pagos:", err);
    res.status(500).send({ message: "Error al obtener los pagos" });
  }
});

// --VERIFICADO
routesPagos.get("/verPagosVenta/:adminId/:Venta_ID", async (req, res) => {
  const adminId = req.params.adminId;
  const Venta_ID = req.params.Venta_ID;
  try {
    const response = await verPagosVenta(adminId, Venta_ID);

    if (response && response.length > 0) {
      res.status(200).send({
        message: "Pagos por Venta obtenidos con éxito",
        data: response,
      });
    } else {
      res.status(200).send({
        message: "No se encontró ningún pago por Venta",
        data: [],
      });
    }
  } catch (err) {
    console.error("Error al obtener los pagos por Venta:", err);
    res.status(500).send({ message: "Error al obtener los pagos por Venta" });
  }
});

// --VERIFICADO
routesPagos.get("/verPagosCodigoVenta/:adminId/:codigo", async (req, res) => {
  const adminId = req.params.adminId;
  const codigo = req.params.codigo;
  try {
    const response = await verPagosPorCodigoVenta(adminId, codigo);

    if (response && response.length > 0) {
      res.status(200).send({
        message: "Pagos por Venta obtenidos con éxito",
        data: response,
      });
    } else {
      res.status(200).send({
        message: "No se encontró ningún pago por Venta",
        data: [],
      });
    }
  } catch (err) {
    console.error("Error al obtener los pagos por Venta:", err);
    res.status(500).send({ message: "Error al obtener los pagos por Venta" });
  }
});

//ELIMINAR MULTIPLES PAGOS //AGREGAR AL DOCKER
routesPagos.delete("/eliminarPagos", async (req, res) => {
  try {
    const { ids } = req.body;

    const response = await deletePagos(ids);

    if (response.affectedRows > 0) {
      res.status(200).send({ message: "Pagos eliminados con éxito", ids });
    } else {
      res.status(404).send({ message: "Pagos no encontrados" });
    }
  } catch (error) {
    console.log("Error al eliminar Pagos", error);
    res
      .status(500)
      .send({ message: "Error al eliminar Pagos", error: error.message });
  }
});

export { routesPagos }
