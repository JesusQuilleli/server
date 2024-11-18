import { pool } from "../helpers/index.js";

///////////////////CRUD PRODUCTOS////////////////////////////////////////

//CARGAR CATEGORIAS OK --VERIFICADO
export async function loadCategory(id_admin) {
  const rows = await pool.query(
    "SELECT ID_CATEGORIA, NOMBRE FROM CATEGORIAS WHERE ADMINISTRADOR_ID = ?",
    [id_admin]
  );
  if (rows.length > 0) {
    return rows;
  } else {
    return [];
  }
}

//INSERTAR CATEGORIAS OK --VERIFICADO
export async function insertCategorias(NOMBRE, ADMINISTRADOR_ID) {
  try {
    const result = await pool.query(
      "INSERT INTO CATEGORIAS (NOMBRE, ADMINISTRADOR_ID) VALUES (?,?)",
      [NOMBRE, ADMINISTRADOR_ID]
    );

    if (result) {
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.log("Error al Registrar Categoria", error);
  }
}

//ELIMINAR CATEGORIA OK --VERIFICADO
export async function deleteCategoria(ID_CATEGORIA) {
  try {
    const result = await pool.query(
      "DELETE FROM CATEGORIAS WHERE ID_CATEGORIA = ?",
      [ID_CATEGORIA]
    );
    if (result) {
      return result;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error al Eliminar Categoria", error);
  }
}

//INSERTAR PRODUCTOS OK --VERIFICADO
export async function insertProducts(
  CATEGORIA_ID,
  NOMBRE,
  DESCRIPCION,
  PRECIO_COMPRA,
  PRECIO,
  CANTIDAD,
  IMAGEN,
  ADMIN_ID
) {
  const [results] = await pool.query(
    "INSERT INTO PRODUCTOS (CATEGORIA_ID, NOMBRE, DESCRIPCION, PRECIO_COMPRA, PRECIO, CANTIDAD, IMAGEN, ADMINISTRADOR_ID) VALUES (?,?,?,?,?,?,?,?)",
    [
      CATEGORIA_ID,
      NOMBRE,
      DESCRIPCION,
      PRECIO_COMPRA,
      PRECIO,
      CANTIDAD,
      IMAGEN,
      ADMIN_ID,
    ]
  );

  if (results) {
    return results;
  } else {
    return null;
  }
}

//VER TODOS LOS PRODUCTOS OK --VERIFICADO
export async function viewAllProducts(id_admin) {
  try {
    const [rows] = await pool.query(
      "SELECT ID_PRODUCTO, CATEGORIA_ID, C.NOMBRE AS CATEGORIA, P.NOMBRE AS PRODUCTO, P.DESCRIPCION, P.PRECIO_COMPRA, P.PRECIO, P.CANTIDAD, P.IMAGEN FROM PRODUCTOS P JOIN CATEGORIAS C ON P.CATEGORIA_ID = C.ID_CATEGORIA WHERE P.ADMINISTRADOR_ID = ?",
      [id_admin]
    );
    return rows;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
}

//VER PRODUCTOS POR CATEGORIAS OK --VERIFICADO
export async function viewProductsCategory(id_categoria, id_admin) {
  const [row] = await pool.query(
    "SELECT P.ID_PRODUCTO, P.CATEGORIA_ID,C.NOMBRE AS CATEGORIA, P.NOMBRE AS PRODUCTO, P.DESCRIPCION, P.PRECIO_COMPRA, P.PRECIO, P.CANTIDAD, P.IMAGEN FROM PRODUCTOS P JOIN CATEGORIAS C ON P.CATEGORIA_ID = C.ID_CATEGORIA WHERE P.CATEGORIA_ID = ? AND P.ADMINISTRADOR_ID = ?",
    [id_categoria, id_admin]
  );

  return row;
}

// BUSCAR PRODUCTOS FILTRADOS POR ADMINISTRADOR --VERIFICADO
export async function busquedaProductos(nombre, administrador_id) {
  const [row] = await pool.query(
    `SELECT 
       P.ID_PRODUCTO, 
       P.CATEGORIA_ID, 
       C.NOMBRE AS CATEGORIA, 
       P.NOMBRE AS PRODUCTO, 
       P.PRECIO_COMPRA, 
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
       P.NOMBRE LIKE ? AND P.ADMINISTRADOR_ID = ?`,
    [`%${nombre}%`, administrador_id]
  );
  return row;
}

//MODIFICAR UN PRODUCTO OK --VERIFICADO
export async function modificProduct(
  CATEGORIA_ID,
  NOMBRE,
  DESCRIPCION,
  PRECIO_COMPRA,
  PRECIO,
  CANTIDAD,
  IMAGEN,
  ID_PRODUCTO
) {
  const [results] = await pool.query(
    "UPDATE PRODUCTOS SET CATEGORIA_ID = ?, NOMBRE = ?, DESCRIPCION = ?, PRECIO_COMPRA = ?, PRECIO = ?, CANTIDAD = ?, IMAGEN = ? WHERE ID_PRODUCTO = ?",
    [
      CATEGORIA_ID,
      NOMBRE,
      DESCRIPCION,
      PRECIO_COMPRA,
      PRECIO,
      CANTIDAD,
      IMAGEN,
      ID_PRODUCTO,
    ]
  );

  if (results) {
    return results;
  } else {
    return null;
  }
}

//FUNCION OBTENER PRODUCTO OK --VERIFICADO
export async function obtenerProductoPorId(id) {
  const [rows] = await pool.query(
    "SELECT * FROM PRODUCTOS WHERE ID_PRODUCTO = ?",
    [id]
  );
  return rows[0];
}

//ELIMINAR PRODUCTO OK --VERIFICADO
export async function eliminarProducto(id) {
  const producto = await obtenerProductoPorId(id);
  if (!producto) {
    throw new Error("Producto no encontrado");
  }

  const [row] = await pool.query(
    "DELETE FROM PRODUCTOS WHERE ID_PRODUCTO = ?",
    [id]
  );

  return { ...row, imagen: producto.IMAGEN };
}

//PRODUCTOS POR VENTAS OK --VERIFICADO
export async function busquedaProductosPorVenta(idVenta, idAdministrador) {
  try {
    const [rows] = await pool.query(
      `SELECT 
          VENTAS.ID_VENTA, 
          PRODUCTOS.NOMBRE AS PRODUCTO, 
          VENTAS_PRODUCTOS.CANTIDAD
       FROM 
          VENTAS_PRODUCTOS
       JOIN 
          VENTAS ON VENTAS_PRODUCTOS.VENTA_ID = VENTAS.ID_VENTA
       JOIN 
          PRODUCTOS ON VENTAS_PRODUCTOS.PRODUCTO_ID = PRODUCTOS.ID_PRODUCTO
       WHERE 
          VENTAS_PRODUCTOS.VENTA_ID = ? 
          AND VENTAS.ADMINISTRADOR_ID = ?
       ORDER BY 
          PRODUCTOS.NOMBRE`,
      [idVenta, idAdministrador]
    );
    return rows;
  } catch (error) {
    console.error("Error en conocer los productos por venta", error);
  }
}
