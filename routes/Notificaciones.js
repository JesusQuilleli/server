import express from "express";

import { guardarToken, verificarInventario } from "../controllers/FunctionsNotificaciones";

const routesNotificaciones = express.Router();

routesNotificaciones.post("/guardarToken", async (req, res) => {
   const { administrador_id, token } = req.body;
 
   if (!administrador_id || !token) {
     return res.status(400).json({ error: "Faltan datos requeridos" });
   }
 
   try {
     const tokenId = await guardarToken(administrador_id, token);
     res.status(201).json({ message: "Token guardado exitosamente", tokenId });
   } catch (error) {
     res.status(500).json({ error: "Error al guardar el token" });
   }
 });

 routesNotificaciones.post("/verificarInventario", async (req, res) => {
   const { id_admin } = req.body;
 
   if (!id_admin) {
     return res.status(400).json({ error: "ID del administrador es requerido" });
   }
 
   try {
     const productosConBajoStock = await verificarInventario(id_admin);
 
     if (productosConBajoStock.length > 0) {
       res.status(200).json({
         message: "Notificaciones enviadas sobre productos con bajo stock",
       });
     } else {
       res
         .status(200)
         .json({ message: "No se encontraron productos con bajo stock" });
     }
   } catch (error) {
     res.status(500).json({ error: "Error al verificar el inventario" });
   }
 });

 export { routesNotificaciones }