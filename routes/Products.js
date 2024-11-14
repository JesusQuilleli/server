import express from "express";
import fs from 'fs'; 

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
  busquedaProductosPorVenta
} from "./../controllers/FunctionsProductos.js";

var routerProducts = express.Router();

//CARGAR CATEGORIA
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

//ELIMINAR CATEGORIA
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

//CARGAR PRODUCTOS
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

//FILTRAR CATEGORIAS
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

//BUSQUEDA EN TIEMPO REAL 
routerProducts.get("/buscarProductos", async (req, res) => {
  const { nombre } = req.query;

  try {
    const response = await busquedaProductos(nombre);
    res.status(200).send({ message: "Busqueda Exitosa", response });
  } catch (error) {
    console.log("Error en la busqueda", error);
  }
});

//REGISTRAR PRODUCTOS
routerProducts.post("/registerProduct", async (req, res) => {
  const { categoria, nombre, descripcion, precioCompra, precio, cantidad, adminId } =
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
      precioCompra,
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
routerProducts.put("/updateProduct/:id_producto", async (req, res) => {
  const { categoria, nombre, descripcion, precioCompra, precio, cantidad, adminId } =
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
      parseFloat(precioCompra),
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

// ELIMINAR PRODUCTO
routerProducts.delete("/deleteProduct/:id_producto", async (req, res) => {
  const productID = req.params.id_producto;

  try {
    const response = await eliminarProducto(productID);

    if (response.affectedRows > 0) {
      // Eliminar la imagen si existe
      if (response.imagen) {
        fs.unlinkSync(`./uploads/${response.imagen}`);
      }
      
      res.status(200).send({ message: "Producto Eliminado con Éxito", id: productID });
    } else {
      res.status(404).send({ message: "No se pudo eliminar el producto" });
    }
  } catch (error) {
    console.log("Error al Eliminar Producto", error);
    res.status(500).send({ message: "Error al eliminar el producto", error: error.message });
  }
});

//VER PRODUCTOS POR VENTA
routerProducts.get("/verProductosPorVenta/:adminId/:ventaId", async (req, res) => {
  const adminId = req.params.adminId;
  const ventaId = req.params.ventaId;

  try {
    // Llamamos a la función que obtiene los productos por venta
    const response = await busquedaProductosPorVenta(ventaId, adminId);

    if (response && response.length > 0) {
      res.status(200).send({
        message: "Productos obtenidos con éxito",
        data: response
      });
    } else {
      res.status(404).send({
        message: "No se encontraron productos para esta venta",
        data: []
      });
    }
  } catch (err) {
    console.error("Error al obtener los productos por venta:", err);
    res.status(500).send({
      message: "Error al obtener los productos por venta"
    });
  }
});

export { routerProducts };
