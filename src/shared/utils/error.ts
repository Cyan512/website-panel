export function isHandledError(error: unknown): boolean {
  return !!(error as { handled?: boolean })?.handled;
}
