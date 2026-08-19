# Curso Profesional: Desarrollo e Implementación de MacrOS PWA

## Diagnóstico del Proyecto

### 1. Resumen del Stack y Arquitectura Actual
* **Frontend Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5.
* **Diseño y Estilos:** CSS Modules con variables CSS globales (`globals.css`). Estética minimalista/brutalista.
* **Estado Global:** Zustand 5 con middleware `persist` para sincronización en `localStorage`.
* **Persistencia Local (Offline):** Dexie.js 4 (wrapper sobre IndexedDB del navegador) como espejo local de datos.
* **Capa de Servidor e Integración:** Route Handlers (`/api/*`) de Next.js actuando como API REST intermediaria.
* **Base de Datos Remota & Auth:** Supabase (PostgreSQL) accedido exclusivamente desde el servidor (`/api/*`), con Supabase Auth (Email/Password + OAuth callbacks).
* **PWA / Service Worker:** Configuración manual mediante Workbox standalone (pendiente de finalizar).

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENTE (NAVEGADOR)                           │
│  ┌───────────────────────┐  ┌────────────────┐  ┌───────────────────┐  │
│  │ Componentes React TSX │  │ Store Zustand  │  │ Dexie (IndexedDB) │  │
│  └───────────┬───────────┘  └────────────────┘  └────────┬──────────┘  │
└──────────────┼───────────────────────────────────────────┼─────────────┘
               │ fetch()                                   │ (offline sync)
               ▼                                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVIDOR (NEXT.JS 16)                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Route Handlers (/api/usuarios, /api/sesiones, /api/series, etc.) │  │
│  └───────────────────────────────┬──────────────────────────────────┘  │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ SQL / Supabase Client (@supabase/ssr)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       BASE DE DATOS REMOTA                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Supabase (PostgreSQL DB + Auth Users + RLS Policies)             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2. Estado de Flujos e Inventario de Funcionalidades

| Flujo / Pantalla | Estado Actual | Prioridad | Detalle / Carencia |
|---|---|---|---|
| Autenticación Email/Password (`/login`) | Implementado | Completado | Pantalla functional con traducciones de errores. |
| Registro de Series (`/registro`) | Implementado (Dev) | Inmediato | Hardcodeado `usuarioId = 1`. Falta integración con la sesión real. |
| Espejo Dexie.js + PR Detector | Implementado | Inmediato | Funciona en `/registro`. Requiere prueba end-to-end con datos reales. |
| Middleware de Protección | Mínimo | Semana 3 / 4 | No bloquea rutas privadas ni redirige automáticamente según sesión. |
| Pantalla de Historial (`/historial`) | Pendiente | Semana 3 | No existe. Se debe listar sesiones agrupadas por ejercicios y series. |
| Pantalla de Perfil (`/perfil`) | Pendiente | Semana 3 | No existe. Debe mostrar datos del usuario, racha actual/máxima y ajustes. |
| Pantalla Post-OAuth (`/perfil/completar`) | Pendiente | Semana 3 | Necesaria para capturar datos adicionales tras login de proveedores. |
| Rest Timer (Timer de Descanso) | Pendiente | Semana 3 | Requiere integración con Web Audio API y Vibration API para móviles. |
| Acciones Finalizar Serie / Sesión | Pendiente (UI) | Semana 3 | Endpoints `PATCH` existen en API, pero falta vincularlos en la UI. |
| PWA Service Worker + Manifest | Pendiente | Semana 4 | Falta `manifest.json` e instalación de Service Worker para iOS/Android. |
| Cola de Sync Offline | Pendiente | Semana 4 | No se encolan peticiones cuando cae la red para enviarlas al reconectar. |
| Auth OAuth + RLS Real | Pendiente | Futuro | Supabase en modo `dev_acceso_total`. Se deben aplicar políticas `auth.uid()`. |

### 3. Principales Carencias Técnicas que aborda el Curso
1. **Comprensión del Modelo Mental Frontend:** Transicionar de un modelo donde el servidor renderiza páginas HTML completas (como Django/Laravel) al paradigma reactivo de React y Server/Client Components.
2. **Tipado Estricto en Frontend:** Uso práctico de TypeScript para DTOs, props de componentes y respuestas de API.
3. **Gestión de Estado Reactivo:** Diferencia entre estado local (`useState`), global (`Zustand`) y almacenamiento persistente local (`IndexedDB`).
4. **Protección de Rutas & Seguridad:** Integración de Cookies de Sesión mediante `@supabase/ssr` en Middleware de Next.js.
5. **Estrategia PWA e Interacción con el Hardware:** Manejo de Service Workers, audio en background y APIs del navegador.

---

## Tabla de Contenidos

- [Fase 0: Fundamentos del Ecosistema y Configuración](#fase-0-fundamentos-del-ecosistema-y-configuración)
  - [Lección 0.1: Node.js, npm y la Estructura de un Proyecto Next.js](#lección-01-nodejs-npm-y-la-estructura-de-un-proyecto-nextjs)
  - [Lección 0.2: TypeScript para Desarrolladores Backend en React](#lección-02-typescript-para-desarrolladores-backend-en-react)
- [Fase 1: React y el Modelo Mental del Frontend Moderno](#fase-1-react-y-el-modelo-mental-del-frontend-moderno)
  - [Lección 1.1: JSX, Componentes y Composición](#lección-11-jsx-componentes-y-composición)
  - [Lección 1.2: Estado Local (`useState`) y Ciclo de Vida (`useEffect`)](#lección-12-estado-local-usestate-y-ciclo-de-vida-useeffect)
- [Fase 2: Next.js App Router y Arquitectura Híbrida](#fase-2-nextjs-app-router-y-arquitectura-híbrida)
  - [Lección 2.1: Enrutamiento Basado en Archivos, Layouts y Páginas](#lección-21-enrutamiento-basado-en-archivos-layouts-y-páginas)
  - [Lección 2.2: Server Components vs Client Components](#lección-22-server-components-vs-client-components)
  - [Lección 2.3: Route Handlers (`/api/*`) y Data Fetching](#lección-23-route-handlers-api-y-data-fetching)
- [Fase 3: Estilos Brutalistas con CSS Modules](#fase-3-estilos-brutalistas-con-css-modules)
  - [Lección 3.1: Scoping Local, Variables CSS y Diseño Brutalista Responsivo](#lección-31-scoping-local-variables-css-y-diseño-brutalista-responsivo)
- [Fase 4: Gestión de Estado Global con Zustand](#fase-4-gestión-de-estado-global-con-zustand)
  - [Lección 4.1: Zustand Stores, Suscripciones y Persistencia Local](#lección-41-zustand-stores-suscripciones-y-persistencia-local)
- [Fase 5: Base de Datos Local con Dexie.js (IndexedDB)](#fase-5-base-de-datos-local-con-dexiejs-indexeddb)
  - [Lección 5.1: IndexedDB, Esquemas de Dexie.js y el Espejo Local Offline](#lección-51-indexeddb-esquemas-de-dexiejs-y-el-espejo-local-offline)
- [Fase 6: Autenticación, Middleware y Seguridad en Supabase](#fase-6-autenticación-middleware-y-seguridad-en-supabase)
  - [Lección 6.1: Supabase Auth (Email/Password & OAuth Callbacks)](#lección-61-supabase-auth-emailpassword--oauth-callbacks)
  - [Lección 6.2: Protección de Rutas con Middleware y RLS en PostgreSQL](#lección-62-protección-de-rutas-con-middleware-y-rls-en-postgresql)
- [Fase 7: Construcción de Funcionalidades Pendientes del Proyecto](#fase-7-construcción-de-funcionalidades-pendientes-del-proyecto)
  - [Lección 7.1: Pantalla de Historial (`/historial`) y Agrupación de Datos](#lección-71-pantalla-de-historial-historial-y-agrupación-de-datos)
  - [Lección 7.2: Timer de Descanso con Web Audio API y Vibration API](#lección-72-timer-de-descanso-con-web-audio-api-y-vibration-api)
  - [Lección 7.3: Perfil de Usuario (`/perfil` y `/perfil/completar`), Rachas y Finalización](#lección-73-perfil-de-usuario-perfil-y-perfilcompletar-rachas-y-finalización)
- [Fase 8: Capacidades PWA e Integración Offline](#fase-8-capacidades-pwa-e-integración-offline)
  - [Lección 8.1: Web App Manifest, Workbox Service Worker y Cola de Sincronización](#lección-81-web-app-manifest-workbox-service-worker-y-cola-de-sincronización)
- [Fase 9: Optimización, Producción y Despliegue](#fase-9-optimización-producción-y-despliegue)
  - [Lección 9.1: Compilación de Producción, Auditoría PWA y Despliegue en Vercel](#lección-91-compilación-de-producción-auditoría-pwa-y-despliegue-en-vercel)

---

## Fase 0: Fundamentos del Ecosistema y Configuración

### Lección 0.1: Node.js, npm y la Estructura de un Proyecto Next.js

#### Objetivos de aprendizaje
- Comprender el rol de Node.js como runtime ejecutor de JavaScript fuera del navegador.
- Dominar el flujo de gestión de paquetes con `npm` (`package.json`, `node_modules`, scripts).
- Conocer la estructura estándar de directorios en Next.js App Router.

#### Explicación conceptual
En el backend clásico (Python, Java, Go), instalas dependencias globales o en entornos virtuales y ejecutas un servidor web estático o dinámico. En el frontend moderno, **Node.js** cumple una función dual: es el motor de compilación/empaquetado en tiempo de desarrollo (usando herramientas como Turbopack o Webpack) y, en el caso de Next.js, es también el servidor en tiempo de ejecución que procesa peticiones HTTP, ejecuta Server Components y sirve endpoints API REST.

`package.json` es el equivalente a un `requirements.txt` o `pom.xml`. Define los metadatos de la aplicación, las dependencias exactas requeridas para ejecutar (`dependencies`) y las necesarias solo para desarrollar/compilar (`devDependencies`). El directorio `node_modules` almacena físicamente el código de esas librerías.

En Next.js (versión 16+ App Router), la convención principal es la carpeta `src/app`. Cada subcarpeta dentro de `app` que contenga un archivo `page.tsx` se mapea automáticamente a una URL pública.

```
Petición Web (GET /login)
         │
         ▼
Next.js Router (Servidor Node)
         │
         ├─► Busca src/app/login/page.tsx
         ├─► Renderiza HTML / ejecuta código TypeScript
         └─► Envía respuesta HTTP al navegador
```

#### Ejemplo contextualizado
Si tuvieras que crear un proyecto Next.js desde cero para una aplicación deportiva:

```bash
# Crear aplicación Next.js no interactiva en la carpeta actual
npx -y create-next-app@latest ./ --typescript --eslint --app --src-dir --import-alias "@/*"

# Instalar dependencias adicionales del proyecto
npm install dexie zustand @supabase/supabase-js @supabase/ssr

# Iniciar servidor de desarrollo con Turbopack
npm run dev
```

#### Ejercicio práctico obligatorio
- **Tarea:** Inspeccionar el proyecto existente `MacrOS PWA`. Abrir la consola en la raíz, ejecutar el servidor de desarrollo y verificar las rutas que responden actualmente.
- **Archivos involucrados:** `package.json`, `src/app/page.tsx`, `src/app/login/page.tsx`.
- **Criterios de aceptación:**
  1. El comando `npm run dev` inicia sin errores en `http://localhost:3000`.
  2. Al navegar a `http://localhost:3000/login` en el navegador, la pantalla muestra el formulario de inicio de sesión.
  3. En `package.json`, puedes identificar las versiones instaladas de `next`, `dexie`, `zustand` y `@supabase/supabase-js`.

#### Adaptación futura
Si en el futuro se cambiara el gestor de paquetes de `npm` a `pnpm` o `bun`, los comandos cambiarían ligeramente (`pnpm dev` o `bun dev`), pero la estructura de `package.json` y la resolución de archivos en `src/app` seguirían exactamente las mismas reglas de Next.js.

---

### Lección 0.2: TypeScript para Desarrolladores Backend en React

#### Objetivos de aprendizaje
- Trasladar conceptos de tipado fuerte de SQL/backend a interfaces y tipos de TypeScript (`interface`, `type`).
- Entender el concepto de *Type Erasure* (TypeScript solo existe en tiempo de compilación).
- Modelar DTOs y respuestas de API fuertemente tipadas en la aplicación.

#### Explicación conceptual
A diferencia de lenguajes como C# o Java donde los tipos existen en runtime para reflexión o casting, TypeScript es un superset sintáctico. Durante la compilación, TypeScript valida las reglas y luego **elimina todos los tipos**, produciendo JavaScript puro.

Como desarrollador con experiencia en SQL, estás acostumbrado a que una tabla `series` tenga restricciones estrictas (e.g. `peso_kg NUMERIC NOT NULL`). En TypeScript, replicamos esta estructura mediante `interface` o `type` para asegurar que las variables en el código tengan la misma forma que los registros de la base de datos o los DTOs (Data Transfer Objects) enviados desde la API.

```
[Tabla SQL: series]  ──(Reflejo)──► [Typescript: interface Serie]
serie_id INT                       serie_id: number;
peso_kg NUMERIC                    peso_kg: number;
notas TEXT NULL                    notas: string | null;
```

#### Ejemplo contextualizado
En `src/types/index.ts` podemos definir tipos base y tipos derivados (DTOs):

```typescript
// Entidad equivalente a un registro de la tabla PostgreSQL
export interface Ejercicio {
  ejercicio_id: number;
  grupo_muscular_id: number;
  usuario_id: number | null; // null si es del catálogo base
  nombre: string;
  descripcion?: string | null;
  creado_en: string;
}

// DTO para la creación desde un formulario cliente (sin campos autogenerados por la BD)
export type CrearEjercicioDTO = Omit<Ejercicio, 'ejercicio_id' | 'creado_en'>;

// Wrapper genérico para respuestas de nuestras API Route Handlers
export interface ApiResponse<T> {
  exito: boolean;
  datos?: T;
  error?: string;
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Abrir `src/types/index.ts` y examinar la definición de la interfaz `Serie` y el DTO `CrearSerieDTO`. Agregar un nuevo campo opcional `sensacion_esfuerzo` (número del 1 al 10) a la interfaz `Serie` y al DTO `CrearSerieDTO` para permitir calificar el esfuerzo subjetivo (RPE).
- **Archivos a modificar:** [src/types/index.ts](file:///c:/Git/personal/MacrOS/src/types/index.ts)
- **Criterios de aceptación:**
  1. La interfaz `Serie` incluye `sensacion_esfuerzo?: number | null;`.
  2. `CrearSerieDTO` refleja correctamente la opcionalidad del nuevo campo sin romper las referencias existentes en las API routes.
  3. Ejecutar `npx tsc --noEmit` en la consola para confirmar que la compilación de TypeScript pasa sin errores.

#### Adaptación futura
TypeScript es totalmente independiente del framework o librería visual. Si en el futuro migras de React a Vue, Svelte o Node.js puro, la capa de tipos de tu dominio (`src/types`) se mantendrá intacta y reutilizable al 100%.

---

## Fase 1: React y el Modelo Mental del Frontend Moderno

### Lección 1.1: JSX, Componentes y Composición

#### Objetivos de aprendizaje
- Comprender JSX como una extensión sintáctica de JavaScript para describir estructuras UI.
- Pasar de renderizado de plantillas HTML desde servidor (JSP, Jinja, Blade) al modelo de árbol de componentes.
- Utilizar `props` para la comunicación unidireccional de datos entre componentes padre e hijo.

#### Explicación conceptual
En el desarrollo backend tradicional, la vista suele ser un archivo de plantilla que recibe una variable del servidor y produce un string HTML estático. En React, la UI se descompone en **Componentes**: funciones puras de JavaScript que aceptan entradas llamadas **`props`** (propiedades) y devuelven elementos de interfaz descritos con **JSX**.

JSX parece HTML, pero bajo el capó se traduce a llamadas de funciones JavaScript (`React.createElement`). Por este motivo:
1. Usamos `className` en lugar de `class` (ya que `class` es una palabra reservada de JS).
2. Todo elemento JSX debe cerrarse explícitamente (ej. `<input />`).
3. Un componente solo puede retornar un único nodo raíz (o un Fragmento `<>...</>`).

```
                ┌─────────────────────────┐
                │   Componente Padre      │
                │  (Ej: RegistroSetPage)  │
                └────────────┬────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │ props: { peso, onChange }             │ props: { duracion }
         ▼                                       ▼
┌─────────────────┐                     ┌─────────────────┐
│ Componente Hijo │                     │ Componente Hijo │
│ (SelectorPeso)  │                     │  (TimerDescanso)│
└─────────────────┘                     └─────────────────┘
```

#### Ejemplo contextualizado
Un componente reutilizable para mostrar tarjetas de series en la interfaz:

```tsx
// src/components/TarjetaSerie.tsx
import React from 'react';

interface TarjetaSerieProps {
  numeroSerie: number;
  pesoKg: number;
  repeticiones: number;
  esPr?: boolean;
  onEliminar?: () => void; // Función callback pasada como prop
}

export function TarjetaSerie({ numeroSerie, pesoKg, repeticiones, esPr, onEliminar }: TarjetaSerieProps) {
  return (
    <div className="tarjeta-serie">
      <span>Serie #{numeroSerie}</span>
      <strong>{pesoKg} kg × {repeticiones} reps</strong>
      {esPr && <span className="badge-pr">🏆 PR</span>}
      {onEliminar && (
        <button onClick={onEliminar} type="button">
          Eliminar
        </button>
      )}
    </div>
  );
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Crear un componente sencillo y declarativo llamado `BadgeGrupoMuscular` dentro de la carpeta `src/components/BadgeGrupoMuscular/index.tsx` que reciba como prop el nombre del grupo muscular (ej. "Pecho", "Espalda") y dibuje una etiqueta con estilo personalizado.
- **Archivos a crear:** `src/components/BadgeGrupoMuscular/index.tsx`
- **Criterios de aceptación:**
  1. El componente acepta una prop `nombre: string`.
  2. Retorna un elemento `<span>` estilizado con el nombre en mayúsculas.
  3. Está correctamente exportado e incluye tipos TypeScript estrictos para sus props.

#### Adaptación futura
El concepto de componentes con flujo de datos unidireccional mediante props es universal en el desarrollo frontend moderno. Si el proyecto cambiara de React a Web Components nativos o Lit, la estructura mental de desacoplar la interfaz en bloques reutilizables seguiría siendo idéntica.

---

### Lección 1.2: Estado Local (`useState`) y Ciclo de Vida (`useEffect`)

#### Objetivos de aprendizaje
- Entender la reactividad en React: por qué mutar variables normales no actualiza la pantalla.
- Dominar la declaración y actualización del estado local con el Hook `useState`.
- Controlar efectos secundarios (peticiones HTTP, timers, suscripciones) con `useEffect` y sus vectores de dependencias.

#### Explicación conceptual
En backend, una variable existe durante el tiempo de ejecución de la petición HTTP y luego se destruye. En el navegador, una interfaz React permanece viva. Si cambias el valor de una variable normal (ej. `let contador = 0; contador++;`), React **no se entera** de que la pantalla debe actualizarse.

Para re-renderizar un componente ante un cambio de datos, usamos **Hooks**:
1. **`useState`**: Registra una variable de estado observada por React. Al invocar su función actualizadora, React calcula las diferencias y re-renderiza el componente.
2. **`useEffect`**: Ejecuta código con efectos secundarios *después* de que React actualiza el DOM. Su comportamiento depende del arreglo de dependencias:
   - `useEffect(() => {}, [])`: Se ejecuta solo **una vez** al montar el componente (ideal para cargas iniciales).
   - `useEffect(() => {}, [variable])`: Se ejecuta cada vez que `variable` cambia su valor.
   - Si la función retorna otra función, esta actúa como función de limpieza (*cleanup*).

```
   Render inicial
         │
         ▼
  useState(valorInicial) ──► Retorna [estado, setEstado]
         │
         ▼
  ¿setEstado(nuevoValor) invocado?
    ├── NO  ──► Permanece en espera
    └── SÍ  ──► React vuelve a ejecutar la función del Componente (Re-render)
                     │
                     ▼
             useEffect([dependencias]) re-evalúa si ejecuta el efecto
```

#### Ejemplo contextualizado
Un contador interactivo de repeticiones con persistencia en borrador:

```tsx
'use client';
import { useState, useEffect } from 'react';

export function ContadorReps() {
  const [reps, setReps] = useState<number>(10);

  // Efecto que se ejecuta al montar para recuperar último borrador
  useEffect(() => {
    const borradorGuardado = localStorage.getItem('borrador_reps');
    if (borradorGuardado) {
      setReps(Number(borradorGuardado));
    }
  }, []); // [] = Solo al cargar la pantalla

  const incrementar = () => {
    const nuevoValor = reps + 1;
    setReps(nuevoValor);
    localStorage.setItem('borrador_reps', String(nuevoValor));
  };

  return (
    <div>
      <p>Repeticiones: {reps}</p>
      <button onClick={incrementar}>+1 Repetición</button>
    </div>
  );
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Inspeccionar la pantalla `src/app/registro/page.tsx` y analizar cómo utiliza `useState` para controlar la búsqueda de ejercicios y los valores de peso/repeticiones. Identificar la variable de estado donde se guardan los resultados filtrados de ejercicios.
- **Archivos a revisar:** [src/app/registro/page.tsx](file:///c:/Git/personal/MacrOS/src/app/registro/page.tsx)
- **Criterios de aceptación:**
  1. Documentar mediante comentarios en el archivo o notas breves la función de cada `useState` presente en `/registro`.
  2. Verificar en el navegador cómo al escribir en el campo de búsqueda se dispara el filtrado dinámico del estado local.

#### Adaptación futura
Aunque los nombres `useState` y `useEffect` son específicos de React, el concepto de "Estado Reaccionario" y "Efectos Secundarios" es idéntico a las `signals` de SolidJS/Angular o los `refs` de Vue 3. Entender la reactividad es el núcleo del desarrollo cliente.

---

## Fase 2: Next.js App Router y Arquitectura Híbrida

### Lección 2.1: Enrutamiento Basado en Archivos, Layouts y Páginas

#### Objetivos de aprendizaje
- Entender el sistema de rutas dinámicas y anidadas del App Router de Next.js.
- Distinguir los archivos reservados: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`.
- Implementar maquetados compartidos mediante Layouts sin re-renderizar encabezados/navegación.

#### Explicación conceptual
A diferencia de frameworks tradicionales donde configuras un archivo de rutas explícito (ej. `routes/web.php` o `urls.py`), Next.js utiliza **Enrutamiento por Sistema de Archivos** (File-system Routing).

- Cada directorio dentro de `src/app/` define un segmento de URL.
- **`page.tsx`**: Define la interfaz única y accesible públicamente de esa ruta.
- **`layout.tsx`**: UI compartida que envuelve a las páginas hijas. Mantiene su estado y no se vuelve a renderizar cuando el usuario navega entre rutas hermanas.

```
src/app/
├── layout.tsx              --> Estructura global HTML (<body> + Navbar)
├── page.tsx                --> Ruta: / (Home)
├── login/
│   └── page.tsx            --> Ruta: /login
└── perfil/
    ├── layout.tsx          --> layout específico para el perfil
    ├── page.tsx            --> Ruta: /perfil
    └── completar/
        └── page.tsx        --> Ruta: /perfil/completar
```

#### Ejemplo contextualizado
Estructura de un `layout.tsx` raíz que proporciona la barra de navegación persistente:

```tsx
// src/app/layout.tsx
import './globals.css';
import React from 'react';

export const metadata = {
  title: 'MacrOS PWA',
  description: 'Registro de entrenamiento offline-first',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="header-app">
          <h1>MacrOS</h1>
        </header>
        <main className="contenedor-principal">
          {children} {/* Aquí se inyecta la página activa (page.tsx) */}
        </main>
      </body>
    </html>
  );
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Crear la ruta y la estructura inicial para la pantalla de historial de entrenamientos.
- **Archivos a crear:** `src/app/historial/page.tsx`
- **Criterios de aceptación:**
  1. Crear la carpeta `src/app/historial/`.
  2. Crear un archivo `page.tsx` dentro de ella que exporte un componente por defecto mostrando un título `<h2>Historial de Sesiones</h2>` y un texto provisional.
  3. Abrir `http://localhost:3000/historial` en el navegador y verificar que carga dentro del `RootLayout` global.

#### Adaptación futura
El enrutamiento por archivos se ha convertido en el estándar de la industria (disponible también en Remix, Nuxt, SvelteKit y Expo Router). Dominar las convenciones de archivos reservados facilita la transición entre cualquier framework moderno de Fullstack.

---

### Lección 2.2: Server Components vs Client Components

#### Objetivos de aprendizaje
- Entender la frontera entre el servidor y el cliente en Next.js (React Server Components - RSC).
- Identificar cuándo usar un Server Component (acceso directo a DB, menor JS en cliente) y cuándo un Client Component (`'use client'`, interactividad, hooks).
- Evitar errores comunes de importación entre ambos entornos.

#### Explicación conceptual
Next.js 16 por defecto trata a **todos los componentes dentro de `src/app` como Server Components (RSC)**.

- **Server Components (Servidor):** Se ejecutan **únicamente en el servidor**. Pueden hacer peticiones asíncronas directas a bases de datos o APIs sin exponer claves secretas. No envían código JavaScript al navegador, lo que reduce drásticamente el peso del bundle. **No pueden usar hooks como `useState` ni eventos como `onClick`**.
- **Client Components (Cliente):** Se marcan explícitamente con la directiva `'use client'` al inicio del archivo. Se renderizan previamente en el servidor y cobran vida en el navegador (proceso conocido como *Hydration*). Tienen acceso a apis del navegador, `useState`, `useEffect`, y librerías cliente como Dexie.js.

```
                                  PETICIÓN HTTP
                                        │
                                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ SERVIDOR (Server Components)                                                  │
│  - Carga datos de PostgreSQL                                                  │
│  - Renderiza HTML estático inicial                                            │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │ CLIENTE ('use client' - Client Components)                            │   │
│   │  - Se hidrata en el navegador                                         │   │
│   │  - Maneja clics, timers, formularios, Dexie.js                        │   │
│   └───────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────────┘
```

#### Ejemplo contextualizado

```tsx
// SERVER COMPONENT (por defecto, sin 'use client')
// src/app/ejercicios-catalogo/page.tsx
import { supabaseServidor } from '@/lib/supabase/client';

export default async function PaginaEjercicios() {
  // Consulta directa en servidor sin exponer tokens ni pasar por fetch client
  const { data: ejercicios } = await supabaseServidor.from('ejercicios').select('*');

  return (
    <div>
      <h2>Catálogo Global</h2>
      <ul>
        {ejercicios?.map(ej => (
          <li key={ej.ejercicio_id}>{ej.nombre}</li>
        ))}
      </ul>
    </div>
  );
}
```

```tsx
// CLIENT COMPONENT (requiere interacción y estado local)
// src/components/BotonTimer.tsx
'use client';

import { useState } from 'react';

export function BotonTimer() {
  const [activo, setActivo] = useState(false);
  return (
    <button onClick={() => setActivo(!activo)}>
      {activo ? 'Detener Timer' : 'Iniciar Descanso'}
    </button>
  );
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Revisar la página `src/app/registro/page.tsx`. Explicar por qué es obligatorio que contenga la directiva `'use client'` en la línea 1.
- **Archivos a inspeccionar:** [src/app/registro/page.tsx](file:///c:/Git/personal/MacrOS/src/app/registro/page.tsx)
- **Criterios de aceptación:**
  1. Identificar al menos 3 motivos por los que esta pantalla requiere `'use client'` (uso de `useState`, eventos `onChange`/`onClick`, interacción con `Dexie.js`/`localStorage`).
  2. Verificar qué ocurre si se remueve temporalmente la directiva `'use client'` y anotar el error mostrado por Turbopack/Next.js en la consola.

#### Adaptación futura
El paradigma de separación servidor/cliente (RSC) se está adoptando en todo el ecosistema React. Conocer la regla mental *"Servidor para carga de datos y seguridad, Cliente para interactividad y APIS del navegador"* aplica sin importar la versión o librería.

---

### Lección 2.3: Route Handlers (`/api/*`) y Data Fetching

#### Objetivos de aprendizaje
- Construir endpoints de API REST dentro de Next.js utilizando Route Handlers (`route.ts`).
- Manejar métodos HTTP (`GET`, `POST`, `PATCH`, `DELETE`) y parsear parámetros o Request Body.
- Retornar respuestas estructuradas con `NextResponse.json()` y códigos de estado HTTP apropiados.

#### Explicación conceptual
Como desarrollador backend, estás acostumbrado a controladores que reciben una petición `Request` y devuelven una respuesta `Response`. Los **Route Handlers** son el equivalente exacto en Next.js.

Se definen dentro de carpetas bajo `src/app/api/` en archivos nombrados estrictamente **`route.ts`**. Exportan funciones asíncronas con el nombre del método HTTP en mayúsculas (`GET`, `POST`, etc.).

En nuestro proyecto, la arquitectura estipula que el navegador **nunca llama a Supabase directamente**. En su lugar, el cliente React hace `fetch('/api/series')`, el Route Handler en el servidor valida la petición, consulta Supabase con credenciales seguras de servidor y retorna la respuesta procesada.

```
Cliente React (Navegador)
       │
       │ fetch('/api/series', { method: 'POST', body: JSON })
       ▼
Next.js Route Handler (src/app/api/series/route.ts)
       │
       │ Validar DTO -> Llamar Supabase Postgres Client
       ▼
Base de Datos Supabase (PostgreSQL)
```

#### Ejemplo contextualizado
Ejemplo didáctico de un Route Handler `POST /api/ejercicios`:

```typescript
// src/app/api/ejercicios/ejemplo-route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServidor } from '@/lib/supabase/client';
import { CrearEjercicioDTO } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: CrearEjercicioDTO = await request.json();

    if (!body.nombre || !body.grupo_muscular_id) {
      return NextResponse.json(
        { exito: false, error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServidor
      .from('ejercicios')
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ exito: true, datos: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { exito: false, error: err.message || 'Error interno' },
      { status: 500 }
    );
  }
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Inspeccionar los Route Handlers implementados en `src/app/api/series/route.ts` y `src/app/api/sesiones/route.ts`. Analizar cómo `POST /api/series` verifica si la serie ingresada es un Record Personal (PR) antes de responder.
- **Archivos a inspeccionar:** [src/app/api/series/route.ts](file:///c:/Git/personal/MacrOS/src/app/api/series/route.ts)
- **Criterios de aceptación:**
  1. Identificar en `route.ts` la consulta que compara el `peso_kg` entrante contra la tabla `prs`.
  2. Comprender cómo se retorna el campo virtual `es_pr: boolean` en la respuesta JSON al cliente.

#### Adaptación futura
Si en el futuro la API se migrara a un servidor independiente en Node.js (Express/Fastify), Python (FastAPI) o Go, la lógica de los Route Handlers se trasladaría casi 1:1, pues ambos respetan los estándares Web API (`Request` y `Response` nativos).

---

## Fase 3: Estilos Brutalistas con CSS Modules

### Lección 3.1: Scoping Local, Variables CSS y Diseño Brutalista Responsivo

#### Objetivos de aprendizaje
- Entender el aislamiento de estilos mediante CSS Modules (`*.module.css`).
- Aplicar tokens de diseño globales mediante Variables CSS (`var(--...)`).
- Crear interfaces bajo la estética **Brutalista/Minimalista** (bordes gruesos, contrastes altos, tipografía utilitaria).

#### Explicación conceptual
En el desarrollo CSS tradicional, todas las reglas son globales. Si defines `.boton { color: red; }`, afectará a todos los botones del sistema, provocando colisiones difíciles de depurar.

**CSS Modules** resuelve esto aislando automáticamente las clases. Creas un archivo `page.module.css`, e importas las clases como un objeto JavaScript en tu TSX: `import styles from './page.module.css';`. Next.js renombra la clase en compilación a un hash único (ej. `page_boton__x8k19`).

El proyecto utiliza una estética **Brutalista**, caracterizada por:
- Paleta de alto contraste (negros puros `#000`, blancos, acentos neón o primarios).
- Bordes marcados (2px-3px solidos).
- Sin sombras suaves o bordes redondeados excesivos.
- Jerarquía tipográfica fuerte y optimizada para uso rápido en el gimnasio.

```
CSS Module File (page.module.css)           Compilado a HTML/DOM final
.tarjeta { border: 2px solid #000; }  ──►   <div class="page_tarjeta__a7f3x">
```

#### Ejemplo contextualizado

```css
/* src/app/historial/historial.module.css */
.contenedor {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.tarjetaSesion {
  border: 3px solid var(--color-borde, #000);
  background-color: var(--color-fondo-tarjeta, #fff);
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 4px 4px 0px #000; /* Estilo brutalista: sombra sólida sin desenfoque */
}

.tituloFecha {
  font-size: 1.2rem;
  font-weight: 900;
  text-transform: uppercase;
  border-bottom: 2px solid #000;
  padding-bottom: 0.5rem;
}
```

```tsx
// src/app/historial/page.tsx
import styles from './historial.module.css';

export default function HistorialPage() {
  return (
    <div className={styles.contenedor}>
      <div className={styles.tarjetaSesion}>
        <h3 className={styles.tituloFecha}>Sesión - 30 Julio 2026</h3>
        <p>4 Ejercicios completados</p>
      </div>
    </div>
  );
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Crear el archivo de estilos `src/app/historial/historial.module.css` e integrarlo en la pantalla `/historial` creada previamente.
- **Archivos a crear/modificar:** `src/app/historial/historial.module.css`, `src/app/historial/page.tsx`
- **Criterios de aceptación:**
  1. Definir al menos 3 clases CSS con la estética brutalista del proyecto (bordes negros marcados, sombras sólidas sin desenfoque `box-shadow: 4px 4px 0px #000`).
  2. Importar el módulo CSS en `page.tsx` y aplicarlo a los elementos mediante `styles.nombreClase`.
  3. Verificar en el navegador que los estilos se aplican correctamente sin afectar a otras pantallas.

#### Adaptación futura
Si en el futuro el proyecto decide migrar a **Tailwind CSS**, los conceptos de diseño (tokens de color, espaciados y estética brutalista) seguirán siendo los mismos; únicamente cambiará la sintaxis de escritura (pasando de clases importadas en archivos `.module.css` a clases de utilidad como `border-2 border-black shadow-[4px_4px_0px_#000]`).

---

## Fase 4: Gestión de Estado Global con Zustand

### Lección 4.1: Zustand Stores, Suscripciones y Persistencia Local

#### Objetivos de aprendizaje
- Comprender la necesidad de estado global para datos compartidos entre pantallas no emparentadas.
- Crear y consumir stores con **Zustand 5** utilizando selectores de estado.
- Configurar la persistencia automática en `localStorage` con el middleware `persist`.

#### Explicación conceptual
El estado local (`useState`) vive y muere dentro de su componente. Si dos pantallas distantes (como la pantalla de registro de series y la pantalla de perfil) necesitan conocer la unidad de peso preferida del usuario (`kg` o `lbs`), pasar la propiedad a través de decenas de componentes intermediarios (*prop drilling*) se vuelve inmanejable.

**Zustand** ofrece una alternativa ligera, limpia y fuera del árbol de React para administrar el estado global. A diferencia de Redux, no requiere envolver la aplicación en proveedores (*Providers*) ni escribir boilerplate complejo.

Funciona mediante un patrón de **Store Centralizado**:
1. Creas el store definiendo el estado y las funciones para modificarlo.
2. Cualquier componente cliente se suscribe a partes específicas del store.
3. El middleware `persist` intercepta las actualizaciones del store y las guarda de manera transparente en `localStorage`.

```
┌────────────────────────────────────────────────────────┐
│               ZUSTAND STORE CENTRALIZADO               │
│  Estado: { unidad: 'kg' }                              │
│  Acciones: { toggleUnidad(), convertPeso() }           │
└───────────────┬────────────────────────┬───────────────┘
                │ Suscripción            │ Suscripción
                ▼                        ▼
┌───────────────────────────┐┌───────────────────────────┐
│ Componente: RegistroSet   ││ Componente: Perfil        │
│ Muestra: "80 kg"          ││ Muestra selector: [KG|LBS]│
└───────────────────────────┘└───────────────────────────┘
```

#### Ejemplo contextualizado
Inspección del store de preferencias del proyecto:

```typescript
// src/store/usePreferenciasStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferenciasState {
  unidad: 'kg' | 'lbs';
  toggleUnidad: () => void;
  setUnidad: (unidad: 'kg' | 'lbs') => void;
  formatPeso: (pesoKg: number) => string;
}

export const usePreferenciasStore = create<PreferenciasState>()(
  persist(
    (set, get) => ({
      unidad: 'kg',
      toggleUnidad: () => set((state) => ({ unidad: state.unidad === 'kg' ? 'lbs' : 'kg' })),
      setUnidad: (unidad) => set({ unidad }),
      formatPeso: (pesoKg: number) => {
        const { unidad } = get();
        if (unidad === 'lbs') {
          return `${(pesoKg * 2.20462).toFixed(1)} lbs`;
        }
        return `${pesoKg} kg`;
      },
    }),
    {
      name: 'gym-preferencias', // Llave en localStorage
    }
  )
);
```

#### Ejercicio práctico obligatorio
- **Tarea:** En la pantalla `/historial` recién creada, importar `usePreferenciasStore` y mostrar un elemento selector interactivo que permita al usuario alternar entre `kg` y `lbs`.
- **Archivos a modificar:** `src/app/historial/page.tsx`
- **Criterios de aceptación:**
  1. Al presionar el botón de alternar en `/historial`, la unidad global cambia.
  2. Si el usuario recarga la página en el navegador, la unidad elegida persiste gracias a `localStorage`.
  3. Comprobar que en `/registro` la unidad también se actualiza en tiempo real al cambiarla desde `/historial`.

#### Adaptación futura
Zustand se basa en funciones puras y el patrón Pub/Sub. Si en el futuro el proyecto requiere migrar a Redux Toolkit, Jotai o React Context, el diseño del contrato de datos de las preferencias permanecerá conceptualmente idéntico.

---

## Fase 5: Base de Datos Local con Dexie.js (IndexedDB)

### Lección 5.1: IndexedDB, Esquemas de Dexie.js y el Espejo Local Offline

#### Objetivos de aprendizaje
- Entender el rol de **IndexedDB** como base de datos NoSQL transaccional del navegador.
- Utilizar **Dexie.js** como capa de abstracción fluida tipada.
- Implementar la estrategia *Offline-First* guardando datos localmente antes/al mismo tiempo que en la red.

#### Explicación conceptual
`localStorage` es síncrono, limitado en espacio (~5MB) y solo almacena strings. Para aplicaciones PWA de alto rendimiento que deben funcionar en el gimnasio sin conexión a internet, necesitamos una verdadera base de datos en el cliente: **IndexedDB**.

IndexedDB es asíncrona, soporta índices, transacciones y almacena gigabytes de datos en formato JSON. Sin embargo, su API nativa basada en eventos es compleja. **Dexie.js** provee una interfaz basada en Promesas similar a un ORM/Query Builder.

En nuestro proyecto, Dexie actúa como un **Espejo Local** de las tablas de Supabase:
- Cuando el usuario guarda una serie, el frontend la inserta inmediatamente en Dexie.js (garantizando fluidez instantánea en la UI).
- En segundo plano o mediante Route Handlers, se efectúa la petición a Supabase.
- Para evitar errores en la compilación en servidor de Next.js (SSR), debemos proteger las llamadas a Dexie verificando `typeof window !== 'undefined'`.

```
                              Guardar Serie (UI)
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
      Inserta en Dexie (IndexedDB)              Petición fetch() a /api/series
      [Acceso Instantáneo Offline]              [Sincronización remota Supabase]
```

#### Ejemplo contextualizado
Esquema de la base de datos Dexie del proyecto (`src/lib/bd/schema.ts`):

```typescript
import Dexie, { Table } from 'dexie';
import { Ejercicio, Sesion, Serie } from '@/types';

export class GymDatabase extends Dexie {
  ejercicios!: Table<Ejercicio>;
  sesiones!: Table<Sesion>;
  series!: Table<Serie>;

  constructor() {
    super('GymTrackerDB');
    // Se definen solo las llaves primarias e índices buscables
    this.version(1).stores({
      ejercicios: '&ejercicio_id, grupo_muscular_id, usuario_id, nombre',
      sesiones: '&sesion_id, usuario_id, iniciado_en',
      series: '&serie_id, sesion_id, ejercicio_id',
    });
  }
}

// Guard imprescindible para evitar errores en Server-Side Rendering (SSR)
export const db = typeof window !== 'undefined' ? new GymDatabase() : ({} as GymDatabase);
```

#### Ejercicio práctico obligatorio
- **Tarea:** Crear una función helper en `src/lib/bd/operaciones.ts` llamada `obtenerSeriesLocales(sesionId: number)` que use Dexie.js para leer todas las series correspondientes a una sesión guardadas en el navegador.
- **Archivos a crear:** `src/lib/bd/operaciones.ts`
- **Criterios de aceptación:**
  1. La función utiliza `db.series.where('sesion_id').equals(sesionId).toArray()`.
  2. Exporta tipos TypeScript estrictos.
  3. Contiene la verificación `typeof window !== 'undefined'` para garantizar seguridad en SSR.

#### Adaptación futura
Dexie.js es un wrapper ligero de IndexedDB. Si a futuro decides usar WatermelonDB, RxDB o SQLite (via WASM en PWA), el concepto de mantener un espejo local para capacidad offline se mantendrá inalterado.

---

## Fase 6: Autenticación, Middleware y Seguridad en Supabase

### Lección 6.1: Supabase Auth (Email/Password & OAuth Callbacks)

#### Objetivos de aprendizaje
- Entender el flujo de autenticación mediante Tokens JWT y Cookies de sesión.
- Comprender la diferencia entre el cliente de Supabase para navegador (`@supabase/ssr`) y el cliente para servidor.
- Manejar el flujo de redirección OAuth y sincronización de perfiles de usuario.

#### Explicación conceptual
Supabase Auth gestiona la identidad del usuario en una tabla privada e independiente llamada `auth.users`.

Cuando el usuario inicia sesión con correo/contraseña o proveedor externo (Google/Apple), Supabase genera un par de tokens JWT (Access Token y Refresh Token). Para que tanto el servidor de Next.js (Route Handlers / Server Components) como el navegador tengan acceso a esta sesión de forma segura, la librería `@supabase/ssr` almacena estos tokens en **Cookies HTTP-Only**.

El flujo OAuth funciona de la siguiente manera:
1. El cliente solicita iniciar sesión con Google.
2. Es redirigido al proveedor y otorga permisos.
3. El proveedor redirige de vuelta a nuestro Route Handler `GET /auth/callback?code=xxxx`.
4. El servidor intercambia el `code` por una sesión válida y sincroniza los datos del usuario en la tabla pública `usuarios`.

```
Usuario ──► Iniciar con Google ──► Google Auth
                                      │ (Redirección con código)
                                      ▼
Navegador ◄── Set-Cookie JWT ◄── GET /auth/callback (Next.js Servidor)
                                      │
                                      ▼ (Sincroniza perfil)
                              Tabla Postgres `usuarios`
```

#### Ejemplo contextualizado
Cliente de Supabase para navegador (`src/lib/supabase/browser.ts`):

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function crearClienteBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Inspeccionar el archivo `src/app/auth/callback/route.ts` y entender cómo procesa el parámetro `code` devuelto por el proveedor OAuth y cómo redirige al usuario a `/perfil/completar` si es su primera vez o a `/` si ya existe.
- **Archivos a inspeccionar:** [src/app/auth/callback/route.ts](file:///c:/Git/personal/MacrOS/src/app/auth/callback/route.ts)
- **Criterios de aceptación:**
  1. Identificar en el código la llamada `supabase.auth.exchangeCodeForSession(code)`.
  2. Documentar la condición que determina si un usuario debe ser enviado a la pantalla de completar perfil.

#### Adaptación futura
Independientemente de si el proveedor backend es SupabaseAuth, Auth0, Firebase Auth o una solución propia en OAuth2/OIDC, el intercambio de códigos y la persistencia mediante cookies seguras en Next.js sigue exactamente las mismas especificaciones RFC.

---

### Lección 6.2: Protección de Rutas con Middleware y RLS en PostgreSQL

#### Objetivos de aprendizaje
- Implementar interceptores de peticiones HTTP globales usando el `middleware.ts` de Next.js.
- Proteger rutas privadas (`/registro`, `/historial`, `/perfil`) redirigiendo usuarios no autenticados a `/login`.
- Entender el concepto de **Row Level Security (RLS)** en PostgreSQL para aislamiento de datos entre usuarios.

#### Explicación conceptual
Como desarrollador SQL, conoces los permisos tradicionales a nivel de tabla (`GRANT SELECT ON series TO rol`). **Row Level Security (RLS)** en PostgreSQL va un paso más allá: filtra las filas individuales que un usuario puede consultar o modificar basándose en su ID de sesión (`auth.uid()`).

En Next.js, la primera línea de defensa en la aplicación es el **Middleware** (`middleware.ts`). Este archivo se ejecuta en el Edge Server *antes* de que cualquier petición alcance una página o API route. Inspecciona la cookie de sesión de Supabase:
- Si el usuario no tiene sesión e intenta acceder a `/historial`, el middleware lo redirige inmediatamente a `/login`.
- Si el usuario ya tiene sesión e intenta ir a `/login`, lo redirige a la aplicación principal (`/`).

```
Petición HTTP a /historial
           │
           ▼
   [ middleware.ts ] ─── ¿Tiene Cookie de Sesión Válida? ───┐
           │                                                │
          SÍ                                               NO
           │                                                │
           ▼                                                ▼
 Renderiza /historial                               Redirige a /login
```

#### Ejemplo contextualizado
Ejemplo de Middleware para refrescar sesión y proteger rutas:

```typescript
// src/middleware.ts (ejemplo conceptual extendido)
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            respuesta.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const esRutaProtegida = request.nextUrl.pathname.startsWith('/historial') || 
                          request.nextUrl.pathname.startsWith('/perfil') ||
                          request.nextUrl.pathname.startsWith('/registro');

  if (esRutaProtegida && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return respuesta;
}

export const config = {
  matcher: ['/historial/:path*', '/perfil/:path*', '/registro/:path*', '/login'],
};
```

Política RLS en PostgreSQL para la tabla `series`:
```sql
-- Política real RLS en Postgres
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios solo ven sus propias series"
ON series FOR SELECT
USING (
  sesion_id IN (
    SELECT sesion_id FROM sesiones WHERE usuario_id = (
      SELECT usuario_id FROM usuarios WHERE usuario_uuid = auth.uid()
    )
  )
);
```

#### Ejercicio práctico obligatorio
- **Tarea:** Activar la protección de rutas en `src/middleware.ts` para que cualquier intento de ingresar a `/historial` o `/perfil` sin estar autenticado redirija automáticamente a `/login`.
- **Archivos a modificar:** [src/middleware.ts](file:///c:/Git/personal/MacrOS/src/middleware.ts)
- **Criterios de aceptación:**
  1. El matcher del middleware cubre las rutas protegidas.
  2. Probar en una ventana de incógnito del navegador: navegar directamente a `http://localhost:3000/historial` debe forzar la redirección a `/login`.

#### Adaptación futura
El uso de Middlewares HTTP e inspección de JWTs es la base del control de acceso en cualquier arquitectura web (sea NestJS, Spring Boot o Next.js). Comprender RLS traslada la responsabilidad de filtrado de seguridad a la base de datos, haciendo tu aplicación inmune a fugas de datos en la capa API.

---

## Fase 7: Construcción de Funcionalidades Pendientes del Proyecto

### Lección 7.1: Pantalla de Historial (`/historial`) y Agrupación de Datos

#### Objetivos de aprendizaje
- Consultar peticiones a Route Handlers para obtener el historial de entrenamientos.
- Transformar y agrupar arreglos planos de series y sesiones mediante JavaScript/TypeScript funcional (`reduce`, `groupBy`).
- Formatear fechas y pesos dinámicamente según la preferencia del usuario (`kg`/`lbs`).

#### Explicación conceptual
En consultas SQL avanzadas suele usarse `GROUP BY` o `JSON_AGG` para agrupar series por sesión o por ejercicio. En el frontend, frecuentemente recibimos datos en estructuras planas desde la API (ej. un arreglo de series) y necesitamos transformarlos en objetos jerárquicos para representarlos visualmente:

```
[Datos Planos API]                           [Estructura UI Agrupada]
- Serie 1 (Press Pecho)           ──►         Press Pecho:
- Serie 2 (Press Pecho)                        ├─ Serie 1: 80kg x 10
- Serie 3 (Aperturas)                          └─ Serie 2: 85kg x 8
                                              Aperturas:
                                               └─ Serie 3: 40kg x 12
```

Para construir la pantalla `/historial`, consumiremos el endpoint `GET /api/sesiones?usuario_id=X` y `GET /api/series?sesion_id=Y`, integrando el store de Zustand para presentar los pesos en la unidad elegida.

#### Ejemplo contextualizado
Helper de agrupación de series por ejercicio en TypeScript:

```typescript
import { Serie } from '@/types';

export interface EjercicioAgrupado {
  ejercicioId: number;
  nombreEjercicio: string;
  series: Serie[];
}

export function agruparSeriesPorEjercicio(series: (Serie & { ejercicios?: { nombre: string } })[]): EjercicioAgrupado[] {
  const mapa = new Map<number, EjercicioAgrupado>();

  series.forEach((serie) => {
    const ejId = serie.ejercicio_id;
    const nombre = serie.ejercicios?.nombre || `Ejercicio #${ejId}`;

    if (!mapa.has(ejId)) {
      mapa.set(ejId, { ejercicioId: ejId, nombreEjercicio: nombre, series: [] });
    }

    mapa.get(ejId)!.series.push(serie);
  });

  return Array.from(mapa.values());
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Desarrollar completamente la vista de la pantalla `/historial` (`src/app/historial/page.tsx`). Debe consultar las sesiones pasadas del usuario activo desde `/api/sesiones`, obtener sus series y listar las tarjetas de sesión ordenadas cronológicamente de forma descendente.
- **Archivos a crear/modificar:** `src/app/historial/page.tsx`, `src/app/historial/historial.module.css`
- **Criterios de aceptación:**
  1. Muestra un estado de carga mientras se obtienen los datos.
  2. Si no hay sesiones, muestra un mensaje descriptivo ("Aún no has registrado ninguna sesión").
  3. Muestra cada sesión con su fecha formateada, notas y las series correspondientes agrupadas.
  4. Los pesos mostrados respetan la unidad activa en `usePreferenciasStore`.

#### Adaptación futura
El patrón de transformar datos planos backend en modelos optimizados para UI es una habilidad core en desarrollo frontend. Si la API en el futuro evoluciona a GraphQL o gRPC, la lógica de presentación y agrupación permanecerá prácticamente idéntica.

---

### Lección 7.2: Timer de Descanso con Web Audio API y Vibration API

#### Objetivos de aprendizaje
- Crear componentes interactivos basados en el tiempo utilizando `setInterval` y estado de React.
- Integrar la **Web Audio API** para generar tonos sintéticos (beeps) sin depender de archivos de audio externos `.mp3`.
- Utilizar la **Vibration API** (`navigator.vibrate`) para brindar retroalimentación háptica en dispositivos móviles.

#### Explicación conceptual
Las PWA modernas pueden interactuar con el hardware del dispositivo casi al mismo nivel que una aplicación nativa. Para el temporizador de descanso entre series, necesitamos alertar al usuario cuando su tiempo de recuperación ha finalizado, incluso si no está mirando la pantalla en ese instante.

1. **Web Audio API:** Permite sintetizar sonidos en tiempo real mediante un `AudioContext` y un oscilador. Generamos una onda senoidal de 800Hz durante 200ms para producir un "beep" limpio sin necesidad de descargar archivos.
2. **Vibration API:** Permite hacer vibrar el teléfono móvil pasando un patrón de milisegundos (`navigator.vibrate([200, 100, 200])`).

```
   Timer llega a 00:00
            │
            ├─► Sintetizador Web Audio API ──► Emite Sonido Beep (800Hz)
            │
            └─► Vibration API Mobile ────────► Dispara Vibración Hardware
```

#### Ejemplo contextualizado
Componente `Timer` reutilizable:

```tsx
// src/components/Timer/index.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from './timer.module.css';

interface TimerProps {
  segundosIniciales: number;
  onFinalizado?: () => void;
}

export function Timer({ segundosIniciales, onFinalizado }: TimerProps) {
  const [tiempoRestante, setTiempoRestante] = useState(segundosIniciales);
  const [corriendo, setCorriendo] = useState(false);

  // Sintetizador de sonido con Web Audio API
  const emitirBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
      osc.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3); // 300ms de duración
    } catch (e) {
      console.log('AudioContext no soportado o bloqueado por el usuario');
    }
  };

  const dispararVibracion = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([300, 100, 300]); // Vibrar - Pausa - Vibrar
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (corriendo && tiempoRestante > 0) {
      interval = setInterval(() => setTiempoRestante((prev) => prev - 1), 1000);
    } else if (tiempoRestante === 0 && corriendo) {
      setCorriendo(false);
      emitirBeep();
      dispararVibracion();
      if (onFinalizado) onFinalizado();
    }
    return () => clearInterval(interval);
  }, [corriendo, tiempoRestante]);

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;

  return (
    <div className={styles.contenedorTimer}>
      <span className={styles.display}>
        {String(minutos).padStart(2, '0')}:{String(segundos).padStart(2, '0')}
      </span>
      <button onClick={() => setCorriendo(!corriendo)}>
        {corriendo ? 'Pausar' : 'Iniciar Timer'}
      </button>
    </div>
  );
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Crear el componente `Timer` en `src/components/Timer/index.tsx` e integrarlo en la pantalla `/registro`. Debe activarse automáticamente cuando el usuario guarda exitosamente una serie o presiona el botón "Listo / Iniciar Descanso".
- **Archivos a crear/modificar:** `src/components/Timer/index.tsx`, `src/components/Timer/timer.module.css`, `src/app/registro/page.tsx`
- **Criterios de aceptación:**
  1. El temporizador descuenta el tiempo segundo a segundo.
  2. Al llegar a cero, reproduce el tono Web Audio y dispara la vibración en móviles.
  3. Ofrece botones para sumar +30 segundos o reiniciar el tiempo.

#### Adaptación futura
El uso de Web APIs estándar (como AudioContext y Vibration API) garantiza la máxima portabilidad. El mismo código funcionará sin cambios en cualquier sitio web moderno, PWA o contenedor WebView (como Capacitor o Cordova).

---

### Lección 7.3: Perfil de Usuario (`/perfil` y `/perfil/completar`), Rachas y Finalización

#### Objetivos de aprendizaje
- Conectar los endpoints de actualización de perfil y finalización de sesión (`PATCH /api/sesiones`).
- Presentar métricas de usuario (racha actual de semanas entrenadas, racha máxima, total de series).
- Implementar la pantalla `/perfil/completar` para el onboarding de nuevos usuarios tras registrarse vía OAuth.

#### Explicación conceptual
El cierre del ciclo de un entrenamiento requiere finalizar la sesión en la base de datos. La API del proyecto calcula la racha del usuario en `PATCH /api/sesiones` verificando que exista al menos una serie completada antes de incrementar las estadísticas.

La interfaz de Perfil (`/perfil`) actúa como el panel de control del deportista:
1. Muestra los datos de la tabla `usuarios` (`nombre`, `apellido_paterno`, `racha_actual`, `racha_maxima`).
2. Permite editar las preferencias globales (unidades `kg`/`lbs`).
3. La sub-pantalla `/perfil/completar` sirve como formulario obligatorio post-registro OAuth si el proveedor no retornó apellidos o datos de perfil completos.

```
       [Completar Serie] ──► [Presionar "Finalizar Sesión"]
                                      │
                                      ▼
                        PATCH /api/sesiones (Backend)
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
 Actualiza `finalizado_en` y `duracion`        Ejecuta `actualizarRacha()`
                                               Calcula y actualiza racha
```

#### Ejemplo contextualizado
Consumo del endpoint de finalizar sesión en el cliente React:

```typescript
// En src/lib/api/sesiones.ts (o directamente en el componente)
import { FinalizarSesionDTO, ApiResult, Sesion } from '@/types';

export async function finalizarSesion(dto: FinalizarSesionDTO): Promise<ApiResult<Sesion>> {
  const respuesta = await fetch('/api/sesiones', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  return await respuesta.json();
}
```

#### Ejercicio práctico obligatorio
- **Tarea:** Crear las pantallas `src/app/perfil/page.tsx` y `src/app/perfil/completar/page.tsx`. Añadir en `/registro` el botón final "Finalizar Entrenamiento" que llame a `PATCH /api/sesiones` y redirija a `/historial` tras completar.
- **Archivos a crear/modificar:** `src/app/perfil/page.tsx`, `src/app/perfil/completar/page.tsx`, `src/app/registro/page.tsx`
- **Criterios de aceptación:**
  1. En `/perfil`, se muestra la racha actual con un ícono estético de fuego (🔥) y la racha máxima alcanzada.
  2. En `/perfil/completar`, un formulario permite ingresar Nombre y Apellidos llamando a `POST /api/usuarios`.
  3. El botón "Finalizar Entrenamiento" en `/registro` invalida la sesión activa y actualiza las estadísticas.

#### Adaptación futura
Toda la lógica pesada de negocio de rachas reside en el backend (`PATCH /api/sesiones`). Esta separación limpia asegura que si mañana desarrollas una app nativa en iOS (Swift) o Android (Kotlin), ambas consumirán el mismo endpoint y la lógica de negocio se mantendrá centralizada.

---

## Fase 8: Capacidades PWA e Integración Offline

### Lección 8.1: Web App Manifest, Workbox Service Worker y Cola de Sincronización

#### Objetivos de aprendizaje
- Configurar el Web App Manifest (`manifest.json`) con íconos e instrucciones de instalación para iOS/Safari y Android.
- Entender el ciclo de vida de un **Service Worker** (Instalación, Activación, Fetch).
- Implementar cache de recursos estáticos y una **Cola de Sincronización Offline** (*Background Sync*) para peticiones guardadas localmente.

#### Explicación conceptual
Una **PWA (Progressive Web App)** transforma un sitio web en una experiencia idéntica a una aplicación nativa. Sus dos pilares son:

1. **Web App Manifest (`manifest.json`):** Archivo JSON que describe el nombre de la app, colores de tema, modo de visualización (`standalone` para ocultar la barra de URL del navegador) e íconos de inicio. En iOS Safari se complementa con meta-tags especiales (`apple-mobile-web-app-capable`).
2. **Service Worker (SW):** Script que corre en un hilo secundario del navegador, separado de la interfaz gráfica. Actúa como un **Proxy de Red Programable**. Intercepta todas las peticiones HTTP que salen de la app:
   - **Cache First / Stale-While-Revalidate:** Sirve HTML, CSS y JS desde el cache local de inmediato para cargar al instante sin red.
   - **Offline Queue:** Si el usuario guarda una serie sin conexión a internet, la petición se guarda en una cola local en Dexie.js. Cuando el Service Worker o la ventana detectan que volvió la red (`window.addEventListener('online')`), vacía la cola enviando los registros pendientes a `/api/series`.

```
                    Navegador (Nivel Cliente)
                               │
                               ▼
                    [ SERVICE WORKER (Proxy) ]
                               │
              ┌────────────────┴────────────────┐
              │ ¿Hay Conexión a Internet?       │
              SÍ                                NO
              │                                 │
              ▼                                 ▼
   Servidor Remoto / API               Cache Local Workbox
                                       + Cola Sync Dexie
```

#### Ejemplo contextualizado
Configuración de `public/manifest.json`:

```json
{
  "short_name": "MacrOS",
  "name": "MacrOS PWA",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "/icons/icon-512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": "/",
  "background_color": "#000000",
  "theme_color": "#000000",
  "display": "standalone",
  "orientation": "portrait"
}
```

Registro del Service Worker en `src/app/layout.tsx`:

```tsx
// Script de registro dentro de layout.tsx
useEffect(() => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('Service Worker registrado:', reg.scope))
      .catch((err) => console.error('Error registrando Service Worker:', err));
  }
}, []);
```

#### Ejercicio práctico obligatorio
- **Tarea:** Crear el archivo `public/manifest.json` y configurar los meta-tags de PWA para iOS en `src/app/layout.tsx`. Crear una función de sincronización en `src/lib/bd/sync.ts` que escuche el evento `'online'` y sincronice las series guardadas localmente en Dexie que no tengan un `serie_id` remoto asignado.
- **Archivos a crear/modificar:** `public/manifest.json`, `src/app/layout.tsx`, `src/lib/bd/sync.ts`
- **Criterios de aceptación:**
  1. En las DevTools del navegador (pestaña Application -> Manifest), la app es reconocida como instalable con su nombre e íconos.
  2. `sync.ts` expone la función `sincronizarColaOffline()`.
  3. Simular modo Offline en DevTools, guardar una serie, reactivar la red y verificar que la serie se envía a la API remota automáticamente.

#### Adaptación futura
Workbox y los Service Workers son estándares W3C. Si el proyecto migra fuera de Next.js a una SPA independiente en Vite o React Native con WebView, la estrategia de manifest y la cola de sincronización offline con IndexedDB permanecerán 100% vigentes.

---

## Fase 9: Optimización, Producción y Despliegue

### Lección 9.1: Compilación de Producción, Auditoría PWA y Despliegue en Vercel

#### Objetivos de aprendizaje
- Compilar el proyecto para producción verificando la ausencia de errores de tipos TypeScript o linter (`npm run build`).
- Ejecutar auditorías de calidad y PWA usando Google Lighthouse en Chrome DevTools.
- Desplegar la aplicación en **Vercel** configurando correctamente las variables de entorno de Supabase.

#### Explicación conceptual
El comando `npm run dev` utiliza Turbopack para compilación bajo demanda, priorizando la velocidad del desarrollador. En cambio, `npm run build` realiza un análisis estático profundo:
- Verifica todos los tipos TypeScript del proyecto.
- Ejecuta ESLint.
- Pre-renderiza páginas estáticas (*SSG - Static Site Generation*).
- Optimiza y minifica los bundles de JavaScript y CSS.

Una vez que la compilación pasa limpiamente, la plataforma ideal para hospedar Next.js es **Vercel** (creadores del framework). Vercel despliega automáticamente los Route Handlers como Serverless Functions y sirve los archivos estáticos desde una red CDN global.

```
Código Git (GitHub) ──► Push a main ──► Vercel Build Server
                                              │
                                              ├─► Valida `npm run build`
                                              ├─► Inyecta Variables de Entorno
                                              └─► Despliega en URL SSL (.vercel.app)
```

#### Ejemplo contextualizado
Variables de entorno requeridas en el panel de Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsIn...
```

Comando de verificación local previa:

```bash
# Compilar proyecto simulando entorno de producción
npm run build

# Iniciar el servidor local en modo producción para probar la compilación
npm run start
```

#### Ejercicio práctico obligatorio
- **Tarea:** Ejecutar el proceso de compilación `npm run build` en la consola local. Corregir cualquier error de TypeScript o advertencia de ESLint que sea reportado. Abrir Chrome DevTools, ejecutar una auditoría de **Lighthouse** en la pestaña *Lighthouse* y anotar la puntuación en la categoría PWA.
- **Criterios de aceptación:**
  1. `npm run build` finaliza con éxito mostrando la lista de rutas generadas en la consola sin fallos.
  2. `npm run start` permite navegar por toda la app localmente en modo producción.
  3. La auditoría de Lighthouse PWA cumple los requisitos de instalación (Manifest válido, HTTPS/localhost y Service Worker registrado).

#### Adaptación futura
Aunque Vercel ofrece la mejor integración nativa para Next.js, el resultado de `npm run build` se puede empaquetar en un contenedor **Docker** (utilizando el modo `standalone` de Next.js) y desplegarse en AWS ECS, DigitalOcean, Google Cloud Run o cualquier servidor Linux propio.

---

## Resumen del Progreso Esperado

Al finalizar este curso autodidacta, el estudiante habrá pasado de no conocer el ecosistema frontend moderno a dominar:
1. La arquitectura híbrida Servidor/Cliente de **Next.js 16 App Router**.
2. El tipado estricto con **TypeScript** aplicado a React y APIs.
3. La estilización modular con **CSS Modules** y estética brutalista.
4. La gestión de estado reactivo global con **Zustand** y local con **Dexie.js**.
5. La autenticación segura con **Supabase Auth** y **Middlewares**.
6. Las capacidades offline de una **PWA** completa lista para instalar en iOS y Android.
