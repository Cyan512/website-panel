import { createAuthClient } from "better-auth/react";
import environment from "@/environments/environment";

export const authClient = createAuthClient({
  baseURL: environment.app.apiEndpoint,
});
