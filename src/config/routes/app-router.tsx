import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { routes, type RouteConfig } from '@/config/routes/routes'
import { Loading } from '@/components'

function renderRoutes(routeConfigs: RouteConfig[]) {
    return routeConfigs.map((route, index) => (
        <Route
            key={route.path + index}
            path={route.path}
            element={
                <Suspense fallback={<Loading fullScreen />}>
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