import express from "express";

import {
  loadClients,
  insertClients,
  editClient,
  deleteClient,
  busquedaCliente
} from "./../controllers/FunctionsClients.js";

const routesClients = express.Router();

//CARGAR CLIENTES --VERIFICADO
routesClients.get("/cargarClientes/:adminId", async (req, res) => {
  const adminId = req.params.adminId;
  try {
    const result = await loadClients(adminId);
    res.status(200).send({ message: "Clientes Cargados con Exito", result });
  } catch (err) {
    console.error("Error al cargar Clientes", err);
  }
});

//INSERTAR CLIENTE --VERIFICADO
routesClients.post("/insertarCliente", async (req, res) => {
  try {
    const { cedulaCliente, nombre, telefono, correo, direccion, fecha, adminId } = req.body;
    const resultado = await insertClients(
      cedulaCliente,
      nombre,
      telefono,
      correo,
      direccion,
      fecha,
      adminId
    );
    res
      .status(200)
      .send({ message: "Cliente Registrado Exitosamente", resultado });
  } catch (err) {
    console.error("Error al Registrar Cliente", err);
  }
});

//EDITAR CLIENTE --VERIFICADO
routesClients.put("/updateCliente/:id_cliente", async (req, res) => {
  try {
    const { nombre, telefono, correo, direccion } = req.body;
    const ClientID = req.params.id_cliente;

    const resultado = await editClient(
      nombre,
      telefono,
      correo,
      direccion,
      ClientID
    );

    res
      .status(200)
      .send({ message: "Cliente Modificado Correctamente", resultado });
  } catch (err) {
    console.error("Error al Modificar Cliente", err);
  }
});

//ELIMINAR CLIENTE --VERIFICADO
routesClients.delete("/eliminarCliente/:id_cliente", async (req, res) => {
  try {
    const clientID = req.params.id_cliente;

    const response = await deleteClient(clientID);

    if (response.affectedRows > 0) {
      res
        .status(200)
        .send({ message: "Cliente Eliminado con Éxito", id: clientID });
    } else {
      res.status(404).send({ message: "Cliente no encontrado" });
    }
  } catch (error) {
    console.log("Error al Eliminar Cliente", error);
    res
      .status(500)
      .send({ message: "Error al eliminar el cliente", error: error.message });
  }
});

//FILTRAR CLIENTE --VERIFICADO
routesClients.get("/buscarCliente", async (req, res) => {
  const { nombre } = req.query;

  try {
    const response = await busquedaCliente(nombre);
    res.status(200).send({ message: "Busqueda Exitosa", response });
  } catch (error) {
    console.log("Error en la busqueda", error);
  }
});

export { routesClients };
