import { Navigate, Outlet, useLocation } from "react-router-dom";

import { isAuthenticated } from "../helpers/auth";

export function RequireAuth() {
  const loc = useLocation();
  return isAuthenticated()
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: loc }} />;
}

export function GuestOnly() {
  return isAuthenticated()
    ? <Navigate to="/home" replace />
    : <Outlet />;
}