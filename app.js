import express from "express";
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import mysql from "mysql2";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

//IMPORTS IMAGENES
import { fileURLToPath } from "url";
import { dirname } from "path";

///////////////////////////////BASE DE DATOS////////////////////////////////////////////////////

dotenv.config();

//INFORMACION NECESARIA PARA CONECTARNOS A LA BASE DE DATOS CONFIGURACION
const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

  //CONSULTA MYSQL EJEMPLO
export async function getRoles(id) {
  const [row] = await pool.query(`SELECT * FROM ROLES WHERE ID_ROL = ?`, [id]);
  return row[0];
}

//FUNCION REGISTRAR ADMINISTRADOR
export async function registerAdmin(name, password, email, rol_id) {
  // Encriptar la contraseña
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insertar en la base de datos
  const [results] = await pool.query(
    "INSERT INTO ADMINISTRADORES (NOMBRE, PASSWORD, EMAIL, ROL_ID) VALUES (?, ?, ?, ?)",
    [name, hashedPassword, email, rol_id]
  );

  return results;
}

//VALIDAR USUARIO EN LA BASE DE DATOS, DE LA TABLA ADMINISTRADORES
export async function checkUser(email, password) {
  const [rows] = await pool.query(
    `SELECT ID_ADMINISTRADOR, EMAIL, NOMBRE, PASSWORD FROM ADMINISTRADORES WHERE EMAIL = ?`,
    [email]
  );

  if (rows.length < 1) {
    return null;
  } else {
    const datosAdmin = rows[0];
    const passwordCompare = await bcrypt.compare(password, datosAdmin.PASSWORD);

    if (passwordCompare) {
      return {
        idAdmin: datosAdmin.ID_ADMINISTRADOR,
        email: datosAdmin.EMAIL,
        nombre: datosAdmin.NOMBRE,
      };
    } else {
      return null;
    }
  }
}

///////////////////CRUD PRODUCTOS////////////////////////////////////////

//CARGAR CATEGORIAS
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

//INSERTAR PRODUCTOS
export async function insertProducts(
  CATEGORIA_ID,
  NOMBRE,
  DESCRIPCION,
  PRECIO,
  CANTIDAD,
  IMAGEN,
  ADMIN_ID
) {
  const [results] = await pool.query(
    "INSERT INTO PRODUCTOS (CATEGORIA_ID, NOMBRE, DESCRIPCION, PRECIO, CANTIDAD, IMAGEN, ADMINISTRADOR_ID) VALUES (?,?,?,?,?,?,?)",
    [CATEGORIA_ID, NOMBRE, DESCRIPCION, PRECIO, CANTIDAD, IMAGEN, ADMIN_ID]
  );

  if (results) {
    return results;
  } else {
    return null;
  }
}

//VER TODOS LOS PRODUCTOS
export async function viewAllProducts(id_admin) {
  try {
    const [rows] = await pool.query(
      "SELECT ID_PRODUCTO, CATEGORIA_ID, C.NOMBRE AS CATEGORIA, P.NOMBRE AS PRODUCTO, P.DESCRIPCION, P.PRECIO, P.CANTIDAD, P.IMAGEN FROM PRODUCTOS P JOIN CATEGORIAS C ON P.CATEGORIA_ID = C.ID_CATEGORIA WHERE P.ADMINISTRADOR_ID = ?",
      [id_admin]
    );
    return rows;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
}

//VER PRODUCTOS POR CATEGORIAS
export async function viewProductsCategory(id_categoria, id_admin) {
  const [row] = await pool.query(
    "SELECT P.ID_PRODUCTO, P.CATEGORIA_ID, P.NOMBRE AS PRODUCTO, P.DESCRIPCION, P.PRECIO, P.CANTIDAD, P.IMAGEN FROM PRODUCTOS P JOIN CATEGORIAS C ON P.CATEGORIA_ID = C.ID_CATEGORIA WHERE P.CATEGORIA_ID = ? AND P.ADMINISTRADOR_ID = ?",
    [id_categoria, id_admin]
  );

  return row;
}

//BUSCAR PRODUCTOS
export async function busquedaProductos(nombre) {
  const [row] = await pool.query(
    "SELECT P.ID_PRODUCTO, P.CATEGORIA_ID, C.NOMBRE AS CATEGORIA, P.NOMBRE AS PRODUCTO, P.DESCRIPCION, P.PRECIO, P.CANTIDAD, P.IMAGEN FROM PRODUCTOS P JOIN CATEGORIAS C ON P.CATEGORIA_ID = C.ID_CATEGORIA WHERE P.NOMBRE LIKE ?",
    [`%${nombre}%`]
  );
  return row;
}

//MODIFICAR UN PRODUCTO
export async function modificProduct(
  CATEGORIA_ID,
  NOMBRE,
  DESCRIPCION,
  PRECIO,
  CANTIDAD,
  IMAGEN,
  ID_PRODUCTO
) {
  const [results] = await pool.query(
    "UPDATE PRODUCTOS SET CATEGORIA_ID = ?, NOMBRE = ?, DESCRIPCION = ?, PRECIO = ?, CANTIDAD = ?, IMAGEN = ? WHERE ID_PRODUCTO = ?",
    [CATEGORIA_ID, NOMBRE, DESCRIPCION, PRECIO, CANTIDAD, IMAGEN, ID_PRODUCTO]
  );

  if (results) {
    return results;
  } else {
    return null;
  }
}

//ELIMINAR PRODUCTO
export async function eliminarProducto(id) {
  const [row] = await pool.query(
    "DELETE FROM PRODUCTOS WHERE ID_PRODUCTO = ?",
    [id]
  );
  return row;
}

///////////////////////////////SERVIDOR////////////////////////////////////////////////////

//PUERTO DESDE EL .ENV
const PORT = process.env.PORT;

//DECLARACION DE EXPRESS PARA MANEJO DE PETICIONES HTTPS
const app = express();
app.use(express.json());
app.use(cors());

//IMAGENES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//PETICION EJEMPLO
app.get("/ejemplo/:id", async (req, res) => {
  const ejemplo = await getRoles(req.params.id);
  res.status(200).send(ejemplo);
});

//PETICION POST REGISTRAR ADMINISTRADOR -- END POINT
app.post("/registerAdmin", async (req, res) => {
  const { name, password, email, rolId } = req.body;

  try {
    const result = await registerAdmin(name, password, email, rolId);
    res
      .status(200)
      .send({ message: "Administrador registrado con éxito", id: result });
  } catch (error) {
    console.error("Error al registrar administrador:", error);
    res.status(500).send("Error al registrar administrador");
  }
});

// PETICIÓN PARA VERIFICAR SI LOS DATOS INGRESADOS SON CORRECTOS Y AUTENTICAR INICIO DE SESIÓN
app.post("/autenticacionInicio", async (req, res) => {
  const { email, password } = req.body;
  try {
    const resultado = await checkUser(email, password);

    if (resultado) {
      // Si la autenticación fue exitosa, devolver el ID_ADMINISTRADOR y un mensaje de éxito
      res.status(200).send({ message: "Autenticado con éxito", resultado });
    } else {
      // Si no fue exitoso, devolver null y un mensaje de error
      res
        .status(401)
        .send({ message: "Email o contraseña incorrectos", resultado: null });
    }
  } catch (error) {
    console.log("Ha ocurrido un error al Autenticar", error);
    res.status(500).send("Error al autenticar usuario");
  }
});

//PRODUCTOS Y CATEGORIAS PETICIONES
app.get("/cargarCategorias/:adminId", async (req, res) => {
  const adminId = req.params.adminId;
  try {
    const resultado = await loadCategory(adminId);
    res
      .status(200)
      .send({ message: "Categorias Cargadas con Exito", resultado });
  } catch (error) {
    console.log("Ha ocurrido un error al Cargar Categorias", error);
    res.status(500).send("Error al cargar Categorias");
  }
});

//CARGAR PRODUCTOS
app.get("/cargarProductos/:adminId", async (req, res) => {
  const adminId = req.params.adminId; // Obtener el ID del administrador desde los parámetros de la ruta
  try {
    const resultado = await viewAllProducts(adminId);
    res
      .status(200)
      .send({ message: "Productos Cargados con Éxito", resultado });
  } catch (error) {
    console.log("Ha ocurrido un error al Cargar Productos", error);
    res.status(500).send("Error al cargar Productos");
  }
});

//FILTRAR CATEGORIAS
app.get("/filtrarCategorias/:adminId", async (req, res) => {
  const { categoria_id } = req.query;
  const adminId = req.params.adminId;
  try {
    const response = await viewProductsCategory(categoria_id, adminId);
    res.status(200).send({ message: "Categoria Filtrada", response });
  } catch (error) {
    console.log("Error al Filtrar las Categorias", error);
  }
});

//BUSQUEDA EN TIEMPO REAL SOLO FALTA ESTA FUNCION
app.get("/buscarProductos", async (req, res) => {
  const { nombre } = req.query;
  console.log(nombre);

  try {
    const response = await busquedaProductos(nombre);
    res.status(200).send({ message: "Busqueda Exitosa", response });
  } catch (error) {
    console.log("Error en la busqueda", error);
  }
});

//REGISTRAR PRODUCTOS
app.post("/registerProduct", async (req, res) => {
  const { categoria, nombre, descripcion, precio, cantidad, adminId } =
    req.body;
  const imagen = req.files?.imagen;

  try {
    let nombreUnico = null;

    // Verifica si la imagen fue subida
    if (imagen) {
      // Si hay imagen, genera un nombre único y guarda la imagen
      nombreUnico = `${Date.now()}-${imagen.name}`;

      // Mueve la imagen a la carpeta 'uploads'
      await imagen.mv(`./uploads/${nombreUnico}`);
    }

    const resultado = await insertProducts(
      categoria,
      nombre,
      descripcion,
      precio,
      cantidad,
      nombreUnico,
      adminId
    );

    res
      .status(200)
      .send({ message: "Producto Registrado Correctamente", resultado });
  } catch (error) {
    console.log("Error al Registrar Producto", error);
    res
      .status(500)
      .send({ message: "Error al registrar producto.", error: error.message });
  }
});

//MODIFICAR PRODUCTO
app.put("/updateProduct/:id_producto", async (req, res) => {
  const { categoria, nombre, descripcion, precio, cantidad, adminId } =
    req.body;
  const imagen = req.files?.imagen; // Asegúrate de que req.files esté definido
  const productId = req.params.id_producto;

  try {
    let nombreUnico;

    // Verifica si se ha enviado una nueva imagen
    if (imagen) {
      nombreUnico = `${Date.now()}-${imagen.name}`;
      // Mueve la imagen a la carpeta 'uploads'
      await imagen.mv(`./uploads/${nombreUnico}`);
    }

    // Actualiza el producto en la base de datos
    const resultado = await modificProduct(
      categoria,
      nombre,
      descripcion,
      parseFloat(precio),
      parseInt(cantidad),
      nombreUnico || null, // Solo se actualiza la imagen si se ha enviado una nueva
      productId
    );

    res
      .status(200)
      .send({ message: "Producto Modificado Correctamente", resultado });
  } catch (error) {
    console.log("Error al Modificar Producto", error);
    res
      .status(500)
      .send({ message: "Error al modificar producto.", error: error.message });
  }
});

//ELIMINAR PRODUCTO
app.delete("/deleteProduct/:id_producto", async (req, res) => {
  const productID = req.params.id_producto;

  try {
    const response = await eliminarProducto(productID);

    if (response.affectedRows > 0) {
      // Asegúrate de que el producto fue eliminado
      res
        .status(200)
        .send({ message: "Producto Eliminado con Éxito", id: productID });
    } else {
      res.status(404).send({ message: "Producto no encontrado" });
    }
  } catch (error) {
    console.log("Error al Eliminar Producto", error);
    res
      .status(500)
      .send({ message: "Error al eliminar el producto", error: error.message });
  }
});

//ESCUCHANDO EL SERVIDOR
app.listen(PORT, () => {
  console.log("Server running on port 8800");
});
