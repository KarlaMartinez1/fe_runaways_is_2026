# Integración Frontend-Backend (Historia H26)

**Historia de Usuario:** H26 - Visualización de calificaciones del bien (arrendador)  
**Pantalla:** Calificaciones de bienes, rutas `/owner/reports/ratings` y `/lessor/reports/ratings` (rol `OWNER`)  
**Endpoint:** `GET /api/v1/owner/reports/ratings?order=asc` (soporta `order`, `page`, `pageSize`)

---

## 1. Contrato del backend

El backend expone en NestJS el endpoint autenticado bajo `@Controller('owner/reports')` -> `@Get('ratings')` con prefijo global `api/v1`:

```http
GET /api/v1/owner/reports/ratings?order=asc&page=1&pageSize=10
Authorization: Bearer <TOKEN_OWNER>
```

### Respuesta de éxito (200):

```json
{
  "data": [
    {
      "propertyId": "a2222222-2222-2222-2222-222222222222",
      "title": "Camara Sony Alpha A7 III con lente 24-70mm",
      "status": "AVAILABLE",
      "averageRating": 5,
      "reviewCount": 1
    },
    {
      "propertyId": "3c000001-0000-0000-0000-000000000001",
      "title": "Apartamento de Lujo Torre Futura",
      "status": "AVAILABLE",
      "averageRating": null,
      "reviewCount": 0
    }
  ],
  "total": 23,
  "page": 1
}
```

- **Restricción de parámetros:** El DTO de entrada valida estrictamente mediante `forbidNonWhitelisted: true`, por lo que únicamente admite `order` (`asc` o `desc`), `page` (entero >= 1) y `pageSize` (entero entre 1 y 100).
- **Control de acceso:** Requiere token Bearer con rol `OWNER`. Usuarios con rol `TENANT` o tokens expirados/inválidos reciben `403 Forbidden` o `401 Unauthorized`.

---

## 2. Ajustes en el frontend

1. **Route Handler en Next.js (`app/api/v1/owner/reports/ratings/route.ts` y alias en `app/api/owner/reports/ratings/route.ts`):**
   - Habilita la invocación directa vía cliente HTTP / curl hacia `http://localhost:3000/api/v1/owner/reports/ratings`.
   - Soporta reenvío del Bearer token recibido en el header `Authorization` hacia el backend cuando no existe cookie de sesión de navegador.
   - Retorna la respuesta unificada con cálculo de paginación (`totalPages`, `pageSize`).

2. **Repositorio HTTP (`lib/repositories/http/report-repository.http.ts`):**
   - Actualiza la ruta de consulta hacia `owner/reports/ratings?${query}` (resolviendo a `/api/v1/owner/reports/ratings`).
   - Envía únicamente los parámetros permitidos por el backend (`order`, `page`, `pageSize`) para evitar errores de validación 400.
   - Mapea de forma resiliente el enum de estado (`AVAILABLE` -> `DISPONIBLE`, `PAUSED` -> `PAUSADO`, `DELETED` -> `ELIMINADO`).
   - Calcula dinámicamente `totalPages` a partir de `total` y `pageSize`.

3. **Compatibilidad de Rutas y Componentes UI:**
   - La vista soporta tanto `/owner/reports/ratings` como `/lessor/reports/ratings` (según `AGENTS.md`).
   - `PropertyRatingsTable` renderiza badges con soporte para estados en español e inglés, mostrando calificación redondeada a un decimal (ej. `5.0 (1 reseña)`) o "Sin calificaciones".
   - `RatingsPageBody` conserva la ruta actual al sincronizar parámetros de orden o paginación.
