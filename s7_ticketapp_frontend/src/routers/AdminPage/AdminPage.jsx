// src/routers/AdminPage/AdminPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { msalInstance } from "../../auth/msalInstance";
import adminAPI from "../../api/adminAPI";

export default function AdminPage() {
  const navigate = useNavigate();

  // ---- admin identity (decoded from Entra ID JWT) ----
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const payload = jwtDecode(token);
      setAdminInfo({
        name: payload.name || payload.given_name || payload.unique_name || "",
        email: payload.upn || payload.unique_name || "",
        roles: payload.roles || [],
      });
    } catch (e) {
      console.warn("Failed to decode admin token", e);
      setAdminInfo(null);
    }
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem("admin_access_token");
    sessionStorage.removeItem("admin_access_token");

    try {
      await msalInstance.logoutPopup({
        postLogoutRedirectUri: window.location.origin + "/login",
      });
    } catch (e) {
      console.warn("MSAL logout failed, falling back to navigation", e);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  // ---- page state ----
  const [mode, setMode] = useState("create"); // 'create' | 'view'

  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);

  const [form, setForm] = useState({
    personalMail: "",
    firstName: "",
    lastName: "",
    personalId: "", // purely UI for now
  });

  const canSubmit = useMemo(
    () =>
      form.personalMail &&
      form.firstName &&
      form.lastName &&
      form.personalId,
    [form]
  );

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState("");

  // ---- search (by numeric userId for now) ----
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!search.trim()) {
        setOptions([]);
        return;
      }

      try {
        const results = await adminAPI.searchStudents(search);
        if (!cancelled) setOptions(results);
      } catch (e) {
        if (!cancelled) setOptions([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [search]);

  // ---- load one student by ID ----
  const loadStudent = async (id) => {
    setError("");
    setLoading(true);
    try {
      const data = await adminAPI.getStudentById(id);
      const displayName = data.displayName || "";
      const [firstName, ...rest] = displayName.split(" ");
      const lastName = rest.join(" ");

      setStudent({
        id, // path variable is the id
        firstName: firstName || displayName,
        lastName: lastName,
        schoolMail: data.schoolEmail,
        status: data.status,
        personalId: data.personalEmail, // temp mapping from backend
      });
      setMode("view");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Failed to load student"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---- create student ----
  const onCreateSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSavingCreate(true);
    setError("");

    try {
      const created = await adminAPI.createStudent(form);
      const displayName = created.displayName || "";
      const [firstName, ...rest] = displayName.split(" ");
      const lastName = rest.join(" ");

      // After creation we don't know DB id yet (it’s not in AdminUserResponse),
      // so we just show the created user info without ID.
      setStudent({
        id: "(not returned)",
        firstName: firstName || displayName,
        lastName: lastName,
        schoolMail: created.schoolEmail,
        status: created.status,
        personalId: form.personalId,
        tempPassword: created.tempPassword,
      });
      setMode("view");
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Failed to create student"
      );
    } finally {
      setSavingCreate(false);
    }
  };

  // ---- save status change ----
  const saveStatus = async () => {
    if (!student || student.id === "(not returned)") {
      setError("Cannot update status: user id is unknown.");
      return;
    }
    setSavingStatus(true);
    setError("");

    try {
      const updated = await adminAPI.updateStudentStatus(
        student.id,
        student.status
      );
      setStudent((s) =>
        s
          ? {
              ...s,
              status: updated.status,
            }
          : s
      );
    } catch (e) {
      console.error(e);
      setError(
        e.response?.data?.message || e.message || "Failed to update status"
      );
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <div className="container py-4">
      {/* top bar with admin info + logout */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0">Admin portal</h3>
          {adminInfo && (
            <small className="text-muted">
              Signed in as {adminInfo.name || adminInfo.email}
              {adminInfo.roles?.length
                ? ` · Roles: ${adminInfo.roles.join(", ")}`
                : null}
            </small>
          )}
        </div>

        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </div>

      <div className="row g-4">
        {/* LEFT: actions + search */}
        <aside className="col-12 col-md-5 col-lg-4 col-xl-3">
          <div className="d-grid gap-3">
            <button
              type="button"
              className={`btn ${
                mode === "create"
                  ? "btn-outline-danger"
                  : "btn-outline-secondary"
              }`}
              onClick={() => setMode("create")}
            >
              Create a student
            </button>

            <div className="card">
              <div className="card-body">
                <label className="form-label fw-semibold">
                  Search a student (ID for now)
                </label>

                <input
                  className="form-control"
                  placeholder="Type user id…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {options.length > 0 && (
                  <div className="list-group mt-2">
                    {options.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className="list-group-item list-group-item-action"
                        onClick={() => loadStudent(opt.id)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT: main panel */}
        <main className="col-12 col-md-7 col-lg-8 col-xl-9">
          <div className="card">
            <div className="card-body">
              {mode === "create" ? (
                <>
                  <h5 className="card-title mb-3">
                    Create a Student account
                  </h5>

                  {error && (
                    <div className="alert alert-danger py-2">{error}</div>
                  )}

                  <form onSubmit={onCreateSubmit} className="vstack gap-3">
                    <input
                      className="form-control form-control-lg"
                      placeholder="personal mail"
                      type="email"
                      value={form.personalMail}
                      onChange={(e) =>
                        setForm({ ...form, personalMail: e.target.value })
                      }
                      required
                    />

                    <input
                      className="form-control form-control-lg"
                      placeholder="firstName"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm({ ...form, firstName: e.target.value })
                      }
                      required
                    />

                    <input
                      className="form-control form-control-lg"
                      placeholder="lastName"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm({ ...form, lastName: e.target.value })
                      }
                      required
                    />

                    <input
                      className="form-control form-control-lg"
                      placeholder="Personal Identification"
                      value={form.personalId}
                      onChange={(e) =>
                        setForm({ ...form, personalId: e.target.value })
                      }
                      required
                    />

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={!canSubmit || savingCreate}
                      >
                        {savingCreate ? "Creating…" : "Create"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setForm({
                            personalMail: "",
                            firstName: "",
                            lastName: "",
                            personalId: "",
                          })
                        }
                        disabled={savingCreate}
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="card-title mb-0">Student Information</h5>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setMode("create")}
                    >
                      + New student
                    </button>
                  </div>

                  {loading && <p className="mb-0">Loading…</p>}
                  {error && (
                    <div className="alert alert-danger py-2">{error}</div>
                  )}

                  {student && !loading && (
                    <div className="vstack gap-3">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Name</label>
                          <input
                            className="form-control"
                            value={`${student.firstName} ${student.lastName}`}
                            disabled
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">School mail</label>
                          <input
                            className="form-control"
                            value={student.schoolMail}
                            disabled
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">User ID</label>
                          <input
                            className="form-control"
                            value={student.id}
                            disabled
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={student.status}
                            onChange={(e) =>
                              setStudent((s) => ({
                                ...s,
                                status: e.target.value,
                              }))
                            }
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="DISABLED">Disabled</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Personal Id</label>
                          <input
                            className="form-control"
                            value={student.personalId || ""}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="mt-3">
                        <button
                          className="btn btn-primary"
                          onClick={saveStatus}
                          disabled={savingStatus}
                        >
                          {savingStatus ? "Saving…" : "Save changes"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
