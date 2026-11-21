# Integración Frontend-Backend (Historia H2)

**Historia de Usuario:** H2 - Ver catálogo de bienes en renta
**Pantalla:** Catálogo, ruta `/properties` (rol `TENANT`)
**Endpoint:** `GET /api/v1/properties?page=N`

---

## 1. Contrato del backend

Respuesta de éxito (200):

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Proyector",
      "municipality": "La Libertad Sur",
      "department": "La Libertad",
      "category": "EQUIPMENT",
      "pricePerDay": "15.00",
      "images": ["/uploads/..."]
    }
  ],
  "total": 14,
  "page": 1,
  "pageSize": 12
}
```

- Solo devuelve bienes `AVAILABLE`, 12 por página, ordenados por `createdAt` descendente.
- `400 VALIDATION_ERROR` si `page` no es un entero mayor o igual a 1.
- `401` sin sesión.

## 2. Ajustes en el frontend

En `lib/repositories/http/property-repository.http.ts` (`listAvailable` y `toPropertyPage`):

- **Categoría:** el backend usa `PROPERTY` / `EQUIPMENT`; la interfaz y la URL usan `PROPIEDAD` / `EQUIPO`. Se traduce en ambos sentidos.
- **Paginación:** el backend responde `pageSize` en lugar de `totalPages`; se calcula `totalPages = ceil(total / pageSize)` (mínimo 1) para el texto "Página X de Y".
- **Estado:** el catálogo no envía `status` porque solo lista bienes disponibles; se asume `DISPONIBLE`.

En `app/properties/page.tsx`:

- `page` inválida en la URL (`?page=abc`, `?page=0`) se trata como página 1.
- Si la página pedida queda vacía (`?page=5` con 2 páginas), redirige a la primera.
- `401` redirige a `/login`. Sin bienes muestra "No hay bienes disponibles por el momento".

## 3. Pendiente

- Figma muestra la calificación en la tarjeta ("★ 4.8" / "Sin calificación"), pero `GET /api/v1/properties` no la incluye. La tarjeta ya la muestra si el backend agrega `averageRating`.

## 4. Pruebas manuales (backend local)

- Catálogo con 14 bienes: página 1 con 12 tarjetas y "Página 1 de 2"; "Siguiente" lleva a `?page=2` con 2 tarjetas.
- Al seleccionar una tarjeta se abre `/properties/:id`.
- Sin sesión, `/properties` redirige a `/login`.
- Vista móvil (390 px) sin errores en consola.
