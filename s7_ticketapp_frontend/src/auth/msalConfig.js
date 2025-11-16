// src/auth/msalConfig.js
import { LogLevel } from "@azure/msal-browser";

const tenantId = "1e743d0a-729b-448b-ab6e-bcff5f10f1d4";
const clientId = "e227eb5d-cd0f-4a0c-acfe-cac97d5d8841";

const msalConfig = {
  auth: {
    clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          default:
            break;
        }
      },
    },
  },
};

export default msalConfig;

// scope that issues the API access token
export const apiScopes = [
  "api://36183832-e4bd-46f2-9156-bc9e1511f607/access_as_user",
];
