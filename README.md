# Runaways · Frontend

Runaways es una plataforma web que conecta a personas que quieren rentar equipo o espacios con personas que los necesitan por un periodo. Permite publicar bienes, consultar su disponibilidad real, reservarlos, pagar (de forma simulada) y coordinar la entrega, con verificación de identidad y reseñas para generar confianza entre ambas partes.

Este repositorio contiene el **frontend** (Next.js). El backend (NestJS) y la **documentación completa** del proyecto están en el repositorio del backend.

**Proyecto asignado:** Proyecto 4: Plataforma de renta/alquiler de equipo o espacios

**Curso:** Ingeniería de Software, UCA, ciclo 02/2026, Sección 01

## Ambiente desplegado

| Componente | URL |
|---|---|
| Frontend | https://fe-runaways-is-2026.vercel.app |
| Documentación de la API (Swagger) | https://runaways-api.up.railway.app/api/docs |

Los usuarios de prueba se entregan en Moodle, no en este repositorio.

## Repositorios

| Repositorio | Contenido |
|---|---|
| [fe_runaways_is_2026](https://github.com/KarlaMartinez1/fe_runaways_is_2026) | Frontend (este repositorio) |
| [be_runaways_is_2026](https://github.com/EmelyChavez/be_runaways_is_2026) | Backend y documentación completa del proyecto |

## Integrantes

| Nombre | Carnet | Usuario de GitHub | Módulos o historias principales |
|---|---|---|---|
| Violeta Lisbeth Amaya González | 00007515 | @violetalisbeth | (Frontend) H1, H2, H3, H4, H5, H6, H7, H8, H15, H16, H19, H20 y H21. |
| Emely Alexandra Chávez Mejía | 00097923 | @EmelyChavez | (Backend) H2, H3, H4, H5, H6, H19, H20, H22, H23, H24, H25, H28 y H29. |
| Kevin Fernando Díaz Nativí | 00351519 | @Ferdiaz524 | (Backend) H1, H7, H8, H9, H10, H12, H13, H14, H15, H16, H17, H18, H21, H26 y H27. |
| Karla Daniela Martínez Ferrer | 00021523 | @KarlaMartinez1 | (Frontend) H9, H10, H12, H17, H18 y H28. |
| Génesis Karina Pérez Henríquez | 00125123 | @KaarinaP17 | (Frontend) H13, H14, H23, H24, H25, H26, H27 y H29. |

## Documentación

La documentación completa está en la carpeta `docs` del repositorio del backend:

1. [Guía de uso](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/01-guia-de-uso.md)
2. [Arquitectura](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/02-arquitectura.md) (incluye el diagrama del frontend)
3. [Modelo de datos](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/03-modelo-de-datos.md)
4. [API](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/04-api.md)
5. [Instalación local](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/05-instalacion-local.md)
6. [Despliegue](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/06-despliegue.md)
7. [Forma de trabajo](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/07-forma-de-trabajo.md)
8. [Historias por módulo](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/08-historias.md)
9. [Problemas conocidos](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/09-problemas-conocidos.md)

## Stack

| Tecnología | Versión |
|---|---|
| Next.js (App Router) | 16.3.6 |
| React | 19.2.8 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| React Hook Form y Zod | Formularios y validaciones |
| Jest y React Testing Library | Pruebas de componentes |

## Inicio rápido

Requisitos: Node.js 24 y el backend corriendo en local en el puerto `3000` (ver [Instalación local](https://github.com/EmelyChavez/be_runaways_is_2026/blob/main/docs/05-instalacion-local.md)).

1. Instalar las dependencias:

   ```bash
   npm ci
   ```

2. Crear el archivo de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env.local
   ```

   En Windows (PowerShell): `copy .env.example .env.local`

3. Editar `.env.local` para conectarse al backend local:

   ```env
   API_URL=http://localhost:3000
   USE_MOCKS=false
   ```

   | Variable | Descripción |
   |---|---|
   | `API_URL` | URL base del backend. El frontend agrega el prefijo `/api/v1` automáticamente. |
   | `USE_MOCKS` | `true` usa datos simulados sin backend; `false` se conecta a la API real. |

4. Levantar el frontend en el puerto `3001` (el `3000` lo usa el backend):

   ```bash
   npm run dev -- --port 3001
   ```

5. Abrir http://localhost:3001

## Verificación y pruebas

```bash
npm run lint    # revisión de código con ESLint
npm test        # pruebas de componentes con Jest y React Testing Library
npm run build   # compilación de producción
```

Las pruebas están junto a cada componente o archivo que prueban, con la terminación `.test.ts` o `.test.tsx`.
