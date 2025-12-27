// src/routers/Login/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthAPI from "../../api/AuthAPI";
import AdminLoginButton from "../../components/Student/AdminLoginButton";

export default function Login() {
  const [form, setForm] = useState({ schoolEmail: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const [step, setStep] = useState("PASSWORD"); // "PASSWORD" | "MFA"
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const navigate = useNavigate();

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErr("");
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const result = await AuthAPI.login(form);

      if (result.status === "OK") {
        // No MFA required
        navigate("/home", { replace: true, state: { openNew: true } });
      } else if (result.status === "MFA_REQUIRED") {
        setMfaToken(result.mfaToken);
        setStep("MFA");
      } else {
        setErr("Unexpected login response.");
      }
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  const submitMfa = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(mfaCode)) {
      setErr("Enter a valid 6-digit authentication code.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await AuthAPI.verifyMfaLogin({ mfaToken, code: mfaCode });
      navigate("/home", { replace: true, state: { openNew: true } });
    } catch (e) {
      setErr(e.message || "MFA verification failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-4 mx-auto" style={{ maxWidth: 420 }}>
      {step === "PASSWORD" && (
        <form onSubmit={submitPassword}>
          <div className="mb-3">
            <label htmlFor="schoolEmail" className="form-label">
              School Email
            </label>
            <input
              id="schoolEmail"
              name="schoolEmail"
              type="email"
              className="form-control"
              value={form.schoolEmail}
              onChange={change}
              placeholder="s1@fontys.nl"
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={change}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </div>

          {err && <div className="alert alert-danger">{err}</div>}

          <button type="submit" className="btn btn-primary w-100" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>

          <div className="mt-4 pt-3 border-top text-center">
            <p className="text-muted small mb-2">Staff / administrators:</p>
            <AdminLoginButton />
          </div>
        </form>
      )}

      {step === "MFA" && (
        <form onSubmit={submitMfa}>
          <h5 className="mb-3">Multi-Factor Authentication</h5>
          <p className="text-muted small mb-3">
            Enter the 6-digit code from your authenticator app to complete sign-in.
          </p>

          <div className="mb-3">
            <label htmlFor="mfaCode" className="form-label">
              Authentication code
            </label>
            <input
              id="mfaCode"
              type="text"
              className="form-control"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              inputMode="numeric"
              required
            />
          </div>

          {err && <div className="alert alert-danger">{err}</div>}

          <button type="submit" className="btn btn-primary w-100" disabled={busy}>
            {busy ? "Verifying…" : "Verify & sign in"}
          </button>

          <button
            type="button"
            className="btn btn-link w-100 mt-2"
            disabled={busy}
            onClick={() => {
              setStep("PASSWORD");
              setMfaToken("");
              setMfaCode("");
              setErr("");
            }}
          >
            Back to password
          </button>
        </form>
      )}
    </div>
  );
}
