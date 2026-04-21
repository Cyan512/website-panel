import { Navigate } from "react-router-dom";
import { authClient } from "@/shared/lib/auth";
import { Loading } from "@/shared/components";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Loading fullScreen text="Verificando sesión..." />;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
