import { Navigate, Outlet } from "react-router-dom";
import { authClient } from "@/shared/lib/auth";
import { Loading } from "@/shared/components";

export function ProtectedRoute() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Loading fullScreen text="Verificando sesión..." />;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
