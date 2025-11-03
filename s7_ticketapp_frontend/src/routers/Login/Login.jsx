import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthAPI from "../../api/AuthAPI";

export default function Login() {
  const [form, setForm] = useState({ schoolEmail: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErr("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await AuthAPI.login(form);
      // tell /home to open a fresh draft right away
      navigate("/home", { replace: true, state: { openNew: true } });
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-4 mx-auto" style={{ maxWidth: 420 }}>
      <div className="mb-3">
        <label htmlFor="schoolEmail" className="form-label">School Email</label>
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
        <label htmlFor="password" className="form-label">Password</label>
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
    </form>
  );
}
