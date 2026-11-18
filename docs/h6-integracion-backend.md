# Integración Frontend-Backend (Historia H6)

**Historia de Usuario:** H6 - Buscar publicaciones por texto, ubicación o características
**Pantalla:** Catálogo, ruta `/properties` (rol `TENANT`)
**Endpoint:** `GET /api/v1/properties`

---

## 1. Contrato del backend

Parámetros de consulta opcionales:

| Parámetro | Tipo | Regla |
|---|---|---|
| `q` | string | 2 a 100 caracteres |
| `department` | string | |
| `municipality` | string | solo junto con `department` |
| `category` | enum | `PROPERTY` o `EQUIPMENT` |
| `noDeposit` | boolean | `true` para bienes sin depósito |
| `page` | int | mayor o igual a 1 |

Respuesta de éxito (200): `{ data, total, page, pageSize }` con bienes `AVAILABLE` que cumplen todos los criterios. Errores: `400` parámetro inválido, `401` sin sesión, `403` rol sin permiso.

## 2. Ajustes en el frontend

- **Filtros en la URL** (`lib/filters/property-filters.ts`): `parseFilters` lee `q`, `department`, `municipality`, `category` y `noDeposit` desde la URL y descarta los valores inválidos (por ejemplo `q` de menos de 2 caracteres o municipio sin departamento). `filtersToQuery` arma la misma consulta para el backend.
- **Categoría** (`lib/repositories/http/property-repository.http.ts`): la URL usa `PROPIEDAD` / `EQUIPO` y se traduce a `PROPERTY` / `EQUIPMENT` al llamar al backend.
- **Pantalla** (`app/properties/page.tsx`): al presionar "Buscar" o quitar un chip de filtro se navega con la nueva URL y se vuelve a consultar. Muestra la cantidad total ("N resultados") y, si no hay coincidencias, "No se encontraron resultados" con "Limpiar filtros".

## 3. Pruebas manuales (backend local)

- "paginación" + La Libertad + Equipo, botón "Buscar": 4 resultados.
- Texto + departamento + municipio + categoría combinados: solo bienes que cumplen todo.
- Propiedades + "Sin depósito": 6 resultados.
- Quitar el chip "Equipo": vuelve a buscar y muestra 10 resultados.
- Término sin coincidencias: "0 resultados" y "No se encontraron resultados".
- Un bien pausado y dos eliminados no aparecen en los resultados.
