import { jwtDecode } from "jwt-decode";
// src/auth/useAdminAuth.js
import { useCallback, useEffect, useState } from "react";

import { msalInstance } from "./msalInstance";

export const ADMIN_STORAGE_KEY = "admin_access_token";
export const ADMIN_SCOPES = [
  "api://36183832-e4bd-46f2-9156-bc9e1511f607/access_as_user",
];

function decodeToken(token) {
  if (!token) {
    return { decoded: null, roles: [], expired: false };
  }

  try {
    const decoded = jwtDecode(token);
    const roles = decoded.roles || decoded["roles"] || [];

    const expMs = decoded.exp ? decoded.exp * 1000 : 0;
    const expired = expMs ? expMs < Date.now() : false;

    return { decoded, roles, expired };
  } catch {
    // invalid / tampered token
    return { decoded: null, roles: [], expired: true };
  }
}

export function useAdminAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(() =>
    localStorage.getItem(ADMIN_STORAGE_KEY)
  );

  const { decoded, roles, expired } = decodeToken(token);
  const isAuthenticated = !!token && !expired;
  const isAdmin = isAuthenticated && roles.includes("ADMIN");

  // --- LOGIN ----------------------------------------------------
  const login = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      const result = await msalInstance.acquireTokenPopup({
        scopes: ADMIN_SCOPES,
      });

      const accessToken = result.accessToken;

      localStorage.setItem(ADMIN_STORAGE_KEY, accessToken);
      setToken(accessToken); // trigger re-render
    } catch (e) {
      console.error(e);
      setError(e.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- LOGOUT ---------------------------------------------------
  const logout = useCallback(async () => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      setToken(null);

      await msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (e) {
      console.error("Admin logout error", e);
    }
  }, []);

  // --- INITIAL SYNC / EXPIRE HANDLING ---------------------------
  useEffect(() => {
    const stored = localStorage.getItem(ADMIN_STORAGE_KEY);

    if (!stored) {
      if (token) setToken(null);
      return;
    }

    const { expired: storedExpired } = decodeToken(stored);

    if (storedExpired) {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      if (token) setToken(null);
    } else if (!token) {
      setToken(stored);
    }
  }, [token]);

  return {
    loading,
    error,
    login,
    logout,
    token,
    isAuthenticated,
    isAdmin,
    decoded,
    roles,
    expired,
  };
}
