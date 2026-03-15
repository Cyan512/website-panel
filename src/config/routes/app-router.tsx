import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { routes, type RouteConfig } from '@/config/routes/routes'

function renderRoutes(routeConfigs: RouteConfig[]) {
    return routeConfigs.map((route, index) => (
        <Route
            key={route.path + index}
            path={route.path}
            element={
                <Suspense fallback={<div>loading...</div>}>
                    {route.element}
                </Suspense>
            }
        >
            {route.children && renderRoutes(route.children)}
        </Route>
    ))
}

export function AppRouter() {
    return (
        <Routes>
            {renderRoutes(routes)}
        </Routes>
    )
}