import axios from "axios";
import type { AxiosInstance } from "axios";
import environment from "@/environments/environment";
import { authClient } from "@/config/authClient";

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

export default axiosInstance;
