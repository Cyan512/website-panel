import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import environment from "@/environments/environment";

export const authClient = createAuthClient({
  baseURL: environment.app.apiEndpoint,
  plugins: [
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          required: false,
        },
      },
    }),
  ],
});
