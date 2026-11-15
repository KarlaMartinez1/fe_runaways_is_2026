// Contrato para subir las fotos de un bien (H1 y H4).
//se usa una simulacion. Cuando el backend este listo, se reemplazara por la version real.
// (Firebase Storage según el documento de h, se agrega aquí su version real.
export interface ImageStorage {
  uploadPropertyImage(file: File): Promise<string>;
}