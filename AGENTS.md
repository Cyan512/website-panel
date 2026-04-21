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
