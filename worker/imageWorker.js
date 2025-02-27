import { parentPort } from "worker_threads";
import sharp from "sharp";

parentPort.on("message", async (imagenBuffer) => {
  try {
    const bufferImagen = await sharp(imagenBuffer).webp({ quality: 80 }).toBuffer();
    parentPort.postMessage(bufferImagen);
  } catch (error) {
    parentPort.postMessage({ error: error.message });
  }
});
