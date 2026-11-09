# Arquitectura del frontend (Runaways)
v1
## 1. Estructura de carpetas

| Carpeta | Qué va ahí | Ejemplo |
|---|---|---|
| `app/` | Rutas (una carpeta por pantalla). Solo composición: arma la página con componentes. | `app/login/page.tsx` |
| `app/<modulo>/` | Componentes de una pantalla que nadie más usa. | `app/register/register-form.tsx` |
| `components/` | Piezas reutilizables entre pantallas, sin lógica de negocio. | `components/auth/auth-card.tsx` |
| `app/actions/` | Acciones del servidor (formularios que llaman al backend). | `app/actions/auth.ts` |
| `lib/` | Código de apoyo: sesión, cliente del API, utilidades. | `lib/session.ts` |
| `lib/messages/` | Textos de la interfaz, copiados del documento de historias. | (pendiente) |
| `public/` | Archivos estáticos: logo e íconos. | `public/logo-runaways.svg` |

Regla: si una pieza se usa en una sola pantalla, va junto a esa pantalla. Si se usa en dos o más, pasa a `components/`.

## 2. Cómo se llama al backend

- Formularios de login y registro: server actions en `app/actions/`.
- Las pantallas no llaman a `fetch` directamente. El acceso al API va por `lib/`.
- Decisión pendiente: el `AGENTS.md` propone rutas `app/api/...` para autenticación. Hay que escoger una de las dos formas y aplicarla en todo el proyecto.

## 3. Sesión y rol

- La sesión vive en una cookie `httpOnly` (ver `lib/session.ts`). El cliente nunca lee el token.
- El rol y los datos del usuario salen de la sesión, no del formulario.
- `proxy.ts` decide qué rutas son públicas (`/login`, `/register`) y redirige a `/login` sin sesión.
- Decisión pendiente: cómo se comparte el estado de sesión y rol en la interfaz (Zustand u otra librería).

## 4. Textos y diseño

- Los textos de la interfaz se copian del documento de historias, sin reescribirlos.
- Colores, tipografía y espaciado vienen de los tokens de `app/globals.css`. No se escriben colores sueltos en los componentes.
- Cada pantalla se compara con el diseño de Figma antes de pedir revisión.

## 5. Reglas para commits y PRs

- Ramas: `feature/H##-descripcion` desde `develop`.
- Commits: `<gitmoji> <tipo>(H##): <descripción>`.
- PR a `develop`, con el ID y título de la historia, y aprobación de otro integrante.

## 6. Decisiones abiertas

| Tema | Opciones | Responsable | Estado |
|---|---|---|---|
| Forma de llamar al API | Server actions / `app/api` | <nombre> | Pendiente |
| Estado global de sesión | Zustand / Redux / Context | <nombre> | Pendiente |
| Campos del registro | Solo nombre / nombre + apellido + teléfono | <nombre> | Pendiente |

## Historial de cambios

| Fecha | Cambio | Autor |
|---|---|---|
| <fecha> | Versión inicial | <nombre> |