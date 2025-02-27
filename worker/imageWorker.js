import { parentPort } from "worker_threads";
import sharp from "sharp";

parentPort.on("message", async (imagenBuffer) => {
  try {
    // Procesar la imagen con sharp
    const bufferImagen = await sharp(imagenBuffer).webp({ quality: 80 }).toBuffer();
    // Enviar el resultado al hilo principal
    parentPort.postMessage(bufferImagen);
  } catch (error) {
    // Enviar el error al hilo principal
    parentPort.postMessage({ error: error.message });
  }
});