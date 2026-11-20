// Textos de "Verificación de identidad" (H19). Títulos y textos de la pantalla: Figma.
// Mensajes de éxito y reglas: card de Trello H19.
export const identityDocumentMessages = {
  // Encabezado
  title: "Verificación de identidad",
  subtitle: "Sube tu documento de identidad para verificar tu cuenta y poder rentar o publicar",

  // Formulario
  formTitle: "Formulario de verificación",
  typeLabel: "Tipo de documento",
  typeOptions: { DUI: "DUI", PASSPORT: "Pasaporte" },
  numberLabel: "Número de documento",
  duiPlaceholder: "00000000-0",
  fileLabel: "Documento (JPG, PNG o PDF, máx. 5 MB)",
  dropzone: "Arrastra tu archivo o selecciónalo",
  removeFile: "Quitar",
  previewAlt: "Vista previa del documento",
  submit: "Enviar documento",
  submitting: "Enviando...",

  // Estado
  statusTitle: "Estado de verificación",
  reviewInfo:
    "Tu documento será evaluado por un administrador. Te notificaremos una vez que el estado cambie; este proceso puede tardar hasta 24 horas.",
  requirementsTitle: "Requisitos del documento",
  // El backend recibe un solo archivo, por eso se pide solo el frente del documento.
  requirements: [
    "Debe ser legible y estar vigente.",
    "Debe mostrarse completo y de frente.",
    "El número ingresado debe coincidir con el de la imagen subida.",
  ],
  rejectionLabel: "Motivo:",
  uploadNew: "Subir nuevo documento",

  // Resultado
  submitted: "Documento enviado. Te avisaremos cuando sea revisado.",
  alreadySubmitted: "Ya tienes un documento pendiente de revisión o tu cuenta ya está verificada.",
  loadError: "No se pudo cargar el estado de verificación. Intente de nuevo.",
  saveError: "No se pudo enviar el documento. Intente de nuevo.",
  forbidden: "No tienes permiso para ver esta página",

  // Validaciones
  typeRequired: "Seleccione el tipo de documento.",
  numberRequired: "Ingrese el número de documento.",
  duiFormat: "El número de DUI debe tener el formato 00000000-0.",
  passportFormat: "El número de pasaporte debe tener de 6 a 15 letras o números.",
  fileRequired: "Seleccione un archivo.",
  fileType: "Solo se permiten archivos JPG, PNG o PDF.",
  fileSize: "El archivo debe pesar máximo 5 MB.",
};