import { pool } from "./../helpers/index.js";

//AGREGAR AL DOCKER PARA LAS NOTIFICACIONES
import { Expo } from "expo-server-sdk";

//GUARDAR TOKEN EN LA BASE DE DATOS
export async function guardarToken(administrador_id, token) {
  try {
    // Primero, verifica si el token ya existe para el administrador
    const [rows] = await pool.query(
      "SELECT * FROM tokens WHERE administrador_id = ? AND token = ?",
      [administrador_id, token]
    );

    // Si ya existe un token para ese administrador, no lo guardamos
    if (rows.length > 0) {
      console.log("El token ya está registrado para este administrador");
      return rows[0].id; // Retorna el ID del token existente si lo encuentras
    }

    // Si no existe el token, insertamos un nuevo registro
    const [result] = await pool.query(
      "INSERT INTO tokens (administrador_id, token) VALUES (?, ?)",
      [administrador_id, token]
    );
    console.log("Token guardado exitosamente");
    return result.insertId;
  } catch (error) {
    console.error("Error al guardar el token:", error);
    throw error;
  }
};

//ENVIAR MENSAJE
const enviarNotificacionPush = async (message) => {
  const expo = new Expo();

  // Obtener todos los tokens de la base de datos
  const [tokens] = await pool.query("SELECT token FROM tokens");

  // Asegúrate de que hay tokens para enviar
  if (!tokens || tokens.length === 0) {
    console.log("No hay tokens para enviar notificaciones");
    return;
  }

  const pushMessages = tokens
    .map((tokenRow) => {
      // Verificar si el token es válido
      if (!Expo.isExpoPushToken(tokenRow.token)) {
        console.log(`Token no válido: ${tokenRow.token}`);
        return null;
      }

      return {
        to: tokenRow.token,
        sound: "default",
        title: "¡Atención!",
        body: message, // El mensaje dinámico
        data: { extraData: "extra" },
      };
    })
    .filter(Boolean); // Elimina valores nulos (tokens no válidos)

  // Si hay mensajes válidos, envíalos
  if (pushMessages.length > 0) {
    try {
      const chunks = expo.chunkPushNotifications(pushMessages);
      const tickets = [];

      for (let chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error al enviar notificación:", error);
        }
      }
    } catch (error) {
      console.error("Error al enviar las notificaciones:", error);
    }
  }
};

// VERIFICAR INVENTARIO DE PRODUCTOS POR ID PARA LAS NOTIFICACIONES
export async function verificarInventario(id_admin) {
  try {
    const limiteStockBajo = 5; // Definir el límite de stock bajo
    const [productos] = await pool.query(
      "SELECT ID_PRODUCTO, CATEGORIA_ID, C.NOMBRE AS CATEGORIA, P.NOMBRE AS PRODUCTO, P.DESCRIPCION, P.PRECIO, P.CANTIDAD, P.IMAGEN FROM PRODUCTOS P JOIN CATEGORIAS C ON P.CATEGORIA_ID = C.ID_CATEGORIA WHERE P.ADMINISTRADOR_ID = ? AND P.CANTIDAD < ?",
      [id_admin, limiteStockBajo]
    );

    if (productos.length > 0) {
      // Envía notificación para cada producto con bajo stock
      for (let producto of productos) {
        let mensaje;
        // Verifica si el producto está agotado
        if (producto.CANTIDAD === 0) {
          mensaje = `¡Atención! El producto "${producto.PRODUCTO}" está agotado.`;
        }
        // Verifica si el producto tiene pocas unidades (menor a 5 pero mayor que 0)
        else if (producto.CANTIDAD < 5) {
          mensaje = `¡Atención! El producto "${producto.PRODUCTO}" tiene pocas unidades disponibles. Solo quedan ${producto.CANTIDAD} unidades.`;
        }

        await enviarNotificacionPush(mensaje);
      }

      return productos; // Devuelve los productos con bajo stock
    } else {
      console.log("Todos los productos tienen suficiente stock.");
      return [];
    }
  } catch (error) {
    console.error("Error al verificar inventario:", error);
    throw error;
  }
};
