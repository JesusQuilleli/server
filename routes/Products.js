import express from "express";
//import fs from "fs";
import sharp from "sharp";
import AWS from 'aws-sdk';
import dotenv from "dotenv";

import { v4 as uuidv4 } from "uuid";

import {
  loadCategory,
  insertProducts,
  viewAllProducts,
  viewProductsCategory,
  busquedaProductos,
  modificProduct,
  eliminarProducto,
  insertCategorias,
  deleteCategoria,
  busquedaProductosPorVenta,
  obtenerProductoPorId,
} from "./../controllers/FunctionsProductos.js";

dotenv.config();

// Configuración de AWS
AWS.config.update({
  accessKeyId: process.env.KEY_ACCESO,
  secretAccessKey: process.env.KEY_SECRET,
  region: 'us-east-2', // Cambia la región según corresponda
});

const s3 = new AWS.S3();

const BUCKET_NAME = process.env.BUCKET_NAME;

var routerProducts = express.Router();

//CARGAR CATEGORIA --VERIFICADO
routerProducts.get("/cargarCategorias/:adminId", async (req, res) => {
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

//AGREGAR CATEGORIA
routerProducts.post("/agregarCategoria", async (req, res) => {
  try {
    const { NOMBRE, ADMINISTRADOR_ID } = req.body;
    const response = await insertCategorias(NOMBRE, ADMINISTRADOR_ID);
    res
      .status(200)
      .send({ message: "Categoria Registrada Exitosamente", response });
  } catch (error) {
    console.log("Error al Registrar Categoria", error);
  }
});

//ELIMINAR CATEGORIA --VERIFICADO
routerProducts.delete("/eliminarCategoria/:ID_CATEGORIA", async (req, res) => {
  try {
    const ID_CATEGORIA = req.params.ID_CATEGORIA;
    const response = await deleteCategoria(ID_CATEGORIA);
    res
      .status(200)
      .send({ message: "Categoria Eliminada Correctamente", response });
  } catch (error) {
    console.error("Error en el servidor al eliminar la Categoria", error);
  }
});

//CARGAR PRODUCTOS --VERIFICADO
routerProducts.get("/cargarProductos/:adminId", async (req, res) => {
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

//FILTRAR CATEGORIAS --VERIFICADO
routerProducts.get("/filtrarCategorias/:adminId", async (req, res) => {
  const { categoria_id } = req.query;
  const adminId = req.params.adminId;
  try {
    const response = await viewProductsCategory(categoria_id, adminId);
    res.status(200).send({ message: "Categoria Filtrada", response });
  } catch (error) {
    console.log("Error al Filtrar las Categorias", error);
  }
});

//BUSQUEDA EN TIEMPO REAL --VERIFICADO
routerProducts.get("/buscarProductos/:adminId", async (req, res) => {
  const { nombre } = req.query;
  const adminId = req.params.adminId;

  try {
    const response = await busquedaProductos(nombre, adminId);
    res.status(200).send({ message: "Busqueda Exitosa", response });
  } catch (error) {
    console.log("Error en la busqueda", error);
  }
});

//REGISTRAR PRODUCTOS --VERIFICADO -- FUNCIONAL SIN S3
// routerProducts.post("/registerProduct", async (req, res) => {
//   const {
//     categoria,
//     nombre,
//     descripcion,
//     precioCompra,
//     precio,
//     cantidad,
//     adminId,
//   } = req.body;

//   const imagen = req.files?.imagen;

//   try {
//     let nombreUnico = null;

//     if (imagen) {
//       // Genera un nombre único para la imagen WebP
//       const uniqueId = uuidv4();
//       nombreUnico = `${uniqueId}.webp`;

//       // Ruta para guardar la imagen convertida
//       const rutaDestino = `./uploads/${nombreUnico}`;

//       // Convierte la imagen a WebP usando Sharp
//       await sharp(imagen.data) // `imagen.data` contiene el buffer de la imagen
//         .webp({ quality: 100 }) // Ajusta la calidad según sea necesario
//         .toFile(rutaDestino);
//     }

//     const resultado = await insertProducts(
//       categoria,
//       nombre,
//       descripcion,
//       precioCompra,
//       precio,
//       cantidad,
//       nombreUnico,
//       adminId
//     );

//     res
//       .status(200)
//       .send({ message: "Producto Registrado Correctamente", resultado });
//   } catch (error) {
//     console.log("Error al Registrar Producto", error);
//     res
//       .status(500)
//       .send({ message: "Error al registrar producto.", error: error.message });
//   }
// });

//CON S3

routerProducts.post("/registerProduct", async (req, res) => {

  const { categoria, nombre, descripcion, precioCompra, precio, cantidad, adminId } = req.body;

  console.log(req.body)

  const imagen = req.files?.imagen;

  console.log(imagen)

  try {
    let imagenURL = null;

    if (imagen) {
      // Genera un nombre único para la imagen
      const uniqueId = uuidv4();
      const nombreUnico = `${uniqueId}.webp`;

      // Convierte la imagen a formato WebP usando Sharp
      const bufferImagen = await sharp(imagen.data)
        .webp({ quality: 80 }) // Puedes ajustar la calidad
        .toBuffer(); // Convierte la imagen a un buffer

      // Sube la imagen a S3
      const params = {
        Bucket: BUCKET_NAME, // Tu nombre de bucket en S3
        Key: nombreUnico, // El nombre del archivo que se guardará
        Body: bufferImagen, // El archivo de imagen como buffer
        ContentType: 'image/webp', // Tipo de contenido
        ACL: 'public-read', // El archivo será público
      };

      // Sube el archivo a S3
      const data = await s3.upload(params).promise();

      console.log("Retorno de direccion de la imagen: ", data)

      imagenURL = data.Location; // URL pública de la imagen subida
    }

    const resultado = await insertProducts(
      categoria,
      nombre,
      descripcion,
      precioCompra,
      precio,
      cantidad,
      imagenURL,
      adminId
    );

    res.status(200).send({ message: "Producto Registrado Correctamente", resultado });
  } catch (error) {
    console.error("Error al Registrar Producto", error);
    res.status(500).send({ message: "Error al registrar producto.", error: error.message });
  }
});

//MODIFICAR PRODUCTO --VERIFICADO --FUNCIONAL SIN S3
// routerProducts.put("/updateProduct/:id_producto", async (req, res) => {
//   const { categoria, nombre, descripcion, precioCompra, precio, cantidad } =
//     req.body;
//   const imagen = req.files?.imagen;
//   const productId = req.params.id_producto;

//   try {
//     let nombreUnico = null;

//     // Obtener el producto actual de la base de datos (incluyendo su imagen)
//     const productoActual = await obtenerProductoPorId(productId); // Función que obtiene el producto actual por su ID

//     if (!productoActual) {
//       return res.status(404).send({ message: "Producto no encontrado." });
//     }

//     // Verifica si se ha enviado una nueva imagen
//     if (imagen) {
//       // Genera un nombre único para la nueva imagen
//       const uniqueId = uuidv4();
//       nombreUnico = `${uniqueId}.webp`; // Fijamos siempre la extensión .webp

//       const rutaDestino = `./uploads/${nombreUnico}`;

//       // Convierte la nueva imagen a WebP y guárdala
//       await sharp(imagen.data)
//         .webp({ quality: 80 }) // Ajusta la calidad según sea necesario
//         .toFile(rutaDestino);

//       // Elimina la imagen antigua si existe
//       if (productoActual.IMAGEN) {
//         const rutaAntigua = `./uploads/${productoActual.IMAGEN}`;
//         if (fs.existsSync(rutaAntigua)) {
//           fs.unlinkSync(rutaAntigua); // Borra la imagen antigua
//         }
//       }
//     } else {
//       // Si no se envía una nueva imagen, conserva la actual
//       if (productoActual.IMAGEN) {
//         nombreUnico = productoActual.IMAGEN; // Usa la imagen actual
//       } else {
//         nombreUnico = null; // O un valor predeterminado según tu lógica
//       }
//     }

//     // Actualiza el producto en la base de datos
//     const resultado = await modificProduct(
//       categoria,
//       nombre,
//       descripcion,
//       parseFloat(precioCompra),
//       parseFloat(precio),
//       parseInt(cantidad),
//       nombreUnico,
//       productId
//     );

//     res
//       .status(200)
//       .send({ message: "Producto Modificado Correctamente", resultado });
//   } catch (error) {
//     // Manejo de errores de red
//     if (
//       error.code === "ECONNREFUSED" ||
//       error.message.includes("Network Error")
//     ) {
//       console.error("Fallo en la conexión:", error);
//       return res
//         .status(500)
//         .send({ message: "Fallo en la conexión, intente nuevamente." });
//     }

//     console.error("Error al Modificar Producto:", error);
//     res
//       .status(500)
//       .send({ message: "Error al modificar producto.", error: error.message });
//   }
// });

//CON S3
routerProducts.put("/updateProduct/:id_producto", async (req, res) => {
  const { categoria, nombre, descripcion, precioCompra, precio, cantidad } =
    req.body;
  const imagen = req.files?.imagen;
  const productId = req.params.id_producto;

  try {
    let nombreUnico = null;

    // Obtener el producto actual de la base de datos (incluyendo su imagen)
    const productoActual = await obtenerProductoPorId(productId);

    if (!productoActual) {
      return res.status(404).send({ message: "Producto no encontrado." });
    }

    // Verifica si se ha enviado una nueva imagen
    if (imagen) {
      // Genera un nombre único para la nueva imagen
      const uniqueId = uuidv4();
      nombreUnico = `${uniqueId}.webp`;

      // Convierte la nueva imagen a WebP y obtén el buffer
      const bufferImagen = await sharp(imagen.data)
        .webp({ quality: 80 })
        .toBuffer();

      // Subir la nueva imagen a S3
      const params = {
        Bucket: BUCKET_NAME,
        Key: nombreUnico,
        Body: bufferImagen,
        ContentType: 'image/webp',
        ACL: 'public-read', // Establecer la imagen como pública
      };

      // Subir la nueva imagen a S3
      await s3.upload(params).promise();

      // Elimina la imagen antigua de S3 si existe
      if (productoActual.IMAGEN) {
        const deleteParams = {
          Bucket: BUCKET_NAME,
          Key: productoActual.IMAGEN, // El nombre de la imagen antigua
        };
        await s3.deleteObject(deleteParams).promise(); // Elimina la imagen de S3
      }
    } else {
      // Si no se envía una nueva imagen, conserva la actual
      if (productoActual.IMAGEN) {
        nombreUnico = productoActual.IMAGEN;
      } else {
        nombreUnico = null;
      }
    }

    // Actualiza el producto en la base de datos
    const resultado = await modificProduct(
      categoria,
      nombre,
      descripcion,
      parseFloat(precioCompra),
      parseFloat(precio),
      parseInt(cantidad),
      nombreUnico,
      productId
    );

    res
      .status(200)
      .send({ message: "Producto Modificado Correctamente", resultado });
  } catch (error) {
    console.error("Error al Modificar Producto:", error);
    res
      .status(500)
      .send({ message: "Error al modificar producto.", error: error.message });
  }
});

// ELIMINAR PRODUCTO --FUNCIONAL SIN S3
// routerProducts.delete("/deleteProduct/:id_producto", async (req, res) => {
//   const productID = req.params.id_producto;

//   try {
//     const response = await eliminarProducto(productID);

//     if (response.affectedRows > 0) {
//       // Eliminar la imagen si existe
//       if (response.imagen) {
//         fs.unlinkSync(`./uploads/${response.imagen}`);
//       }

//       res
//         .status(200)
//         .send({ message: "Producto Eliminado con Éxito", id: productID });
//     } else {
//       res.status(404).send({ message: "No se pudo eliminar el producto" });
//     }
//   } catch (error) {
//     console.log("Error al Eliminar Producto", error);
//     res
//       .status(500)
//       .send({ message: "Error al eliminar el producto", error: error.message });
//   }
// });

//CON S3
routerProducts.delete("/deleteProduct/:id_producto", async (req, res) => {
  const productID = req.params.id_producto;

  try {
    const response = await eliminarProducto(productID);

    if (response.affectedRows > 0) {
      // Eliminar la imagen de S3 si existe
      if (response.imagen) {
        const deleteParams = {
          Bucket: BUCKET_NAME,
          Key: response.imagen, // Nombre de la imagen asociada
        };
        await s3.deleteObject(deleteParams).promise(); // Elimina la imagen de S3
      }

      res
        .status(200)
        .send({ message: "Producto Eliminado con Éxito", id: productID });
    } else {
      res.status(404).send({ message: "No se pudo eliminar el producto" });
    }
  } catch (error) {
    console.log("Error al Eliminar Producto", error);
    res
      .status(500)
      .send({ message: "Error al eliminar el producto", error: error.message });
  }
});

//VER PRODUCTOS POR VENTA --VERIFICADO
routerProducts.get(
  "/verProductosPorVenta/:adminId/:ventaId",
  async (req, res) => {
    const adminId = req.params.adminId;
    const ventaId = req.params.ventaId;

    try {
      // Llamamos a la función que obtiene los productos por venta
      const response = await busquedaProductosPorVenta(ventaId, adminId);

      if (response && response.length > 0) {
        res.status(200).send({
          message: "Productos obtenidos con éxito",
          data: response,
        });
      } else {
        res.status(404).send({
          message: "No se encontraron productos para esta venta",
          data: [],
        });
      }
    } catch (err) {
      console.error("Error al obtener los productos por venta:", err);
      res.status(500).send({
        message: "Error al obtener los productos por venta",
      });
    }
  }
);

export { routerProducts };
