import express from "express";

import {
  guardarToken,
  verificarInventario,
} from "../controllers/FunctionsNotificaciones.js";

const routesNotificaciones = express.Router();

// Ruta para guardar el token de notificación
routesNotificaciones.post("/guardarToken", async (req, res) => {
  const { administrador_id, token } = req.body;

  // Validación de datos
  if (!administrador_id || !token) {
    return res
      .status(400)
      .json({ error: "Faltan datos requeridos: administrador_id o token" });
  }

  if (typeof administrador_id !== "number" || typeof token !== "string") {
    return res.status(400).json({
      error:
        "Datos inválidos: administrador_id debe ser un número y token un string",
    });
  }

  try {
    const tokenId = await guardarToken(administrador_id, token);
    res.status(201).json({
      message: "Token guardado exitosamente",
      tokenId,
    });
  } catch (error) {
    console.error("Error al guardar el token:", error.message || error);
    res.status(500).json({
      error: "Error interno al guardar el token. Verifica los registros.",
    });
  }
});

// Ruta para verificar el inventario
routesNotificaciones.post("/verificarInventario", async (req, res) => {
  const { id_admin } = req.body;

  // Validación de datos
  if (!id_admin) {
    return res
      .status(400)
      .json({ error: "Faltan datos requeridos: id_admin es obligatorio" });
  }

  if (typeof id_admin !== "number") {
    return res
      .status(400)
      .json({ error: "Datos inválidos: id_admin debe ser un número" });
  }

  try {
    const productosConBajoStock = await verificarInventario(id_admin);

    if (
      Array.isArray(productosConBajoStock) &&
      productosConBajoStock.length > 0
    ) {
      res.status(200).json({
        message: "Productos con bajo stock identificados",
        productos: productosConBajoStock,
      });
    } else {
      res.status(200).json({
        message: "No se encontraron productos con bajo stock",
        productos: [],
      });
    }
  } catch (error) {
    console.error("Error al verificar el inventario:", error.message || error);
    res.status(500).json({
      error:
        "Error interno al verificar el inventario. Verifica los registros.",
    });
  }
});

export { routesNotificaciones };
