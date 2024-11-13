import express from "express";
import {
  insertPagos,
  verPagosGenerales,
  verPagosVenta,
} from "./../controllers/FunctionsPagos.js";

var routesPagos = express.Router();

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

routesPagos.get("/verPagos/:adminId", async (req, res) => {
  const adminId = req.params.adminId;
  try {
    const response = await verPagosGenerales(adminId);

    if (response && response.length > 0) {
      res
        .status(200)
        .send({ message: "Pagos obtenidos con éxito", data: response });
    } else {
      res.status(404).send({
        message: "No se encontró ningún pago",
        data: [],
      });
    }
  } catch (err) {
    console.error("Error al obtener los pagos:", err);
    res.status(500).send({ message: "Error al obtener los pagos" });
  }
});

routesPagos.get("/verPagosVenta/:adminId/:Venta_ID", async (req, res) => {
  const adminId = req.params.adminId;
  const Venta_ID = req.params.Venta_ID;
  try {
    const response = await verPagosVenta(adminId, Venta_ID);

    if (response && response.length > 0) {
      res
        .status(200)
        .send({
          message: "Pagos por Venta obtenidos con éxito",
          data: response,
        });
    } else {
      res.status(404).send({
        message: "No se encontró ningún pago por Venta",
        data: [],
      });
    }
  } catch (err) {
    console.error("Error al obtener los pagos por Venta:", err);
    res.status(500).send({ message: "Error al obtener los pagos por Venta" });
  }
});

export { routesPagos }
