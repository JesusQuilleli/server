import express from "express";


import {
  obtenerTasasPorAdminId,
  insertarOActualizarTasa,
} from "./../controllers/FunctionsTasa.js";

const routesTasa = express();

// VER TASAS DE CAMBIO por ADMINISTRADOR
routesTasa.get("/verTasa/:adminId", async (req, res) => {
  const adminId = req.params.adminId;

  try {
    const tasa = await obtenerTasasPorAdminId(adminId);

    if (tasa) {
      res.status(200).send({ message: "Tasa de Cambio", data: tasa });
    } else {
      res
        .status(404)
        .send({
          message:
            "No se encontró ninguna tasa de cambio para este administrador",
        });
    }
  } catch (err) {
    console.error("Error al obtener la tasa de cambio", err);
    res.status(500).send({ message: "Error al obtener la tasa de cambio" });
  }
});

// INSERTAR O ACTUALIZAR TASA DE CAMBIO
routesTasa.post("/insertarOActualizarTasa", async (req, res) => {
  const { moneda, tasa, adminId } = req.body;

  try {
    const result = await insertarOActualizarTasa(moneda, tasa, adminId);

    if (result) {
      res
        .status(200)
        .send({ message: "Tasa de cambio procesada con éxito", result });
    } else {
      res.status(400).send({ message: "Error al procesar la tasa de cambio" });
    }
  } catch (err) {
    console.error("Error al procesar la tasa de cambio", err);
    res.status(500).send({ message: "Error al procesar la tasa de cambio" });
  }
});

export { routesTasa };
