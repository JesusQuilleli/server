import express from "express";

import {
  loadDevoluciones,
  deleteDevoluciones,
  procesarDevolucion,
  verDevolucionesCliente,
} from "./../controllers/FunctionsDevoluciones.js";

const routesDevoluciones = express.Router();

routesDevoluciones.post("/procesarDevolucion", async (req, res) => {
  try {
    const { devoluciones } = req.body;

    // Validar que existan devoluciones
    if (!devoluciones || devoluciones.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No se enviaron devoluciones." });
    }

    // Obtener el ID de la venta
    const idVenta = devoluciones[0].VENTA_ID;

    // Procesar la devolución
    const resultado = await procesarDevolucion(idVenta, devoluciones);

    if (resultado.success) {
      return res
        .status(201)
        .json({ success: true, message: resultado.message });
    } else {
      return res
        .status(500)
        .json({ success: false, message: resultado.message });
    }
  } catch (error) {
    console.error("Error al procesar devoluciones:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno del servidor." });
  }
});

routesDevoluciones.get("/cargarDevoluciones/:adminId", async (req, res) => {
  const adminId = req.params.adminId;
  try {
    const result = await loadDevoluciones(adminId);
    res
      .status(200)
      .send({ message: "Devoluciones Cargadas con Exito", result });
  } catch (err) {
    console.error("Error al cargar Devoluciones", err);
  }
});

routesDevoluciones.delete(
  "/eliminarDevoluciones/:adminId",
  async (req, res) => {
    const adminId = req.params.adminId;
    try {
      const result = await deleteDevoluciones(adminId);
      res
        .status(200)
        .send({ message: "Devoluciones Cargadas con Exito", result });
    } catch (err) {
      console.error("Error al cargar Devoluciones", err);
    }
  }
);

routesDevoluciones.get("/verDevolucionesCliente/:adminId", async (req, res) => {
  const adminId = req.params.adminId;
  const { cliente } = req.query;
  try {
    const response = await verDevolucionesCliente(adminId, cliente);

    if (response && response.length > 0) {
      res.status(200).send({
        message: "Devoluciones Obtenidas",
        data: response,
      });
    } else {
      res.status(200).send({
        message: "No se encontró ningúna devolucion",
        data: [],
      });
    }
  } catch (err) {
    console.error("Error al obtener las devoluciones", err);
    res
      .status(500)
      .send({ message: "Error al obtener las devoluciones Backend" });
  }
});

export { routesDevoluciones };
