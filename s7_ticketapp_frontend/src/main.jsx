import { MsalProvider } from "@azure/msal-react";
// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { msalInstance } from "./auth/msalInstance";

import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </StrictMode>
);
