import { pool } from "../helpers";

//VER TASAS
export async function obtenerTasasPorAdminId(adminId) {
  try {
    // Consultar todas las tasas de cambio para el administrador
    const [result] = await pool.query(
      "SELECT * FROM TASAS_CAMBIO WHERE ADMINISTRADOR_ID = ?",
      [adminId]
    );

    if (result.length > 0) {
      return result; // Retorna todas las tasas encontradas
    } else {
      return []; // No se encontró ninguna tasa para este adminId
    }
  } catch (error) {
    console.error("Error al obtener las tasas de cambio:", error.message);
    throw error; // Propagar el error hacia el controlador
  }
}

export async function insertarOActualizarTasa(MONEDA, TASA, ADMIN_ID) {
  try {
    // Verificar si ya existe una tasa para este administrador y moneda específica
    const [existingRate] = await pool.query(
      "SELECT * FROM TASAS_CAMBIO WHERE ADMINISTRADOR_ID = ? AND MONEDA = ? LIMIT 1",
      [ADMIN_ID, MONEDA]
    );

    if (existingRate.length > 0) {
      // Si existe una tasa para esa moneda, la actualizamos
      const [updateResult] = await pool.query(
        "UPDATE TASAS_CAMBIO SET TASA = ? WHERE ADMINISTRADOR_ID = ? AND MONEDA = ?",
        [TASA, ADMIN_ID, MONEDA]
      );
      console.log("Tasa de cambio actualizada con éxito para", MONEDA);
      return updateResult;
    } else {
      // Si no existe, insertamos una nueva tasa para esa moneda
      const [insertResult] = await pool.query(
        "INSERT INTO TASAS_CAMBIO (MONEDA, TASA, ADMINISTRADOR_ID) VALUES (?, ?, ?)",
        [MONEDA, TASA, ADMIN_ID]
      );
      console.log("Tasa de cambio registrada con éxito para", MONEDA);
      return insertResult;
    }
  } catch (error) {
    console.error(
      "Error al insertar o actualizar la tasa de cambio:",
      error.message
    );
    throw error; // Propagar el error hacia el controlador
  }
}
