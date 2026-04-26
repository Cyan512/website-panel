import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import environment from "@/environments/environment";

export const authClient = createAuthClient({
  baseURL: environment.app.apiEndpoint,
  sessionOptions: {
    refetchOnWindowFocus: false,
  },
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
