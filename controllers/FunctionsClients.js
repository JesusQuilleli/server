import { pool } from "../helpers/index.js";

//CARGAR CLIENTES --VERIFICADO
export async function loadClients(ID_ADMIN) {
  try {
    const [row] = await pool.query(
      "SELECT ID_CLIENTE, CEDULA, NOMBRE, TELEFONO, EMAIL, DIRECCION, FECHA_REGISTRO FROM CLIENTES WHERE ADMINISTRADOR_ID = ?",
      [ID_ADMIN]
    );

    return row;
  } catch (err) {
    console.error("Hubo un error al cargar los Clientes", err);
    throw err;
  }
}

//INSERTAR CLIENTES --VERIFICADO
export async function insertClients(
  CEDULA,
  NOMBRE,
  TELEFONO,
  EMAIL,
  DIRECCION,
  FECHA_REGISTRO,
  ADMIN_ID
) {
  const [result] = await pool.query(
    "INSERT INTO CLIENTES (CEDULA, NOMBRE, TELEFONO, EMAIL, DIRECCION, FECHA_REGISTRO, ADMINISTRADOR_ID) VALUES (?,?,?,?,?,?,?)",
    [CEDULA, NOMBRE, TELEFONO, EMAIL, DIRECCION, FECHA_REGISTRO, ADMIN_ID]
  );

  if (result) {
    return result;
  } else {
    console.error("Error al Registrar Cliente");
  }
}

//EDITAR CLIENTE --VERIFICADO
export async function editClient(NOMBRE, TELEFONO, EMAIL, DIRECCION, ID_CLIENTE) {
  try {
    const [results] = await pool.query(
      "UPDATE CLIENTES SET NOMBRE = ?, TELEFONO = ?, EMAIL = ?, DIRECCION = ? WHERE ID_CLIENTE = ?",
      [NOMBRE, TELEFONO, EMAIL, DIRECCION, ID_CLIENTE]
    );

    if (results) {
      return results;
    } else {
      return null;
    }
  } catch (err) {
    console.error('Error al Editar cliente', err)
  }

}

//ELIMINAR CLIENTE --VERIFICADO
export async function deleteClient(ID_CLIENTE) {
  const [row] = pool.query('DELETE FROM CLIENTES WHERE ID_CLIENTE = ?', [ID_CLIENTE])
  if (row) {
    return row
  } else {
    console.error('Error al Eliminar Cliente');
  }
}

//FILTRAR CLIENTES --VERIFICADO
export async function busquedaCliente(valor) {
  const [row] = await pool.query(
    `SELECT ID_CLIENTE, CEDULA, NOMBRE, TELEFONO, EMAIL, DIRECCION, FECHA_REGISTRO 
     FROM CLIENTES 
     WHERE NOMBRE LIKE ? OR CEDULA LIKE ?`,
    [`%${valor}%`, `%${valor}%`]
  );
  return row;
}

//VERIFICAR SI EL CLIENTE EXISTE
export async function verificarCliente(ADMIN_ID, CEDULA) {
  const [results] = await pool.query(
    "SELECT * FROM CLIENTES WHERE ADMINISTRADOR_ID = ? AND CEDULA = ?",
    [ADMIN_ID, CEDULA]
  );
  return results.length > 0 ? results[0] : null; // Retorna el cliente si existe o null
};