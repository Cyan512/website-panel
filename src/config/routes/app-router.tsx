import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loading } from "@/shared/components";
import Sidebar from "@/shared/layout/Sidebar";

import { authRoutes, ProtectedRoute } from "@/features/auth";
import { dashboardRoutes } from "@/features/dashboard";
import { reservationsRoutes } from "@/features/reservations";
import { roomsRoutes } from "@/features/rooms";
import { clientsRoutes } from "@/features/clients";
import { paymentsRoutes } from "@/features/payments";
import { ratesRoutes } from "@/features/rates";
import { channelsRoutes } from "@/features/channels";
import { profileRoutes } from "@/features/profile";
import { settingsRoutes } from "@/features/settings";
import { productsRoutes } from "@/features/products";
import { foliosRoutes } from "@/features/folios";
import { furnitureRoutes } from "@/features/furniture";
import { barSuppliesRoutes } from "@/features/bar-supplies";
import { kitchenSuppliesRoutes } from "@/features/kitchen-supplies";
import { promotionsRoutes } from "@/features/promotions";

import type { RouteConfig } from "@/app/routes";

const protectedRoutes: RouteConfig[] = [
  ...dashboardRoutes,
  ...reservationsRoutes,
  ...roomsRoutes,
  ...clientsRoutes,
  ...paymentsRoutes,
  ...ratesRoutes,
  ...channelsRoutes,
  ...profileRoutes,
  ...settingsRoutes,
  ...productsRoutes,
  ...foliosRoutes,
  ...furnitureRoutes,
  ...barSuppliesRoutes,
  ...kitchenSuppliesRoutes,
  ...promotionsRoutes,
];

export const routes: RouteConfig[] = [
  ...authRoutes,
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [{ path: "/", element: <Sidebar />, children: protectedRoutes }],
  },
  { path: "*", element: <Navigate to="/" replace /> },
];

function renderRoutes(routeConfigs: RouteConfig[]) {
  return routeConfigs.map((route, index) => (
    <Route key={route.path + index} path={route.path} element={<Suspense fallback={<Loading fullScreen />}>{route.element}</Suspense>}>
      {route.children && renderRoutes(route.children)}
    </Route>
  ));
}

export function AppRouter() {
  return <Routes>{renderRoutes(routes)}</Routes>;
}
