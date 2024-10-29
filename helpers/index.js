import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

//INFORMACION NECESARIA PARA CONECTARNOS A LA BASE DE DATOS CONFIGURACION
export const pool = mysql
  .createPool({
    host: process.env.MYSQLDB_HOST,
    user: process.env.MYSQLDB_USER,
    password: process.env.MYSQLDB_PASSWORD,
    database: process.env.MYSQLDB_DATABASE,
    port: process.env.MYSQLDB_PORT,
  })
  .promise();
