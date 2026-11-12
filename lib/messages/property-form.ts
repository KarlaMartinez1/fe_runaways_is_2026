// Textos de la pantalla "Publicar un bien o equipo" (H1) y de la edición (H4).
// Títulos y etiquetas. Mensajes de éxito y error del servidor: documento de historias.
export const propertyFormMessages = {
  // Encabezado
  createTitle: "Publicar un bien o equipo",
  requiredHint: "Los campos con * son obligatorios",
  backToMine: "Volver a mis publicaciones",

  // Secciones
  basicSection: "Información básica",
  locationSection: "Ubicación",
  pricesSection: "Precios (USD)",
  photosSection: "Fotografías",

  // Campos
  titleLabel: "Nombre del bien o equipo",
  descriptionLabel: "Descripción detallada",
  categoryLabel: "Categoría",
  categoryPlaceholder: "Seleccione categoría",
  departmentLabel: "Departamento",
  departmentPlaceholder: "Seleccione departamento",
  municipalityLabel: "Municipio",
  municipalityPlaceholder: "Seleccione municipio",
  addressLabel: "Dirección exacta",
  addressNote:
    "Solo se mostrará a quien tenga reserva pagada, en el catálogo solo es visible departamento y municipio",
  priceLabel: "Precio por día",
  depositLabel: "Depósito de garantía",
  depositHint: "Campo vacío se muestra como “Sin depósito”.",
  counter: (length: number, max: number) => `${length} / ${max}`,

  // Fotografías
  photosHint: "JPG o PNG, máximo 5 MB cada una. Primera foto se asigna como portada.",
  cover: "Portada",
  removePhoto: "Quitar",
  addPhoto: "+ Agregar",
  photoAlt: (number: number) => `Foto ${number}`,

  // Vista previa y pie
  previewTitle: "Vista previa",
  previewPlaceholderTitle: "Nombre del bien",
  availabilityNote: "Tu bien estará disponible todos los días. Podrás bloquear fechas después en",
  availabilityLink: "Editar bien o equipo",
  cancel: "Cancelar",
  publish: "Publicar",
  publishing: "Publicando...",

  // Resultado
  published: "Bien publicado exitosamente",
  saveError: "No se pudo guardar. Intente de nuevo.",
  forbidden: "No tienes permiso para ver esta página",

  // Validaciones
  titleRequired: "Ingrese el nombre del bien.",
  titleMax: "El nombre no puede superar 100 caracteres.",
  descriptionMin: "La descripción debe tener al menos 30 caracteres.",
  descriptionMax: "La descripción no puede superar 250 caracteres.",
  categoryRequired: "Seleccione una categoría.",
  departmentRequired: "Seleccione un departamento.",
  municipalityRequired: "Seleccione un municipio.",
  addressRequired: "Ingrese la dirección.",
  addressMax: "La dirección no puede superar 250 caracteres.",
  priceRequired: "Ingrese el precio por día.",
  priceInvalid: "Ingrese un valor numérico mayor a 0.",
  priceRange: "El precio debe estar entre $0.01 y $9999.99.",
  depositInvalid: "Ingrese un valor numérico válido.",
  depositRange: "El depósito debe estar entre $0.00 y $9999.99.",
  decimals: "Máximo 2 decimales.",
  photosRequired: "Agregue al menos 1 foto.",
  photosMax: "Puede subir máximo 5 fotos.",
  photoType: "Solo se permiten fotos JPG o PNG.",
  photoSize: "Cada foto debe pesar máximo 5 MB.",
};