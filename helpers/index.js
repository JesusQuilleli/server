import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

//INFORMACION NECESARIA PARA CONECTARNOS A LA BASE DE DATOS CONFIGURACION
export const pool = mysql.createPool({
   host: 'mysqldb',
   user: 'root',
   password: 'devjesus',
   database: 'store_database',
   port: 3306
 })
 .promise();