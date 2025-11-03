// src/routers/Student/components/attachments/AttachmentList.jsx
// shows only if items.length > 0 (parent already checks)
export default function AttachmentList({ items, ticketId }) {
    const badge = (scan) => {
      switch ((scan || "").toUpperCase()) {
        case "CLEAN": return <span className="badge text-bg-success">Clean</span>;
        case "PENDING": return <span className="badge text-bg-secondary">Pending scan</span>;
        case "QUARANTINED": return <span className="badge text-bg-danger">Quarantined</span>;
        default: return <span className="badge text-bg-light">Unknown</span>;
      }
    };
  
    const formatSize = (n) => {
      if (n < 1024) return `${n} B`;
      if (n < 1024 * 1024) return `${(n/1024).toFixed(1)} KB`;
      return `${(n/1024/1024).toFixed(1)} MB`;
      };
  
    return (
      <div className="mb-3">
        <div className="mb-2 fw-semibold">
          Attachments <span className="text-muted">({items.length})</span>
        </div>
        <ul className="list-group">
          {items.map(a => (
            <li key={a.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="me-3">
                <div className="fw-semibold">{a.originalName}</div>
                <div className="small text-muted">{a.contentType} • {formatSize(a.sizeBytes)}</div>
              </div>
              <div className="d-flex align-items-center gap-2">
                {badge(a.scanStatus)}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={String(a.scanStatus).toUpperCase() !== "CLEAN"}
                  onClick={() => {
                    // call TicketAPI.downloadAttachment(ticketId, a.id) later
                  }}
                  title={String(a.scanStatus).toUpperCase() !== "CLEAN"
                    ? "File not available yet"
                    : "Download"}
                >
                  Download
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  