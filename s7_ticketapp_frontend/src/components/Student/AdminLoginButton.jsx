// src/components/Student/AdminLoginButton.jsx
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAdminAuth } from "../../auth/useAdminAuth";

export default function AdminLoginButton() {
  const { login, loading, error, isAuthenticated, isAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const onClick = () => {
    // if already admin, just go there
    if (isAdmin) {
      navigate("/admin", { replace: true });
    } else {
      login();
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isAdmin && !loading) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);


  useEffect(() => {
    if (isAdmin && !loading) {
      navigate("/admin", { replace: true });
    }
  }, [isAdmin, loading, navigate]);

  
  return (
    <div className="text-center my-4">
      <p className="mb-2 fw-semibold">Staff / administrators:</p>

      <button
        type="button"
        className="btn btn-outline-primary px-4 py-2"
        disabled={loading}
        onClick={onClick}
      >
        {loading ? "Signing in…" : "Sign in with Microsoft (Admin)"}
      </button>

      {error && (
        <div className="text-danger mt-3">
          {error}
        </div>
      )}

      {isAuthenticated && !isAdmin && !error && (
        "Sign in with Microsoft (Admin)"
      )}
    </div>
  );
}
