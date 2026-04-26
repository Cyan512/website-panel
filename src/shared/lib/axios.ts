import axios from "axios";
import type { AxiosInstance } from "axios";
import environment from "@/environments/environment";
import { sileo } from "sileo";

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: environment.app.apiEndpoint,
  headers: { "Content-Type": undefined },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const message = response.data?.message;
    const isSuccess = response.data?.success !== false;

    if (message && MUTATING_METHODS.has(method ?? "")) {
      if (isSuccess) {
        sileo.success({ title: message });
      } else {
        sileo.error({ title: message });
        const err = new Error(message) as Error & { handled: boolean };
        err.handled = true;
        return Promise.reject(err);
      }
    }
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    const isHandled = (error as { handled?: boolean })?.handled;
    if (!isHandled) {
      const message =
        error?.response?.data?.message || error?.message || "Error inesperado";
      sileo.error({ title: message });
      if (error && typeof error === "object") {
        (error as { handled?: boolean }).handled = true;
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
