import axios from "axios";
import type { AxiosInstance } from "axios";
import environment from "@/environments/environment";
import { authClient } from "@/config/authClient";
import { sileo } from "sileo";

// Métodos que modifican datos — mostramos el mensaje de éxito
const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

const axiosInstance: AxiosInstance = axios.create({
  baseURL: environment.app.apiEndpoint,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      throw new Error("No session");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Respuesta exitosa — muestra el message del backend en mutaciones
axiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const message = response.data?.message;

    if (message && MUTATING_METHODS.has(method ?? "")) {
      const isSuccess = response.data?.success !== false;
      if (isSuccess) {
        sileo.success({ title: message });
      }
    }

    return response;
  },
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Error inesperado";

    sileo.error({ title: message });

    return Promise.reject(error);
  },
);

export default axiosInstance;
