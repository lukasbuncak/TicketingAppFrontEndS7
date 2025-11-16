import { Navigate, Outlet } from "react-router-dom";

// src/components/Admin/AdminGuard.jsx
import { useAdminAuth } from "../../auth/useAdminAuth";

export default function AdminGuard({ children }) {
  const { isAdmin, checking } = useAdminAuth();

  if (checking) {
    return <p className="text-center mt-4">Checking admin access…</p>;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;;
}
