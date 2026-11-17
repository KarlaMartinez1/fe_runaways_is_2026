# Documentación de Cambios: Integración Frontend-Backend (Historia H25)

**Fecha:** 16 de noviembre de 2026  
**Historia de Usuario:** H25 - Reporte de Ingresos por Bien (`GET /api/v1/income/reports/by-property`)  
**Rama:** `feature/h25-income-by-property-with-backend`  

---

## 1. Resumen de la Integración

El objetivo de esta intervención fue conectar la consulta y visualización de ingresos agrupados por bien (`/owner/reports` o `/lessor/reports`) con el endpoint oficial implementado en el backend NestJS (`be_runaways_is_2026`), garantizando:
- Integración completa con el endpoint `GET /api/v1/income/reports/by-property`.
- Soporte para parámetros de consulta: `from` (ISO YYYY-MM-DD), `to` (ISO YYYY-MM-DD), `order` (`asc` | `desc`), `page` (número >= 1) y `pageSize` (número >= 1).
- Manejo exacto del contrato de respuesta del backend:
  ```json
  {
    "from": "2026-11-01",
    "to": "2026-11-30",
    "data": [
      {
        "propertyId": "3c000001-0000-0000-0000-000000000001",
        "title": "Apartamento de Lujo Torre Futura",
        "category": "PROPERTY",
        "rentalIncome": "450.00",
        "retainedDepositIncome": "50.00",
        "totalIncome": "500.00"
      },
      {
        "propertyId": "3c000002-0000-0000-0000-000000000002",
        "title": "Set Profesional de Iluminación y Estudio",
        "category": "EQUIPMENT",
        "rentalIncome": "80.00",
        "retainedDepositIncome": "0.00",
        "totalIncome": "80.00"
      }
    ],
    "rentalIncome": "530.00",
    "retainedDepositIncome": "50.00",
    "totalIncome": "580.00",
    "total": 2,
    "page": 1,
    "pageSize": 10
  }
  ```
- Cálculo seguro de `totalPages` en la capa de repositorio HTTP cuando el backend no lo incluye en el JSON.
- Adaptación visual en `PropertyIncomeTable` para renderizar guión (`—`) limpio cuando `status` no viene en la respuesta del backend (evitando badges vacíos).
- Creación de Route Handlers en Next.js bajo `app/api/v1/income/reports/by-property/route.ts` y re-export en `app/income/reports/by-property/route.ts` para compatibilidad dual.

---

## 2. Detalle de Archivos Modificados y Justificaciones

### 2.1. `lib/repositories/report-repository.ts`
- Se actualizaron las interfaces de dominio:
  - `PropertyIncomeItem`: campos `status` y `lastIncomeDate` ahora son opcionales (`status?: PropertyStatus`, `lastIncomeDate?: string | null`), y se agregó `category?: string`.
  - `PropertyIncomeListResult`: se agregaron `from?: string | null`, `to?: string | null`, `rentalIncome?: string` y `retainedDepositIncome?: string`, reflejando la estructura completa del backend.

### 2.2. `lib/repositories/http/report-repository.http.ts`
- `getIncomeByProperty`:
  - Consume `income/reports/by-property?${query}` (resuelto por `buildApiUrl` como `/api/v1/income/reports/by-property`).
  - Calcula `totalPages: Math.max(1, Math.ceil(total / pageSize))` dinámicamente si el backend no lo proporciona.
  - Asegura que los totales (`totalIncome`, `rentalIncome`, `retainedDepositIncome`) y datos paginados se preserven consistentemente.

### 2.3. `lib/repositories/mock/report-repository.mock.ts` y fixtures
- Se actualizó el mock para retornar la estructura idéntica a la respuesta HTTP real (`from`, `to`, `rentalIncome`, `retainedDepositIncome`, etc.).
- Se añadieron registros de prueba en `propertyIncomeItemsFixture` con los IDs de las propiedades del escenario real.

### 2.4. `app/api/v1/income/reports/by-property/route.ts`
- Expone el endpoint Next.js `/api/v1/income/reports/by-property`.
- Soporta tanto peticiones con cookie de sesión desde el cliente web como peticiones con encabezado `Authorization: Bearer <token>` para consumo directo vía API.
- `app/income/reports/by-property/route.ts` reexporta el manejador para mantener compatibilidad con cualquier llamada interna previa.

### 2.5. `components/reports/property-income-table.tsx`
- Se condicionó el renderizado del badge de estado: si `item.status` no está presente, en escritorio se muestra un guión `—` estilizado en `text-zinc-400` y en móvil se omite el badge vacío.
- Se asegura que `totalPages` muestre un valor numérico válido en el paginador.
