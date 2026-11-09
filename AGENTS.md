# AGENTS.md: Frontend Runaways

Proyecto 4: Plataforma de renta/alquiler de equipo o espacios (UCA, ciclo 02/2026, Sección 01). Equipo Runaways.
Este repo es el frontend, un fork de `fe_boilerplate_is_2026`. El backend vive en otro repo.
La fuente de verdad funcional es el documento de historias de usuario del equipo. Respeta sus rutas, roles, estados, mensajes y criterios tal como están redactados. Si algo del código choca con el documento o con el AGENTS del backend, pregunta antes de cambiarlo.

## Reglas (no negociables)

- No crear repos nuevos. Se trabaja sobre el fork del equipo, con ramas `feature/<descripcion>` hacia `develop` y Pull Requests aprobados por otro integrante.
- Los commits empiezan con el nombre corto de la historia, por ejemplo `Publicar bien: agregar validación de fotos`.
- Stack: Next.js (App Router) con React y TypeScript, sobre `fe_boilerplate_is_2026`.
- Ninguna pantalla usa datos quemados. Todo dato entra por un repositorio (ver "Arquitectura").
- La identidad y el rol siempre salen de la sesión. El frontend nunca envía el precio, el subtotal, el arrendador ni el identificador del destinatario de una notificación.
- No se guarda ni se envía el número completo de la tarjeta ni el CVC.
- El README lleva los nombres completos de los integrantes y su rol.
- Las decisiones de arquitectura de frontend (librería de estado, forma de consumir el API, manejo de sesión) se documentan en `/docs` con su justificación.

## Sesión y autenticación

- El backend responde el JWT de acceso (15 minutos) y el token de renovación (7 días). El frontend lo guarda en la cookie `session` (HttpOnly).
- Login y registro pasan por rutas de servidor de Next.js (`app/api/auth/...`), que llaman al backend y escriben la cookie. El código cliente nunca lee el token.
- Next.js renueva la sesión con el refresh token antes de que venza el access token y guarda el par rotado en `session`. Esta lógica vive en un único helper de servidor.
- Tras un cambio de rol (`PATCH /api/v1/profile/role`), la respuesta trae un token nuevo. El frontend reemplaza la cookie y actualiza el estado global de inmediato.
- Roles (valores de la API, se respetan tal cual): `TENANT`, `OWNER`, `ADMIN`. Las etiquetas de la interfaz son "Arrendatario", "Arrendador" y "Administrador".
- Un usuario tiene un solo rol activo. Un `OWNER` no ve las funciones exclusivas de `TENANT` mientras mantenga ese rol.
- `ADMIN` no se asigna desde la interfaz.
- Sin sesión: redirige a `/login`. Sesión sin permiso: pantalla `AccesoDenegado` con el mensaje "No tienes permiso para ver esta página".

## Arquitectura

Estructura de carpetas:

- `app/`: rutas de Next.js.
- `components/`: componentes de cada funcionalidad.
- `components/ui/`: componentes genéricos.
- `lib/api/`: cliente HTTP, tipos de la API y mapeo de errores.
- `lib/repositories/`: interfaz por dominio (`propertyRepository`, `bookingRepository`, `paymentRepository`, `conversationRepository`, `notificationRepository`, `profileRepository`, `adminRepository`, `reportRepository`, `authRepository`) y su implementación HTTP.
- `lib/repositories/mock/`: implementación de prueba con fixtures, solo para desarrollo sin backend y para pruebas. Las pantallas no la conocen.
- `lib/repositories/index.ts`: fábrica única que elige la implementación. Conectar el backend real es cambiar esa fábrica.
- `lib/hooks/`: hooks que llaman a los repositorios. Son la única forma en que una pantalla obtiene datos.
- `lib/stores/`: estado global, solo sesión y rol.
- `lib/messages/`: textos de la interfaz copiados del documento, sin reescribirlos.
- `lib/payments/`: lógica del pago simulado.

Estado:
- Global: sesión y rol. Librería de estado a definir por el equipo (por ejemplo Zustand), documentada en `/docs`.
- Local: valores de formularios, página, modales.
- Filtros del catálogo: en la URL (por ejemplo `/properties?q=camara&category=EQUIPO`), para recargar o compartir.

Errores de la API: `{ code, message, field? }`. Mapear por `code` al mensaje de la historia:
- 401: redirige a `/login`.
- 403: `AccesoDenegado`.
- 404 en bien o reserva ajena: "Este bien ya no está disponible" o "Reserva no encontrada", según la pantalla.
- 409: mensaje específico de la historia (por ejemplo "Estas fechas ya no están disponibles. Elige otras.").
- 429 en login: bloqueo temporal.
- Error de servidor: mensaje genérico de la pantalla.

Protección de rutas: `middleware.ts` revisa sesión y rol según la tabla de rutas de este documento. La interfaz oculta lo que no corresponde, pero no es la única defensa: el backend valida todo.

## Pantallas y rutas 
    todas las vistas generadas deben ser responsive para diferentes dispositivos (desktop y moviles)

### Autenticación y cuenta

- `/login` · público · Inicio de sesión. Mensaje genérico "Correo o contraseña incorrectos".
- `/register` · público · Registro de cuenta. Crea cuenta con rol Arrendatario por defecto. Los campos y el texto se confirman con el backend (ver "Decisiones pendientes").
- `/profile/settings` · TENANT, OWNER · Cambio de rol entre Arrendatario y Arrendador. Muestra los bloqueos (reservas o depósitos activos).
- `/profile/verification` · TENANT, OWNER · Verificar mi cuenta. Subir documento de identidad y ver su estado (Sin verificar, Pendiente, Verificada, Rechazada).

### Catálogo y bienes

- `/properties` · TENANT, OWNER · Catálogo de bienes en renta, búsqueda por criterios, filtro por rango de precio y filtro por disponibilidad de fechas. 12 bienes por página, con "Anterior" y "Siguiente" y el texto "Página X de Y".
- `/properties/[id]` · TENANT · Detalle del bien: galería, información, calificación, aviso "Requiere cuenta verificada", calendario de disponibilidad de 90 días, sección Reservar (solo TENANT) y botón "Preguntar".
- `/properties/new` · OWNER · Publicar un bien.
- `/properties/mine` · OWNER · Mis publicaciones (DISPONIBLE y PAUSADO, 12 por página).
- `/properties/[id]/edit` · OWNER dueño · Gestión y edición del bien, pausar, reactivar y eliminar.
- `/properties/[id]/availability` · OWNER dueño · Gestionar disponibilidad: bloquear y eliminar fechas.

### Reservas y pagos

- `/bookings/mine` · TENANT · Mis reservas. 10 por página, filtro por estado, botón "Pagar" (si está PENDIENTE), botón "Calificar" (si está FINALIZADA y dentro del plazo), enlace al depósito en solo lectura y al recibo.
- `/bookings/[id]/payment` · TENANT dueño · Pago de reserva con el componente de pago simulado y resumen de cobro.
- `/bookings/[id]/receipt` · TENANT dueño · Recibo de pago (reservas PAGADA o FINALIZADA).
- `/bookings/[id]/movements` · TENANT dueño, OWNER dueño · Historial de movimientos: fecha, tipo, monto y motivo. Vacío: "Aún no hay movimientos".
- `/bookings/[id]/deposit` · OWNER dueño (decisión), TENANT dueño (solo lectura) · Depósito de garantía: devolver o retener.
- `/lessor/bookings` · OWNER · Reservas de mis bienes. 10 por página, filtros por bien y estado, acciones "Registrar entrega" y "Registrar devolución" con confirmación.
- `/reservations/[id]/rate-property` · TENANT dueño · Calificar mi renta (puntuación del bien, del arrendador y comentario).
- `/reservations/[id]/rate-renter` · OWNER dueño · Calificar arrendatario.

### Mensajería

- `/messages` · TENANT, OWNER · Lista de conversaciones con indicador de no leído.
- `/messages/[conversationId]` · participantes del hilo · Hilo de conversación con envío de mensajes de 1 a 500 caracteres.

### Administración de verificación

- `/admin/verifications` · ADMIN · Documentos pendientes, 10 por página, del más antiguo al más reciente.
- `/admin/verifications/[userId]` · ADMIN · Revisar documento: visor de imagen o PDF, "Aprobar" y "Rechazar" con motivo de 10 a 300 caracteres.

### Notificaciones

- `/notifications` · TENANT, OWNER, ADMIN · Bandeja con contador, marcar como leída y marcar todas como leídas. 10 por página. Polling del contador cada 30 segundos y actualización al enfocar la pestaña o entrar a la ruta.
- `Campana` en la barra superior muestra el contador de no leídas.

### Reportes del arrendador

- `/lessor/reports` · OWNER · Panel de ingresos: total, desglose en alquileres y depósitos retenidos, filtro Desde/Hasta, y tabla de ingresos por bien con orden de mayor a menor o viceversa.
- `/lessor/reports/ratings` · OWNER · Calificación promedio por bien con un decimal y cantidad de reseñas. Solo lectura.
- `/lessor/reports/occupancy` · OWNER · Tasa de ocupación por bien con un decimal. Período por defecto: últimos 30 días. Máximo 365 días.

## Componentes compartidos (construir una sola vez)

- `PropertyCard` (tarjeta de bien): lo usan el catálogo, "Mis publicaciones" y los resultados de búsqueda.
- `PropertyGallery`: miniaturas interactivas, portada primero. Lo usan el detalle y la edición.
- `CalendarioDisponibilidad`: calendario de 90 días con "Libre" (verde) y "Ocupado" (gris). Lo usan el detalle del bien (lectura) y la gestión de bloqueos.
- `SelectorFechas`: fecha de inicio y de fin con límites de hoy a hoy + 89 días y máximo de 30 días.
- `ResumenReserva`: días, subtotal y depósito. Lo usan la reserva y el pago.
- `PasarelaPagoSimulada`: formulario de tarjeta (16 dígitos, MM/AA no vencida, CVC de 3 dígitos). Lógica en `lib/payments/`. Espera 2 segundos y decide por los últimos 4 dígitos: 4242 aprueba, 0002 rechaza con "Fondos insuficientes. Intenta con otra tarjeta", cualquier otra rechaza con "Tarjeta no válida". Solo llama a `POST /api/v1/payments` cuando aprueba.
- `DatosDeposito` / `ModalDecisionDeposito`: devolver o retener, con monto y motivo.
- `SelectorEstrellas` y `ContadorCaracteres` (0/200 y 0/500): reseñas y mensajes.
- `ChatHilo` (lista de mensajes) y `ComposerMensaje`.
- `VisorDocumento`: imagen o PDF, usado por la revisión del ADMIN.
- `EtiquetaVerificacion`: colores de la cuenta (gris, amarilla, verde, roja).
- `BadgeEstado`: etiqueta por estado, con la tabla de abajo.
- `FiltrosBusqueda` y `EtiquetasFiltro` (chips con "x", que vuelven a buscar al quitarse).
- `Campana`: contador de notificaciones no leídas con polling.
- `Tabla` con paginación de 10 y filtros.
- `Paginador` ("Anterior", "Siguiente", "Página X de Y").
- `Modal` (incluida la confirmación de acciones irreversibles).
- `EstadoVacio`, `EstadoCargando` (esqueleto), `EstadoError` (con botón "Reintentar" cuando aplique).
- `AccesoDenegado`.

## Etiquetas de estado (solo en la UI)

Los valores de la API se respetan tal cual. La traducción se hace solo en `BadgeEstado`.

- Bien: `DISPONIBLE` → "Disponible", `PAUSADO` → "Pausado", `ELIMINADO` → "Eliminado".
- Reserva: `PENDIENTE` → "Pendiente", `PAGADA` → "Pagada", `FINALIZADA` → "Finalizada", `CANCELADA` → "Cancelada".
- Depósito: `PENDIENTE` → "Pendiente de decisión", `DEVUELTO` → "Depósito devuelto", `RETENIDO` → "Depósito retenido", `RETENIDO_PARCIAL` → "Depósito retenido parcialmente".
- Documento: `PENDIENTE`, `APROBADO`, `RECHAZADO`.
- Cuenta (calculada): `SIN_VERIFICAR` → "Sin verificar" (gris), `PENDIENTE` → "Pendiente" (amarilla), `VERIFICADA` → "Verificada" (verde), `RECHAZADA` → "Rechazada" (roja).
- Notificación: `UNREAD` (no leída), `READ` (leída).

## Historias sin pantalla propia

- Servicio de emisión de notificaciones: solo backend. El frontend consume la bandeja.
- Verificación obligatoria para reservar y pagar: el backend responde `VERIFICATION_REQUIRED`. El frontend muestra "Debes verificar tu cuenta para rentar." con el enlace "Verificar mi cuenta" en el detalle del bien, en "Reservar" y en el pago.

## Textos

- Los mensajes de la interfaz se copian del documento de historias, sin reescribirlos, y se guardan en `lib/messages/`.
- Textos de la interfaz en español. Código e identificadores en inglés.
- Los valores de enum se respetan tal cual (`DISPONIBLE`, `OWNER`, `RETENIDO_PARCIAL`) y se traducen solo en la UI.
- Montos en USD con dos decimales, recibidos como texto decimal (por ejemplo "45.00").
- Fechas de reserva sin hora, en horario de El Salvador. Entrega y devolución sí muestran fecha y hora.

## Decisiones pendientes de confirmar

- Nombres de roles: la historia usa ARRENDATARIO y ARRENDADOR; el AGENTS del backend usa TENANT y OWNER. Este documento sigue el backend.
- Registro: la historia pide nombre, apellido, correo, teléfono y contraseña. El AGENTS del backend dice que el registro recibe `name`, `email` y `password`, y que el perfil no incluye apellido ni teléfono. Hay que decidir antes de construir `/register`.
- Endpoints de reservas que el frontend necesita y que no aparecen en la tabla del backend: `GET /api/v1/bookings/:id/paymentsummary`, `GET /api/v1/bookings/:id/receipt`, `GET /api/v1/bookings/:id/movements`, `GET /api/v1/bookings/:id/deposit`, `GET /api/v1/properties/:id/blocks`, `GET /api/v1/profile/document` y `GET /api/v1/users/:userId/document/file`.

## Definición de terminado

- Cada pantalla tiene pruebas de componente para éxito, error y carga, y para vacío cuando aplique.
- Ninguna pantalla contiene datos quemados. Los datos llegan por hooks y repositorios.
- Los textos vienen de `lib/messages/`.
- Las rutas, roles y estados coinciden con este documento.
- Antes de un PR: `npm run lint`, `npm run build` y `npm test` deben pasar, y no puede haber errores en consola.
- Las decisiones nuevas están documentadas en `/docs`.

## Comandos

- `docker compose up -d`: base de datos y backend en local (repo del backend).
- `npm run dev`: frontend en local. La URL del API está en `.env.example`.
- `npm test`, `npm run lint`, `npm run build`.

## Figma

- Archivo: https://www.figma.com/design/hCZtEkMdrhySzZl9psrXJD/Runaways?node-id=0-1&t=nqBVMU5UnnJdD5i7-1i