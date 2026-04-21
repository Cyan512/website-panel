# AGENTS.md — Website Panel

## Arquitectura: Vertical Slicing

Este proyecto usa **Vertical Slicing** (también conocido como Feature-Based Architecture). Cada feature es autocontenida y expone una API pública mínima.

## Estructura de carpetas

```
src/
  app/              → wiring, routing assembly, global providers
    routes.tsx      → RouteConfig type definition
  features/         → cada dominio de negocio es un slice vertical
    <feature>/
      routes.tsx    → declaración de rutas del feature (lazy pages)
      index.ts      → API pública: re-exporta routes, api, hooks, types
      api.ts        → cliente API (axios) del feature
      hooks/        → hooks privados del feature
      types/        → tipos privados del feature
      components/   → componentes privados del feature
  shared/           → design system, utilities, layout, lib cross-cutting
    components/ui/  → Button, Card, Modal, Input, Badge, Spinner, EmptyState
    layout/         → Sidebar, AppShell
    lib/            → axios instance, auth client config
    utils/          → cn, formatters, error helpers
    hooks/          → hooks globales (useApiError)
    types/          → tipos globales cross-feature
```

## Reglas de imports

1. **Un slice NO importa lógica de otro slice.**
   - Prohibido: `import { useX } from "@/features/other/hooks"`
   - Permitido: `import type { X } from "@/features/other/types"` (types-only es aceptable)
2. **Shared puede ser importado por cualquiera.**
3. **Cada feature expone solo su `index.ts`.** Los consumidores deben usar: `import { featureRoutes } from "@/features/feature"`.
4. **Las rutas se co-ubican.** Cada feature define sus rutas en `routes.tsx`; `app-router.tsx` solo las ensambla.

## Design System (shared/components/ui)

- **Button**: variantes `primary | secondary | danger | ghost | outline`, tamaños `sm | md | lg`, `isLoading`, `leftIcon`, `rightIcon`.
- **Card**: `Card`, `CardHeader`, `CardBody`, `CardFooter`. Soporte `hoverable`.
- **Modal**: `Modal` + `ModalFooter`. Focus trap con `Escape` para cerrar, `backdrop-blur`.
- **InputField**: `label`, `error`, `hint`, `icon` (posicionado absoluto).
- **Badge**: `default | success | warning | danger | info | outline`.
- **Spinner / Loading**: `Loading` soporta `fullScreen` y `text`.
- **EmptyState**: `icon`, `title` (alias `label`), `description`, `action`.

## CRUD UI Standard (páginas)

Objetivo: que **todas** las páginas CRUD se vean y se sientan consistentes (márgenes, paddings, tipografía, filtros, checkboxes, paginación), respetando la estética andina.

### Estructura de página

- **Layout base** (orden visual):
  - `PanelHeader` (title/subtitle + acción primaria).
  - `CrudToolbar` (búsqueda + filtros + selector de filas).
  - `ContentArea` (tabla o grid de cards/cuadros).
  - `Pagination` (footer uniforme).

### Create/Edit

- **Botón Create**: siempre en `PanelHeader.action`, a la derecha, variante primaria.
  - Texto estándar: `+ Nuevo ...` / `+ Nueva ...`.
- **Create/Edit**: por defecto en **Modal** (mismo patrón en todas las features).

### Listado: tabla vs cards

- **Reservas**: se mantiene como **tabla en filas**.
- **Default**: el resto de CRUDs debe ir en **cards/cuadros (grid)** cuando el dominio sea visual/estado (p. ej. habitaciones, muebles).
- CRUDs tabulares (p. ej. productos/pagos) pueden usar tabla, pero deben usar el mismo wrapper/toolbar/paginación.

### Filtros (búsqueda + checkbox)

- **Búsqueda**: usar `SearchInput` (dentro de `CrudToolbar`) con icono y placeholder claro.
- **Checkbox filters**: usar `Checkbox` shared para filtros por estado/categoría.
  - Si hay muchos estados, preferir un `CheckboxFilterGroup` (wrap) y mantener consistente spacing.
- **Regla de layout**:
  - Búsqueda a la izquierda (`flex-1`).
  - Filtros/chips a la derecha (wrap).
  - Selector de `limit` alineado al extremo derecho.

### Checkboxes

- Usar siempre el componente shared `Checkbox`:
  - Soporta `indeterminate` (select-all), `disabled`, `sm/md`.
  - Apariencia consistente (focus ring, border, tokens del theme).

### Tipografía (bump +1 en CRUD)

- En páginas CRUD, subir 1 step:
  - Toolbars: texto e inputs/selects en `text-base` (donde antes era `text-sm`).
  - Labels pequeños: `text-sm` (donde antes era `text-xs`).
- Sidebar y títulos principales no se modifican por defecto.

### Paleta / prohibiciones (refuerzo)

- Prohibido usar clases Tailwind genéricas para estados:
  - **NUNCA**: `amber-*`, `orange-*`, `red-*`, `blue-*`, `emerald-*`.
- Usar tokens andinos: `success`, `warning`, `danger`, `info`, `accent-*`, `bg-*-bg`, `text-*`.

## Routing

- Las rutas protegidas se declaran en cada `features/<feature>/routes.tsx`.
- `app-router.tsx` importa `featureRoutes` de cada `index.ts` y las ensambla en un array.
- `Sidebar` es el layout padre que renderiza `<Outlet />`.
- Todos los `Page` components son lazy-loaded con `React.lazy`.

## Data Fetching

- Se usa **axios plano** encapsulado en cada `features/<feature>/api.ts`.
- `shared/lib/axios.ts` contiene la instancia con interceptores (auth, errores, notificaciones).
- Cada hook de feature debe usar `AbortController` para cancelar requests al desmontar.
- `useApiError()` en `shared/hooks/use-api-error.ts` centraliza toast de errores no manejados.

## Tailwind v4 Tokens

El sistema usa CSS custom properties + `@theme` en `index.css`:
- `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-card`
- `--color-primary`, `--color-accent`
- `--color-text-primary`, `--color-text-muted`
- `--color-border`, `--color-success`, `--color-danger`

## Diseño y Estética Andina

La interfaz sigue una estética inspirada en los Andes: pergamino, rojo inca y oro andino. Todos los componentes deben mantener esta coherencia visual.

### Tipografía
- **Display / Títulos / h1, h2, h3**: `Cinzel` (Google Fonts CDN). Variable CSS: `--font-display`.
- **Body / UI / p, span, input, label**: `Crimson Pro` (Google Fonts CDN). Variable CSS: `--font-body`.
- **Regla**: Nunca usar `font-playfair`, `font-lora` u otras fuentes antiguas. Siempre usar `font-display` o dejar que `h1,h2,h3` hereden automáticamente.
- Google Fonts se cargan vía CDN en `index.html`.

### Paleta de colores (prohibido usar genéricos de Tailwind)
- **Éxito / Disponible / Confirmado**: `success` (`#059669`) — **NUNCA** `emerald-*`
- **Advertencia / Regular / Tentativo**: `warning` (`#b45309`) — **NUNCA** `amber-*` ni `orange-*`
- **Peligro / Cancelado / Dañado**: `danger` (`#b91c1c`) — **NUNCA** `red-*`
- **Información / En Casa**: `info` (`#475569`) — **NUNCA** `blue-*`
- **Énfasis dorado**: `accent` / `accent-primary` / `accent-light` — para detalles premium
- **Fondo**: `bg-primary` (pergamino), `bg-secondary` (gradiente sutil), `bg-card`
- **Texto**: `text-primary` (oscuro), `text-secondary`, `text-muted`
- **Bordes**: `border`, `border-light`

### Badges de estado
Siempre usar la paleta andina, nunca colores genéricos de Tailwind:
- Éxito: `bg-success-bg text-success` (o `badge-success`)
- Advertencia: `bg-warning-bg text-warning` (o `badge-warning`)
- Peligro: `bg-danger-bg text-danger` (o `badge-danger`)
- Info: `bg-info-bg text-info` (o `badge-info`)
- Inactivo/Neutro: `bg-bg-tertiary text-text-muted`

### Gradientes en tarjetas de stats
Usar siempre colores de la paleta andina con opacidad suave:
```
bg-gradient-to-br from-success/30 to-success-bg border border-success/20
bg-gradient-to-br from-info/30 to-info-bg border border-info/20
bg-gradient-to-br from-danger/30 to-danger-bg border border-danger/20
bg-gradient-to-br from-warning/30 to-warning-bg border border-warning/20
bg-gradient-to-br from-accent-primary/10 to-accent-light/10 border border-accent-primary/20
```

### Sidebar
- Fondo: gradiente oscuro con patrón geométrico sutil inspirado en textiles andinos (`bg-sidebar-pattern`).
- Item activo: indicador dorado deslizante en el borde izquierdo (`bg-accent-light`) + fondo sutil `bg-accent/10`.
- Item hover: `hover:bg-white/5` + micro-desplazamiento a la derecha.
- Logo: tipografía `Cinzel`, halo dorado sutil.
- Secciones: `font-display` en títulos de grupo.

### Sombras
Usar las sombras refinadas del sistema (definidas en `index.css`), nunca las genéricas de Tailwind:
- Cards: `shadow-sm` o `shadow-md` con opacidad reducida para fondos oscuros.
- Hover de cards: elevación sutil `-translate-y-0.5` + sombra más profusa.

### Animaciones
- Entrada escalonada de tarjetas: `animate-slide-up` con `animation-delay` inline.
- Indicador activo del sidebar: transición suave de 300ms.
- Hover de botones: `active:scale-[0.97]`.

## Cómo agregar una nueva feature

1. Crear `src/features/<feature>/`.
2. Crear `api.ts`, `types/`, `hooks/`, `components/`, `routes.tsx`, `index.ts`.
3. Exportar `featureRoutes` desde `routes.tsx`.
4. Importar `featureRoutes` en `src/config/routes/app-router.tsx` y agregarlo al array `protectedRoutes`.
5. Agregar items de navegación en `src/shared/layout/Sidebar.tsx`.

## Stack

- React 19 + TypeScript (strict)
- Vite + Tailwind CSS v4
- React Router v7
- better-auth
- axios
- sileo (toasts)
