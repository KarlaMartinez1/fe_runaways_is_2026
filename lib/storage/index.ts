import type { ImageStorage } from "./image-storage";
import { mockImageStorage } from "./mock-image-storage";

// Interruptor del subidor de fotos. Hoy siempre usa la simulación.
// Al conectar con el backend, se cambia esta línea por la versión real.
export const imageStorage: ImageStorage = mockImageStorage;