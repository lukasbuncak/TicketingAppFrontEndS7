import { useEffect, useMemo, useState } from "react";

/** Replace these with your real API calls */
const StudentAPI = {
  createStudent: async (payload) => {
    // return adminAPI.createStudent(payload)
    await new Promise(r => setTimeout(r, 400));
    return { id: crypto.randomUUID(), status: "ACTIVE", ...payload };
  },
  getStudentById: async (id) => {
    await new Promise(r => setTimeout(r, 250));
    return {
      id,
      firstName: "Ada",
      lastName: "Lovelace",
      schoolMail: "ada@school.edu",
      status: "ACTIVE",
    };
  },
  searchStudents: async (q) => {
    await new Promise(r => setTimeout(r, 200));
    // mock results – replace with backend search
    return [
      { id: "S-1001", label: "Ada Lovelace — ada@school.edu" },
      { id: "S-1002", label: "Alan Turing — alan@school.edu" },
    ].filter(x => x.label.toLowerCase().includes(q.toLowerCase()));
  },
};

export default function StudentsPage() {
  const [mode, setMode] = useState("create"); // 'create' | 'view'
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);

  // create form state
  const [form, setForm] = useState({
    personalMail: "",
    firstName: "",
    lastName: "",
    personalId: "",
  });
  const canSubmit = useMemo(() =>
    form.personalMail && form.firstName && form.lastName && form.personalId,
  [form]);

  // selected student
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --- search handling ---
  useEffect(() => {
    let on = true;
    (async () => {
      if (!search.trim()) { setOptions([]); return; }
      try {
        const found = await StudentAPI.searchStudents(search.trim());
        if (on) setOptions(found);
      } catch (e) {
        if (on) setOptions([]);
      }
    })();
    return () => { on = false; };
  }, [search]);

  const loadStudent = async (id) => {
    setError(""); setLoading(true);
    try {
      const data = await StudentAPI.getStudentById(id);
      setStudent(data);
      setMode("view");
    } catch (e) {
      setError(e.message || "Failed to load student");
    } finally {
      setLoading(false);
    }
  };

  const onCreateSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true); setError("");
    try {
      const created = await StudentAPI.createStudent(form);
      setStudent({
        id: created.id,
        firstName: created.firstName,
        lastName: created.lastName,
        schoolMail: created.personalMail, // map as needed
        status: "ACTIVE",
      });
      setMode("view");
    } catch (e) {
      setError(e.message || "Failed to create student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* LEFT: actions + search */}
        <aside className="col-12 col-md-5 col-lg-4 col-xl-3">
          <div className="d-grid gap-3">
            <button
              type="button"
              className={`btn ${mode === "create" ? "btn-outline-danger" : "btn-outline-secondary"}`}
              onClick={() => setMode("create")}
            >
              Create a student
            </button>

            <div className="card">
              <div className="card-body">
                <label className="form-label fw-semibold">
                  Search a student (school mail or id)
                </label>

                {/* simple search + results dropdown */}
                <input
                  className="form-control"
                  placeholder="Type name, mail, or id…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {options.length > 0 && (
                  <div className="list-group mt-2">
                    {options.map(opt => (
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
                  <h5 className="card-title mb-3">Create a Student account</h5>

                  {error && <div className="alert alert-danger py-2">{error}</div>}

                  <form onSubmit={onCreateSubmit} className="vstack gap-3">
                    <input
                      className="form-control form-control-lg"
                      placeholder="personal mail"
                      type="email"
                      value={form.personalMail}
                      onChange={(e) => setForm({ ...form, personalMail: e.target.value })}
                      required
                    />

                    <input
                      className="form-control form-control-lg"
                      placeholder="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />

                    <input
                      className="form-control form-control-lg"
                      placeholder="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />

                    <input
                      className="form-control form-control-lg"
                      placeholder="Personal Identification"
                      value={form.personalId}
                      onChange={(e) => setForm({ ...form, personalId: e.target.value })}
                      required
                    />

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={!canSubmit || saving}
                      >
                        {saving ? "Creating…" : "Create"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setForm({ personalMail: "", firstName: "", lastName: "", personalId: "" })}
                        disabled={saving}
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
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setMode("create")}>
                      + New student
                    </button>
                  </div>

                  {loading && <p className="mb-0">Loading…</p>}
                  {error && <div className="alert alert-danger py-2">{error}</div>}

                  {student && !loading && (
                    <div className="vstack gap-3">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">Name</label>
                          <input className="form-control" value={`${student.firstName} ${student.lastName}`} disabled />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">School mail</label>
                          <input className="form-control" value={student.schoolMail} disabled />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">School ID</label>
                          <input className="form-control" value={student.id} disabled />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Status</label>
                          <select
                            className="form-select"
                            value={student.status}
                            onChange={(e) => setStudent(s => ({ ...s, status: e.target.value }))}
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="DISABLED">Disabled</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <button className="btn btn-primary">Save changes</button>
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
