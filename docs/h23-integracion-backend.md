# Documentación de Cambios: Integración Frontend-Backend (Historia H23)

**Fecha:** 17 de noviembre de 2026  
**Historia de Usuario:** H23 - Bandeja de Notificaciones  
**Rama:** `feature/h23-notifications-inbox-with-backend`  

---

## 1. Resumen de la Integración

El objetivo de esta integración fue conectar la bandeja de notificaciones (`/notifications`) y el indicador de no leídas en la barra superior (`NotificationBell`) con la API del backend NestJS (`be_runaways_is_2026`).

### Métodos Integrados:
1. `GET http://localhost:8080/api/v1/notifications` (Consulta paginada de notificaciones para el usuario actual)
2. `GET http://localhost:8080/api/v1/notifications/unread-count` (Consulta del contador de notificaciones no leídas)
3. `PATCH http://localhost:8080/api/v1/notifications/:id/read` (Marcar una notificación individual propia como leída)
4. `PATCH http://localhost:8080/api/v1/notifications/read-all` (Marcar todas las notificaciones pendientes como leídas)

---

## 2. Ajustes Técnicos y de Dominio

### 2.1. Adaptación del Contrato de Datos (`lib/repositories/notification-repository.ts` y `lib/repositories/http/notification-repository.http.ts`)
- **Parámetros de consulta en `GET /api/v1/notifications`**:
  - El DTO del backend (`NotificationQueryDto`) acepta estrictamente `page` y `limit` (números enteros >= 1). Debido a la configuración de NestJS (`forbidNonWhitelisted: true`), se eliminó el envío de parámetros adicionales (como `status`) que provocaban error 400.
  - La respuesta del backend devuelve `{ data, total, page, limit, totalPages }`.
  - El repositorio HTTP mapea `limit` a `pageSize` y calcula `totalPages` en caso de discrepancias.
- **Normalización de categorías / módulos de origen**:
  - El backend almacena `originModule` con los valores `RESERVATIONS`, `PAYMENTS`, `MESSAGING` y `VERIFICATION`.
  - Se implementó la función normalizadora `normalizeCategory` para mapear de manera unificada a las etiquetas visuales del frontend (`Reservaciones`, `Pagos`, `Mensajería`, `Verificación`).
- **Concurrencia en `list`**:
  - Se ejecuta en paralelo la obtención de la lista paginada y la llamada a `GET /api/v1/notifications/unread-count` mediante `Promise.all` para garantizar que la vista siempre disponga del conteo actualizado de no leídas.

### 2.2. Exposición de Route Handlers en Next.js (`app/api/v1/notifications/...`)
Para soportar tanto la navegación de usuario con sesión en cookies como peticiones directas de desarrollo o pruebas mediante `Authorization: Bearer <token>`, se habilitaron los siguientes endpoints en Next.js:
- `GET /api/v1/notifications`: Reenvía o consulta `list` con soporte de `page` y `limit` (o `pageSize`).
- `GET /api/v1/notifications/unread-count`: Consulta y responde `{ unreadCount }`.
- `PATCH /api/v1/notifications/[id]/read`: Marca notificación específica como leída.
- `PATCH /api/v1/notifications/read-all`: Marca todas las notificaciones como leídas.

### 2.3. Control de Acceso y Manejo de Errores (`app/notifications/page.tsx`)
- Se implementó la captura de errores `ApiError`:
  - En caso de código 401 (`Unauthorized`), redirige al usuario a `/login`.
  - En caso de código 403 (`Forbidden`), despliega el mensaje amigable de acceso denegado correspondiente a la historia (`notificationMessages.forbidden`).
