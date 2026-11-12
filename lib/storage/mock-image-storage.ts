import type { ImageStorage } from "./image-storage";

const MOCK_UPLOAD_DELAY_MS = 400;

// Simula la subida: espera un momento y devuelve un link de foto de prueba.
// No guarda el archivo real, porque los datos de prueba viven en memoria.
export const mockImageStorage: ImageStorage = {
  async uploadPropertyImage(file) {
    await new Promise((resolve) => setTimeout(resolve, MOCK_UPLOAD_DELAY_MS));
    const seed = encodeURIComponent(`${file.name}-${file.size}-${Date.now()}`);
    return `https://picsum.photos/seed/${seed}/600/400`;
  },
};