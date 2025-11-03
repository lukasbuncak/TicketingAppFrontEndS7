import { useEffect, useState } from "react";

export default function TicketEditor({ ticket, editable, onSubmit, busy }) {
  const [form, setForm] = useState({ title: "", description: "" });
  const isCreate = editable;

  useEffect(() => {
    setForm({
      title: ticket?.title ?? "",
      description: ticket?.description ?? "",
    });
  }, [ticket]);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (!isCreate) return;
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="border rounded-3 p-4 bg-white shadow-sm">
      <div className="text-muted mb-3">
        Status – <strong>{ticket?.status || "DRAFT"}</strong>
      </div>

      <form onSubmit={submit}>
        {/* Title */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Title</label>
          {isCreate ? (
            <input
              name="title"
              className="form-control p-3"
              value={form.title}
              onChange={change}
              placeholder="Give your ticket a short descriptive title"
              maxLength={160}
              required
              disabled={busy}
            />
          ) : (
            <div className="border rounded-3 bg-light p-3">{ticket?.title}</div>
          )}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Description</label>
          {isCreate ? (
            <textarea
              name="description"
              className="form-control p-3"
              style={{ minHeight: 280, lineHeight: 1.4, resize: "vertical" }}
              value={form.description}
              onChange={change}
              placeholder="Describe the issue in detail…"
              disabled={busy}
            />
          ) : (
            <div className="border rounded-3 bg-light p-3" style={{ minHeight: 240, lineHeight: 1.5 }}>
              {ticket?.description}
            </div>
          )}
        </div>

        {/* Attachments show only if present */}
        {Array.isArray(ticket?.attachments) && ticket.attachments.length > 0 && (
          <div className="mb-3">
            <span className="badge text-bg-light border me-2">Attachments</span>
            <ul className="list-unstyled mb-0">
              {ticket.attachments.map((a) => (
                <li key={a.id} className="small">📎 {a.originalName}</li>
              ))}
            </ul>
          </div>
        )}

        {isCreate && (
          <div className="d-flex justify-content-end">
            <button type="submit" disabled={busy} className="btn btn-primary px-4">
              {busy ? "Creating…" : "Create Ticket"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
