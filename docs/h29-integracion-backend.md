# Documentación de Cambios: Integración Frontend-Backend (Historia H29)

**Fecha:** 14 de noviembre de 2026  
**Historia de Usuario:** H29 - Cambio de Rol de Usuario (`TENANT` / `OWNER`)  
**Tarjeta Trello:** https://trello.com/c/Qg30SW8I  
**Rama:** `feature/h29-user-role-change`  

---

## 1. Resumen de la Integración

El objetivo de esta intervención fue conectar el flujo de cambio de rol de la interfaz de usuario (`/profile` y `/profile/settings`) con la API del backend NestJS (`be_runaways_is_2026`), garantizando:
- Inmutabilidad estricta del backend (no se realizaron modificaciones en el repositorio del backend).
- Rotación y persistencia inmediata del nuevo JWT en la cookie de sesión (`session`).
- Manejo declarativo de bloqueos del backend (`ROLE_CHANGE_BLOCKED`, `ACCOUNT_NOT_VERIFIED`).
- Identificación y documentación explícita mediante comentarios `// TODO: falta este dato en el backend` de aquellos datos requeridos por la UI que la API aún no expone.
- Limpieza y desduplicación de tipos, corrigiendo fallos de compilación TypeScript.

---

## 2. Detalle de Archivos Modificados y Justificaciones

### 2.1. `lib/api/client.ts`
* **Cambios realizados:**
  - Se reconstruyó la función central `request<T>`, resolviendo un error de sintaxis TS2366 (`A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value`) generado por bloques de código truncados tras un merge previo.
  - Se unificó el manejo de encabezados para inyectar automáticamente `Authorization: Bearer <token>` cuando existe sesión activa.
  - Se implementó `resolveApiUrl(path)` para normalizar URLs y evitar que el prefijo `/api/v1/` se duplique independientemente de si `process.env.API_URL` lo incluye o no.
  - Se refactorizaron `apiGet`, `apiPost`, `apiPatch` y `apiDelete` para que deleguen en la misma función `request<T>`.
* **Justificación:**
  - Evitar duplicidad de implementaciones de `fetch`.
  - El backend NestJS protege casi todas las rutas de lectura con `JwtAuthGuard`; sin el token inyectado en `apiGet`, las solicitudes fallaban con `401 Unauthorized`.
  - Esta modificación **no afecta a los mocks**, ya que estos resuelven contra fixtures en memoria y nunca invocan `client.ts`.

---

### 2.2. `types/models.ts` y `lib/api/types.ts`
* **Cambios realizados:**
  - **Eliminación de `token` redundante:** En la interfaz `RoleChangeResult`, se eliminó la propiedad `token?: string` y se conservó únicamente `accessToken?: string`.
  - **Separación de capas:** Se trasladaron los tipos `BackendRoleChangeResponse` y `BackendUserResponse` de `types/models.ts` hacia `lib/api/types.ts`.
  - **Desduplicación de `AccountStatus`:** Se removió la definición duplicada de `AccountStatus` en `types/models.ts`, reexportándola desde `lib/api/types.ts`.
* **Justificación:**
  - El backend devuelve `{ accessToken, refreshToken, expiresIn, ... }`, llamándolo explícitamente `accessToken`. El campo `token` provenía únicamente del mock inicial y generaba confusión.
  - Por convención arquitectónica del proyecto (`AGENTS.md`), los DTOs de transporte HTTP pertenecen a `lib/api/types.ts`, mientras que `types/models.ts` debe contener exclusivamente los modelos de dominio y vista de React.

---

### 2.3. `lib/repositories/http/profile-repository.http.ts`
* **Cambios realizados:**
  - **Adaptación a endpoints reales:** El backend no cuenta con `GET /api/v1/profile` ni `GET /api/v1/profile/role-requirements` (ambos devolvían `404 Not Found`). Se adaptó `getUserProfile()` para consultar `GET /api/v1/auth/me`.
  - **Inclusión de comentarios `// TODO`:** Para cada dato de presentación que la API no suministra en `auth/me` (nombre completo, estado de verificación de identidad, rating promedio, conteo de reseñas y número de documento), se agregaron valores por defecto seguros acompañados del comentario obligatorio:
    `// TODO: falta este dato en el backend (...)`
  - **Validación atómica en `changeRole`:** En lugar de validar requisitos con llamadas 404 previas, se permite la invocación a `PATCH /api/v1/profile/role`. Si el backend responde `409` o `403`, se capturan los códigos `error.code` y se propagan en el resultado.
* **Justificación:**
  - Prevenir caídas y errores 404 al navegar a `/profile`.
  - Cumplir con la directriz del proyecto de señalar los vacíos de información del backend mediante comentarios de seguimiento.

---

### 2.4. `lib/repositories/mock/profile-repository.mock.ts`
* **Cambios realizados:**
  - Se actualizó el retorno de `changeRole()` para devolver `accessToken: "mock-jwt-token-after-role-change"` en lugar de `token`.
* **Justificación:**
  - Mantener paridad con la interfaz unificada `RoleChangeResult`.

---

### 2.5. `app/profile/page.tsx`
* **Cambios realizados:**
  - En la Server Action `updateRoleAction`, tras recibir un cambio de rol exitoso, se ejecuta:
    ```typescript
    if (res.accessToken) {
      await createSession(res.accessToken);
    }
    ```
  - Se propaga el código de error `code: res.code` en el payload de retorno.
* **Justificación:**
  - Regla no negociable de `AGENTS.md`: *"Tras un cambio de rol (`PATCH /api/v1/profile/role`), la respuesta trae un token nuevo. El frontend reemplaza la cookie y actualiza el estado global de inmediato."*
  - Sin esta actualización de cookie, las solicitudes posteriores continuarían enviando el JWT con el rol anterior, provocando errores `403 Forbidden` en vistas exclusivas del nuevo rol.

---

### 2.6. `components/profile/profile-page-body.tsx` y `components/profile/role-management-card.tsx`
* **Cambios realizados:**
  - Se vinculó el resultado de `onUpdateRole` para que, cuando `code === 'ACCOUNT_NOT_VERIFIED'`, se abra el modal `RoleRequirementBlockedDialog` con la opción de verificar la cuenta (`/profile/verification`).
  - Cuando `code === 'ROLE_CHANGE_BLOCKED'`, se despliega el diálogo de bloqueo informando de reservas o depósitos pendientes.
* **Justificación:**
  - Presentar feedback contextual claro y accionable al usuario en lugar de un error genérico.

---

### 2.7. `lib/messages/profile.ts`
* **Cambios realizados:**
  - Se agregó el diccionario `backendErrors` mapeando las constantes de error del backend (`ROLE_CHANGE_BLOCKED`, `ACCOUNT_NOT_VERIFIED`, `ROLE_UNCHANGED`, `FORBIDDEN`).
* **Justificación:**
  - Cumplimiento de la regla de diseño: cero cadenas de texto quemadas en JSX.

---

### 2.8. `proxy.ts` (Middleware)
* **Cambios realizados:**
  - Se eliminó `"/profile"` del listado `publicRoutes`.
  - Se resolvió el marcador de conflicto de merge en este archivo.
* **Justificación:**
  - La lógica de `proxy.ts` redirige forzosamente a `"/"` a cualquier usuario que visite una ruta presente en `publicRoutes` si ya tiene una sesión iniciada. Al retirar `"/profile"`, la ruta pasa a ser privada y protegida, exigiendo autenticación para acceder.

---

### 2.9. `app/actions/auth.ts`
* **Cambios realizados:**
  - Se implementó `buildApiUrl` para que las llamadas a `"auth/login"` y `"auth/register"` agreguen el prefijo `/api/v1/` si no está presente en la variable de entorno `API_URL`.
* **Justificación:**
  - El backend NestJS utiliza `app.setGlobalPrefix('api/v1')`. Si `API_URL` apunta a `http://localhost:8080`, las peticiones sin prefijo respondían `404 Not Found`.

---

## 3. Estado de Verificación y Compilación

Antes de dar por concluida la tarea, se ejecutaron las herramientas de análisis estático y empaquetado:

1. **`npm run lint`**:  
   - Resultado: **0 errores, 0 advertencias**.
2. **`npm run build`**:  
   - Resultado: **Compilación exitosa con Turbopack**.  
   - Verificación de tipos TypeScript: **Aprobada sin errores**.  
   - Se generaron correctamente las 16 rutas estáticas y dinámicas de la aplicación, incluyendo `/profile`, `/properties`, `/deposit`, `/bookings/mine` y `/owner/reports`.
