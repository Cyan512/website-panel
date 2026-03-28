/**
 * Retorna true si el error ya fue manejado por el interceptor de axios
 * (ya se mostró una notificación), para evitar mostrar un mensaje genérico encima.
 */
export function isHandledError(error: unknown): boolean {
  return !!(error as { handled?: boolean })?.handled;
}
