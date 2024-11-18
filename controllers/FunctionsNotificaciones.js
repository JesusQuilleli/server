import { pool } from "./../helpers/index.js";

//AGREGAR AL DOCKER PARA LAS NOTIFICACIONES
import { Expo } from "expo-server-sdk";

export async function guardarToken(administrador_id, token) {
  try {
    // Verificar si el token ya existe para este administrador
    const [rows] = await pool.query(
      "SELECT * FROM TOKENS WHERE ADMINISTRADOR_ID = ? AND TOKEN = ?",
      [administrador_id, token]
    );

    if (rows.length > 0) {
      console.log("El token ya está registrado para este administrador.");
      return rows[0].id; // Retorna el ID del token existente
    }

    // Insertar un nuevo token si no existe
    const [result] = await pool.query(
      "INSERT INTO TOKENS (ADMINISTRADOR_ID, TOKEN) VALUES (?, ?)",
      [administrador_id, token]
    );

    console.log("Token guardado exitosamente.");
    return result.insertId;
  } catch (error) {
    console.error("Error al guardar el token:", error.message || error);
    throw new Error("Error al guardar el token.");
  }
}

const enviarNotificacionPush = async (message) => {
  const expo = new Expo();

  try {
    const [tokens] = await pool.query("SELECT TOKEN FROM TOKENS");

    if (!tokens || tokens.length === 0) {
      console.log("No hay tokens para enviar notificaciones.");
      return;
    }

    const pushMessages = tokens
      .map(({ TOKEN }) => {
        if (!Expo.isExpoPushToken(TOKEN)) {
          console.log(`Token no válido: ${TOKEN}`);
          return null;
        }
        return {
          to: TOKEN,
          sound: "default",
          title: "¡Atención!",
          body: message,
          data: { extraData: "extra" },
        };
      })
      .filter(Boolean);

    if (pushMessages.length > 0) {
      const chunks = expo.chunkPushNotifications(pushMessages);

      for (let chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          console.log("Notificaciones enviadas:", ticketChunk);
        } catch (error) {
          console.error(
            "Error al enviar notificación:",
            error.message || error
          );
        }
      }
    } else {
      console.log("No hay notificaciones válidas para enviar.");
    }
  } catch (error) {
    console.error("Error al enviar notificaciones:", error.message || error);
  }
};

export async function verificarInventario(id_admin) {
  try {
    const limiteStockBajo = 5; // Límite para stock bajo
    const [productos] = await pool.query(
      `SELECT 
         ID_PRODUCTO, 
         CATEGORIA_ID, 
         C.NOMBRE AS CATEGORIA, 
         P.NOMBRE AS PRODUCTO, 
         P.DESCRIPCION, 
         P.PRECIO, 
         P.CANTIDAD, 
         P.IMAGEN 
       FROM 
         PRODUCTOS P 
       JOIN 
         CATEGORIAS C 
       ON 
         P.CATEGORIA_ID = C.ID_CATEGORIA 
       WHERE 
         P.ADMINISTRADOR_ID = ? AND P.CANTIDAD < ?`,
      [id_admin, limiteStockBajo]
    );

    if (productos.length > 0) {
      // Crear una lista de mensajes para notificaciones
      const mensajes = productos.map((producto) => {
        if (producto.CANTIDAD === 0) {
          return `¡Atención! El producto "${producto.PRODUCTO}" está agotado.`;
        } else {
          return `¡Atención! El producto "${producto.PRODUCTO}" tiene pocas unidades disponibles. Solo quedan ${producto.CANTIDAD} unidades.`;
        }
      });

      // Enviar todas las notificaciones en paralelo
      await Promise.all(
        mensajes.map((mensaje) => enviarNotificacionPush(mensaje))
      );

      return productos; // Devuelve los productos con bajo stock
    } else {
      console.log("Todos los productos tienen suficiente stock.");
      return [];
    }
  } catch (error) {
    console.error("Error al verificar inventario:", error.message || error);
    throw new Error("Error al verificar el inventario.");
  }
}
