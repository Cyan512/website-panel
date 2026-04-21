import { useCallback } from "react";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";

export function useApiError() {
  return useCallback((error: unknown, fallback = "Error inesperado") => {
    if (isHandledError(error)) return;
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      (error as { message?: string })?.message ||
      fallback;
    sileo.error({ title: message });
  }, []);
}
